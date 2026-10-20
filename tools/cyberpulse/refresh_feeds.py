#!/usr/bin/env python3
"""Refresh OpenCyberPath CyberPulse headlines and site-freshness metadata.

Uses public RSS/official data endpoints, stores short excerpts only, removes author
fields by construction, and preserves last-known items when individual feeds fail.
Standard library only; no API keys required.
"""
from __future__ import annotations
import argparse
import hashlib
import html
from html.parser import HTMLParser
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse, urlunparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
WEBSITE = ROOT / "website"
FEED_PATH = WEBSITE / "public" / "data" / "cyberpulse-feed.json"
FRESHNESS_PATH = WEBSITE / "public" / "data" / "site-freshness.json"
LEDGER_PATH = WEBSITE / "public" / "data" / "content-review-ledger.json"
USER_AGENT = "OpenCyberPath-CyberPulse/1.0 (+https://github.com/hemanthkadiyala01-sentinel/open-cyber-path)"
MAX_BODY = 2_500_000
MAX_ITEMS_PER_SOURCE = 100
MAX_OUTPUT_ITEMS = 400
NEWS_RETENTION_DAYS = 30
ADVISORY_RETENTION_DAYS = 240

SOURCES: list[dict[str, Any]] = [
    {"id": "bleepingcomputer", "label": "BleepingComputer", "kind": "rss", "url": "https://www.bleepingcomputer.com/feed/", "type": "news", "confidence": "Publisher news; verify details in the original article", "topic": "Security news"},
    {"id": "thehackernews", "label": "The Hacker News", "kind": "rss", "url": "https://feeds.feedburner.com/TheHackersNews", "type": "news", "confidence": "Publisher news; verify details in the original article", "topic": "Security news"},
    {"id": "hackernews-security", "label": "Hacker News · security-filtered posts", "kind": "rss", "url": "https://hnrss.org/newest?q=cybersecurity+OR+vulnerability+OR+ransomware+OR+phishing+OR+security&count=30", "type": "community-signal", "confidence": "Community discussion; not an independently verified security claim", "topic": "Community signal"},
    {"id": "cert-in", "label": "CERT-In advisories", "kind": "certin", "url": "https://www.cert-in.org.in/s2cMainServlet?pageid=PUBADVLIST02", "type": "official-advisory", "confidence": "Official government advisory listing", "topic": "Official advisory"},
    {"id": "cisa-advisories", "label": "CISA Cybersecurity Advisories", "kind": "rss", "url": "https://www.cisa.gov/news-events/cybersecurity-advisories?feed=rss", "type": "official-advisory", "confidence": "Official CISA advisory feed; open the source for scope and mitigations", "topic": "Official advisory"},
    {"id": "cisa-kev", "label": "CISA Known Exploited Vulnerabilities", "kind": "cisa-kev", "url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", "apiUrl": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", "type": "vulnerability", "confidence": "Official government catalog; prioritization input, not a severity score", "topic": "Known exploited vulnerability"},
    {"id": "github-advisories", "label": "GitHub reviewed security advisories", "kind": "github-advisories", "url": "https://docs.github.com/en/rest/security-advisories/global-advisories", "apiUrl": "https://api.github.com/advisories?type=reviewed&per_page=100", "type": "software-advisory", "confidence": "GitHub-reviewed public advisory; check affected versions and vendor guidance", "topic": "Software advisory"},
    {"id": "debian-security", "label": "Debian security advisories", "kind": "rss", "url": "https://www.debian.org/security/dsa.en.rdf", "type": "official-advisory", "confidence": "Official Debian security advisory", "topic": "Distribution advisory"},
]


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_dt(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None
    s = value.strip()
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except ValueError:
        pass
    # Common RFC 822 RSS date.
    from email.utils import parsedate_to_datetime
    try:
        dt = parsedate_to_datetime(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


def safe_http_url(value: Any, base: str | None = None) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    candidate = urljoin(base, value.strip()) if base else value.strip()
    try:
        p = urlparse(candidate)
    except Exception:
        return None
    if p.scheme.lower() not in {"http", "https"} or not p.netloc:
        return None
    # Avoid carrying fragments and incidental feed tracking parameters into the index.
    p = p._replace(fragment="")
    result = urlunparse(p)
    return result[:1200]


def clean_text(value: Any, limit: int = 260) -> str:
    if not isinstance(value, str):
        return ""
    text = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", value)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"[\u200b\u200c\u200d\ufeff]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    # Excerpts are intentionally short. The link always points to the publisher.
    if len(text) > limit:
        text = text[: limit - 1].rsplit(" ", 1)[0] + "…"
    return text


def digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8", "replace")).hexdigest()[:24]


def load_json(path: Path, fallback: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return fallback


def fetch_bytes(url: str, accept: str = "application/rss+xml,application/atom+xml,application/xml,application/json,text/html;q=0.8,*/*;q=0.5") -> bytes:
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": accept})
    with urlopen(req, timeout=18) as response:
        data = response.read(MAX_BODY + 1)
    if len(data) > MAX_BODY:
        raise ValueError(f"Response exceeded {MAX_BODY} bytes")
    return data


def node_text(node: ET.Element, names: set[str]) -> str:
    for child in list(node):
        local = child.tag.rsplit("}", 1)[-1].split(":")[-1].lower()
        if local in names:
            val = " ".join(child.itertext()).strip()
            if val:
                return val
    return ""


def parse_rss(raw: bytes, source: dict[str, Any], discovered_at: str) -> list[dict[str, Any]]:
    root = ET.fromstring(raw)
    entries: list[ET.Element] = []
    for element in root.iter():
        if element.tag.rsplit("}", 1)[-1].lower() in {"item", "entry"}:
            entries.append(element)
    out: list[dict[str, Any]] = []
    for entry in entries[:MAX_ITEMS_PER_SOURCE]:
        title = clean_text(node_text(entry, {"title"}), 180)
        link = ""
        for child in list(entry):
            local = child.tag.rsplit("}", 1)[-1].lower()
            if local == "link":
                href = child.attrib.get("href")
                if href:
                    # Prefer a link with rel=alternate, otherwise first valid href.
                    link = href
                    if child.attrib.get("rel", "alternate") == "alternate":
                        break
                elif child.text and child.text.strip():
                    link = child.text.strip()
                    break
        link = safe_http_url(link, source["url"])
        if not title or not link:
            continue
        summary_raw = node_text(entry, {"description", "summary", "encoded", "content"})
        pub = node_text(entry, {"pubdate", "published", "updated", "date", "issued"})
        published = parse_dt(pub)
        ident = f"{source['id']}:{digest(link)}"
        out.append({
            "id": ident, "sourceId": source["id"], "source": source["label"],
            "type": source["type"], "topic": source["topic"], "title": title,
            "summary": clean_text(summary_raw, 260), "url": link,
            "sourceUrl": source["url"], "publishedAt": published.isoformat().replace("+00:00", "Z") if published else None,
            "updatedAt": None, "firstSeenAt": discovered_at, "lastSeenAt": discovered_at,
            "confidence": source["confidence"], "cveId": None,
        })
    return out


class CertInAnchorParser(HTMLParser):
    def __init__(self, source: dict[str, Any], discovered_at: str):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.discovered_at = discovered_at
        self.current_href: str | None = None
        self.current_text: list[str] = []
        self.rows: list[dict[str, Any]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        attrs_map = dict(attrs)
        href = attrs_map.get("href") or ""
        if re.search(r"VLCODE=CIAD-\d{4}-\d+", href, re.I):
            self.current_href = href
            self.current_text = []

    def handle_data(self, data: str) -> None:
        if self.current_href is not None:
            self.current_text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() != "a" or self.current_href is None:
            return
        href = self.current_href
        title = clean_text(" ".join(self.current_text), 180)
        self.current_href = None
        if not title:
            return
        link = safe_http_url(href, "https://www.cert-in.org.in/")
        if not link:
            return
        match = re.search(r"(CIAD-\d{4}-\d+)", href, re.I)
        advisory_id = match.group(1).upper() if match else None
        self.rows.append({
            "id": f"cert-in:{advisory_id or digest(link)}", "sourceId": self.source["id"],
            "source": self.source["label"], "type": self.source["type"], "topic": self.source["topic"],
            "title": title, "summary": "Open the official advisory for scope, affected products, severity, and recommended mitigations. Publication date is left blank unless parsed from the source.",
            "url": link, "sourceUrl": self.source["url"], "publishedAt": None, "updatedAt": None,
            "firstSeenAt": self.discovered_at, "lastSeenAt": self.discovered_at,
            "confidence": self.source["confidence"], "cveId": None,
        })


def fetch_certin(source: dict[str, Any], discovered_at: str) -> list[dict[str, Any]]:
    page_url = f"https://www.cert-in.org.in/s2cMainServlet?pageid=PUBADVLIST02&year={datetime.now(timezone.utc).year}"
    raw = fetch_bytes(page_url, "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5")
    parser = CertInAnchorParser(source, discovered_at)
    parser.feed(raw.decode("utf-8", "replace"))
    # Stable dedupe by advisory ID; only official advisory links are retained.
    unique: dict[str, dict[str, Any]] = {}
    for row in parser.rows:
        unique[row["id"]] = row
    return list(unique.values())[:60]


def fetch_cisa_kev(source: dict[str, Any], discovered_at: str) -> list[dict[str, Any]]:
    obj = json.loads(fetch_bytes(source["apiUrl"], "application/json").decode("utf-8"))
    rows = obj.get("vulnerabilities", [])
    if not isinstance(rows, list):
        raise ValueError("CISA KEV JSON did not contain a vulnerability list")
    out = []
    for v in sorted((x for x in rows if isinstance(x, dict)), key=lambda x: str(x.get("dateAdded") or ""), reverse=True)[:MAX_ITEMS_PER_SOURCE]:
        cve = str(v.get("cveID") or "")
        if not re.fullmatch(r"CVE-\d{4}-\d{4,}", cve):
            continue
        title = clean_text(f"{cve}: {v.get('vulnerabilityName') or v.get('product') or 'Known exploited vulnerability'}", 180)
        summary = clean_text(f"{v.get('shortDescription') or ''} Recommended action: {v.get('requiredAction') or 'Review the official catalog and vendor guidance.'}", 260)
        pub = parse_dt(v.get("dateAdded"))
        out.append({
            "id": f"cisa-kev:{cve}", "sourceId": source["id"], "source": source["label"],
            "type": source["type"], "topic": source["topic"], "title": title, "summary": summary,
            "url": source["url"], "sourceUrl": source["url"],
            "publishedAt": pub.date().isoformat() + "T00:00:00Z" if pub else None,
            "updatedAt": None, "firstSeenAt": discovered_at, "lastSeenAt": discovered_at,
            "confidence": source["confidence"], "cveId": cve,
            "dateAdded": v.get("dateAdded"), "knownRansomwareCampaignUse": v.get("knownRansomwareCampaignUse"),
        })
    return out


def fetch_github_advisories(source: dict[str, Any], discovered_at: str) -> list[dict[str, Any]]:
    raw = fetch_bytes(source["apiUrl"], "application/vnd.github+json,application/json")
    data = json.loads(raw.decode("utf-8"))
    if not isinstance(data, list):
        raise ValueError("GitHub Advisory API did not return a list")
    out = []
    for row in data[:MAX_ITEMS_PER_SOURCE]:
        if not isinstance(row, dict) or row.get("type", "reviewed") != "reviewed":
            continue
        url = safe_http_url(row.get("html_url") or row.get("url"))
        title = clean_text(row.get("summary") or row.get("ghsa_id") or "Security advisory", 180)
        if not url or not title:
            continue
        cve = row.get("cve_id") if re.fullmatch(r"CVE-\d{4}-\d{4,}", str(row.get("cve_id") or "")) else None
        published = parse_dt(row.get("published_at"))
        updated = parse_dt(row.get("updated_at"))
        out.append({
            "id": f"github-advisories:{row.get('ghsa_id') or digest(url)}", "sourceId": source["id"],
            "source": source["label"], "type": source["type"], "topic": source["topic"],
            "title": title, "summary": clean_text(row.get("description") or row.get("summary") or "", 260),
            "url": url, "sourceUrl": source["url"],
            "publishedAt": published.isoformat().replace("+00:00", "Z") if published else None,
            "updatedAt": updated.isoformat().replace("+00:00", "Z") if updated else None,
            "firstSeenAt": discovered_at, "lastSeenAt": discovered_at,
            "confidence": source["confidence"], "cveId": cve,
            "severity": clean_text(str(row.get("severity") or ""), 24).upper() or None,
        })
    return out


def fetch_source(source: dict[str, Any], discovered_at: str) -> list[dict[str, Any]]:
    if source["kind"] == "certin":
        return fetch_certin(source, discovered_at)
    if source["kind"] == "cisa-kev":
        return fetch_cisa_kev(source, discovered_at)
    if source["kind"] == "github-advisories":
        return fetch_github_advisories(source, discovered_at)
    raw = fetch_bytes(source["url"])
    return parse_rss(raw, source, discovered_at)


def age_days(item: dict[str, Any], now: datetime) -> float | None:
    dt = parse_dt(item.get("publishedAt") or item.get("updatedAt") or item.get("firstSeenAt"))
    return (now - dt).total_seconds() / 86400 if dt else None


def freshness_label(item: dict[str, Any], previous: dict[str, Any] | None, now: datetime) -> str:
    pub = parse_dt(item.get("publishedAt"))
    old_pub = parse_dt((previous or {}).get("publishedAt"))
    updated = parse_dt(item.get("updatedAt"))
    old_updated = parse_dt((previous or {}).get("updatedAt"))
    if previous and updated and (not old_updated or updated > old_updated):
        return "UPDATED"
    if not previous and pub and (now - pub).total_seconds() <= 72 * 3600:
        return "NEW"
    if previous and pub and (not old_pub or pub > old_pub) and (now - pub).total_seconds() <= 72 * 3600:
        return "NEW"
    return "ACTIVE"


def atomic_write(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temp.replace(path)


def get_last_generated(path: Path, field: str = "generatedAt") -> str | None:
    data = load_json(path, {})
    if not isinstance(data, dict):
        return None
    value = data.get(field)
    return value if isinstance(value, str) else None


def freshness_state(last: str | None, max_age_hours: float) -> str:
    dt = parse_dt(last)
    if not dt:
        return "not-recorded"
    age = (datetime.now(timezone.utc) - dt).total_seconds() / 3600
    return "fresh" if age <= max_age_hours else "stale"


def build_freshness(feed: dict[str, Any], generated_at: str) -> dict[str, Any]:
    data_dir = WEBSITE / "public" / "data"
    liveops_path = WEBSITE / "public" / "liveops-feed.json"
    health_path = WEBSITE / "src" / "data" / "resourceHealth.generated.json"
    cert_path = data_dir / "certification-source-status.json"
    liveops_last = get_last_generated(liveops_path)
    resource_last = get_last_generated(health_path)
    cert_last = get_last_generated(cert_path)
    source_ok = sum(1 for s in feed.get("sources", []) if s.get("status") == "fresh")
    sections = [
        {"id": "cyberpulse", "label": "Cybersecurity news & advisories", "mode": "automatic", "cadence": "Every 6 hours", "lastCheckedAt": feed.get("lastSuccessfulSyncAt"), "status": "fresh" if feed.get("status") == "ok" else ("partial" if source_ok else ("stale" if feed.get("items") else "not-recorded")), "summary": f"{source_ok}/{len(SOURCES)} public sources refreshed successfully in the latest run; community posts are labelled unverified signals."},
        {"id": "liveops", "label": "LiveOps public problem-source radar", "mode": "automatic", "cadence": "Every 6 hours after workflow is enabled", "lastCheckedAt": liveops_last, "status": freshness_state(liveops_last, 8), "summary": "Source discovery and candidate records; these are not automatically certified as publish-ready challenges."},
        {"id": "resource-links", "label": "Resource, video and external-link reachability", "mode": "automatic", "cadence": "Weekly", "lastCheckedAt": resource_last, "status": freshness_state(resource_last, 24 * 10), "summary": "A responding URL does not prove a course is free, accessible, safe, current, or educationally accurate."},
        {"id": "certifications", "label": "Certification and exam source links", "mode": "automatic", "cadence": "Daily source monitor; weekly resource review", "lastCheckedAt": cert_last, "status": freshness_state(cert_last, 36), "summary": "Monitors page reachability and content change signals; exam terms and pricing still require issuer confirmation."},
    ]
    ledger = load_json(LEDGER_PATH, {"sections": []})
    ledger_rows = ledger.get("sections", []) if isinstance(ledger, dict) else []
    now = datetime.now(timezone.utc)
    for row in ledger_rows:
        if not isinstance(row, dict):
            continue
        last = row.get("lastReviewedAt")
        dt = parse_dt(last)
        cadence_days = max(1, int(row.get("cadenceDays") or 90))
        due = not dt or (now - dt).total_seconds() > cadence_days * 86400
        status = "review-due" if due else "review-current"
        sections.append({
            "id": str(row.get("id") or digest(str(row))), "label": str(row.get("label") or "Content review"),
            "mode": "editorial-review", "cadence": f"Every {cadence_days} days",
            "lastCheckedAt": last, "status": status,
            "summary": str(row.get("note") or "Editorial accuracy review; source links are checked separately."),
        })
    return {"schemaVersion": 1, "generatedAt": generated_at, "status": "ready", "summary": {"sections": len(sections), "automated": sum(1 for x in sections if x["mode"] == "automatic"), "reviewDue": sum(1 for x in sections if x["mode"] == "editorial-review" and x["status"] == "review-due"), "freshnessIsReachabilityNotQuality": True}, "sections": sections}



def validate_public_outputs(feed_path: Path | None = None, freshness_path: Path | None = None) -> None:
    feed_path = feed_path or FEED_PATH
    freshness_path = freshness_path or FRESHNESS_PATH
    feed = load_json(feed_path, None)
    freshness = load_json(freshness_path, None)
    if not isinstance(feed, dict) or feed.get("schemaVersion") != 1 or not isinstance(feed.get("items"), list) or not isinstance(feed.get("sources"), list):
        raise ValueError(f"Invalid CyberPulse feed schema at {feed_path}")
    forbidden_keys = {"author", "authorName", "byline", "reporter", "submitter", "submitterName", "credits", "submitterUsername"}
    for item in feed["items"]:
        if not isinstance(item, dict) or not item.get("id") or not safe_http_url(item.get("url")):
            raise ValueError("Invalid item record or non-HTTP(S) article URL in CyberPulse feed")
        if forbidden_keys.intersection(item.keys()):
            raise ValueError("A contributor identity field is present in a public item record")
    if not isinstance(freshness, dict) or freshness.get("schemaVersion") != 1 or not isinstance(freshness.get("sections"), list):
        raise ValueError(f"Invalid site-freshness schema at {freshness_path}")
    print(f"PASS: feed schema v1; {len(feed['items'])} items; {len(feed['sources'])} source status records")
    print("PASS: public item URLs are HTTP(S); contributor identity fields are excluded")
    print(f"PASS: site-freshness schema v1; {len(freshness['sections'])} section records")

def self_test() -> None:
    assert safe_http_url("https://example.org/a#fragment") == "https://example.org/a"
    assert safe_http_url("javascript:alert(1)") is None
    assert clean_text("<b>Hello</b> &amp; <script>ignore</script> world", 80) == "Hello & world"
    rss = b'''<?xml version="1.0"?><rss><channel><item><title>Example security update</title><link>https://example.org/advisory</link><description>A brief &lt;b&gt;safe&lt;/b&gt; summary.</description><pubDate>Tue, 20 Oct 2026 10:00:00 GMT</pubDate><author>private-person@example.org</author></item></channel></rss>'''
    sample_source = {"id":"sample", "label":"Sample source", "kind":"rss", "url":"https://example.org/feed", "type":"news", "confidence":"publisher news", "topic":"News"}
    items = parse_rss(rss, sample_source, "2026-10-20T00:00:00Z")
    assert len(items) == 1 and items[0]["title"] == "Example security update"
    assert "author" not in items[0] and "email" not in items[0] and "private-person" not in json.dumps(items[0])
    assert items[0]["summary"] == "A brief safe summary."
    previous = {"id": items[0]["id"], "publishedAt": "2026-10-20T10:00:00Z", "updatedAt": None}
    assert freshness_label(items[0], previous, datetime(2026,10,20,11,tzinfo=timezone.utc)) == "ACTIVE"
    cert = CertInAnchorParser({"id":"cert-in", "label":"CERT-In", "url":"https://example.org", "type":"official-advisory", "topic":"Advisory", "confidence":"Official"}, "2026-10-20T00:00:00Z")
    cert.feed('<a href="s2cMainServlet?VLCODE=CIAD-2026-0049&amp;pageid=PUBVLNOTES02">Example Advisory</a>')
    assert len(cert.rows) == 1 and cert.rows[0]["id"] == "cert-in:CIAD-2026-0049"
    print("PASS: URLs, sanitisation, RSS parsing, no author fields, labels, and CERT-In parsing")


def refresh(site_root: Path | None = None) -> tuple[dict[str, Any], dict[str, Any], int]:
    global WEBSITE, FEED_PATH, FRESHNESS_PATH, LEDGER_PATH
    if site_root:
        WEBSITE = site_root.resolve()
        FEED_PATH = WEBSITE / "public" / "data" / "cyberpulse-feed.json"
        FRESHNESS_PATH = WEBSITE / "public" / "data" / "site-freshness.json"
        LEDGER_PATH = WEBSITE / "public" / "data" / "content-review-ledger.json"
    prev = load_json(FEED_PATH, {"schemaVersion": 1, "items": [], "sources": []})
    if not isinstance(prev, dict):
        prev = {"schemaVersion": 1, "items": [], "sources": []}
    prev_items = {x.get("id"): x for x in prev.get("items", []) if isinstance(x, dict) and x.get("id")}
    prev_sources = {x.get("id"): x for x in prev.get("sources", []) if isinstance(x, dict) and x.get("id")}
    now = now_iso()
    now_dt = parse_dt(now) or datetime.now(timezone.utc)
    successful: set[str] = set()
    source_statuses: list[dict[str, Any]] = []
    collected: dict[str, dict[str, Any]] = {}
    for old in prev_items.values():
        collected[old["id"]] = dict(old)
    for source in SOURCES:
        old_status = prev_sources.get(source["id"], {})
        try:
            rows = fetch_source(source, now)
            # An empty successful response is suspicious: preserve old items and mark it for review.
            if not rows:
                raise ValueError("Source returned no usable records")
            successful.add(source["id"])
            for row in rows:
                old = prev_items.get(row["id"])
                if old:
                    row["firstSeenAt"] = old.get("firstSeenAt") or row["firstSeenAt"]
                    row["lastSeenAt"] = now
                    # If a feed no longer carries a timestamp, retain the known prior one.
                    if not row.get("publishedAt"):
                        row["publishedAt"] = old.get("publishedAt")
                    row["status"] = freshness_label(row, old, now_dt)
                else:
                    row["status"] = freshness_label(row, None, now_dt)
                collected[row["id"]] = row
            source_statuses.append({"id":source["id"],"label":source["label"],"url":source["url"],"status":"fresh","checkedAt":now,"lastSuccessAt":now,"itemsFetched":len(rows),"note":"Headlines/brief summaries only; open the original source for context."})
            print(f"PASS {source['id']}: {len(rows)} records")
        except Exception as exc:
            status = "stale" if old_status.get("lastSuccessAt") or any(x.get("sourceId")==source["id"] for x in collected.values()) else "unavailable"
            source_statuses.append({"id":source["id"],"label":source["label"],"url":source["url"],"status":status,"checkedAt":now,"lastSuccessAt":old_status.get("lastSuccessAt"),"itemsFetched":0,"note":f"Refresh failed; previous records retained ({type(exc).__name__})."})
            print(f"WARN {source['id']}: {type(exc).__name__}; prior items retained", file=sys.stderr)
    # Prune old records only after a successful run for their source; failures never erase its history.
    retained: dict[str, dict[str, Any]] = {}
    for ident, item in collected.items():
        sid = item.get("sourceId")
        if sid in successful:
            age = age_days(item, now_dt)
            max_age = ADVISORY_RETENTION_DAYS if item.get("type") in {"official-advisory", "software-advisory", "vulnerability"} else NEWS_RETENTION_DAYS
            if age is not None and age > max_age:
                continue
        retained[ident] = item
    items = sorted(retained.values(), key=lambda item: parse_dt(item.get("publishedAt") or item.get("updatedAt") or item.get("lastSeenAt") or item.get("firstSeenAt")) or datetime.min.replace(tzinfo=timezone.utc), reverse=True)[:MAX_OUTPUT_ITEMS]
    status = "ok" if len(successful) == len(SOURCES) else "partial" if successful else "stale" if items else "unavailable"
    last_success = now if successful else prev.get("lastSuccessfulSyncAt")
    feed = {
        "schemaVersion": 1, "status": status, "generatedAt": now, "lastSuccessfulSyncAt": last_success,
        "sourceCount": len(SOURCES), "successfulSources": len(successful), "itemCount": len(items),
        "note": "Headlines and short excerpts are shown for discovery. Read the original source for full context. Community posts are unverified signals, not confirmed advisories.",
        "sources": source_statuses, "items": items,
    }
    atomic_write(FEED_PATH, feed)
    freshness = build_freshness(feed, now)
    atomic_write(FRESHNESS_PATH, freshness)
    print(f"Feed written atomically: {FEED_PATH} ({len(items)} items; {len(successful)}/{len(SOURCES)} sources succeeded; status={status})")
    print(f"Freshness dashboard written: {FRESHNESS_PATH}")
    return feed, freshness, len(successful)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true", help="run offline parser/privacy self-tests")
    parser.add_argument("--site-root", type=Path, help="override website directory (useful for tests)")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        if args.site_root:
            site = args.site_root.resolve()
            validate_public_outputs(site / "public" / "data" / "cyberpulse-feed.json", site / "public" / "data" / "site-freshness.json")
        else:
            validate_public_outputs()
        return 0
    _, _, successes = refresh(args.site_root)
    if successes == 0:
        print("ERROR: all feeds failed; previous records were retained and this run is unsuccessful.", file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
