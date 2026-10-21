#!/usr/bin/env python3
"""Refresh the public OpenCyberPath LiveOps source feed.

Uses only public, approved source endpoints and Python's standard library.
Individual reporter/submitter identity is intentionally excluded from output.
A failed source preserves previously collected records; it never clears the feed.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import email.utils
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
FEED_PATH = ROOT / "website" / "public" / "liveops-feed.json"
USER_AGENT = "OpenCyberPath-LiveOps/1.0 (+public defensive-learning source monitor)"
MAX_BYTES = 12 * 1024 * 1024

SOURCE_DEFS = {
    "cert-in": {
        "id": "cert-in", "name": "CERT-In Advisories",
        "url": f"https://www.cert-in.org.in/s2cMainServlet?pageid=PUBADVLIST02&year={datetime.now(timezone.utc).year}",
        "kind": "Government advisory listing",
    },
    "cisa-kev": {
        "id": "cisa-kev", "name": "CISA Known Exploited Vulnerabilities",
        "url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
        "kind": "Known-exploited vulnerability catalogue",
    },
    "github-advisories": {
        "id": "github-advisories", "name": "GitHub Global Security Advisories",
        "url": "https://docs.github.com/en/rest/security-advisories/global-advisories",
        "kind": "Public reviewed security advisories",
    },
    "debian": {
        "id": "debian", "name": "Debian Security Advisories",
        "url": "https://www.debian.org/security/dsa",
        "kind": "Distribution security advisories",
    },
    "github-signals": {
        "id": "github-signals", "name": "GitHub Public Issues & Fix Signals",
        "url": "https://docs.github.com/en/rest/search/search#search-issues-and-pull-requests",
        "kind": "Public issue and fix candidates (unverified until reviewed)",
    },
}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso_now() -> str:
    return now_utc().replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_date(value: Any) -> datetime | None:
    if not value:
        return None
    try:
        email_date = email.utils.parsedate_to_datetime(str(value).strip())
        if email_date and email_date.tzinfo is not None:
            return email_date.astimezone(timezone.utc)
    except (TypeError, ValueError, OverflowError):
        pass
    text = str(value).strip()
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except (ValueError, TypeError):
        pass
    for fmt in ("%B %d, %Y", "%d %b %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(text, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def iso_date(value: Any) -> str | None:
    parsed = parse_date(value)
    return parsed.replace(microsecond=0).isoformat().replace("+00:00", "Z") if parsed else None


def clean_text(value: Any, limit: int = 720) -> str:
    if value is None:
        return ""
    text = html.unescape(str(value))
    text = re.sub(r"<script\b[^>]*>.*?</script\s*>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<style\b[^>]*>.*?</style\s*>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def clean_public_title(value: Any, limit: int = 240) -> str:
    text = clean_text(value, limit)
    text = re.sub(r"(?<![\w])@[A-Za-z0-9-]{1,39}", "[handle omitted]", text)
    text = re.sub(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", "[email omitted]", text, flags=re.I)
    # Redact common title patterns that explicitly identify an individual reporter.
    text = re.sub(r"\b(reported|submitted|filed|discovered|identified|posted)\s+by\s+[^:;,|]{1,80}", r"\1 by [contributor omitted]", text, flags=re.I)
    return text


def valid_http_url(value: Any) -> str | None:
    try:
        url = urllib.parse.urlparse(str(value or ""))
        if url.scheme in ("https", "http") and url.netloc:
            return str(value)
    except Exception:
        pass
    return None


def http_get(url: str, *, accept: str = "application/json, application/rss+xml, application/xml, text/html;q=0.9, */*;q=0.8") -> tuple[bytes, dict[str, str]]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": accept})
    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read(MAX_BYTES + 1)
        if len(body) > MAX_BYTES:
            raise ValueError("source response exceeded the 12 MiB safety limit")
        headers = {key.lower(): value for key, value in response.headers.items()}
        return body, headers


def content_hash(record: dict[str, Any]) -> str:
    keys = ("title", "summary", "publishedAt", "updatedAt", "severity", "sourceUrl")
    canonical = json.dumps({key: record.get(key) for key in keys}, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def calc_status(record: dict[str, Any], previous: dict[str, Any] | None, *, is_kev: bool = False) -> str:
    current_hash = record.get("contentHash") or content_hash(record)
    published = parse_date(record.get("publishedAt"))
    updated = parse_date(record.get("updatedAt"))
    activity_date = max([value for value in (published, updated) if value is not None], default=None)
    prior_hash = previous.get("contentHash") if previous else None
    prior_updated = parse_date(previous.get("updatedAt")) if previous else None
    if previous and prior_hash and not str(prior_hash).startswith("seed-") and prior_hash != current_hash and updated and prior_updated and updated > prior_updated:
        return "UPDATED"
    now = now_utc()
    if published and 0 <= (now - published).total_seconds() <= 7 * 86400:
        return "NEW"
    if is_kev or (activity_date and 0 <= (now - activity_date).total_seconds() <= 30 * 86400):
        return "ACTIVE"
    if previous and previous.get("status") == "NEW" and published and (now - published).total_seconds() <= 30 * 86400:
        return "ACTIVE"
    return "ARCHIVED" if activity_date and (now - activity_date).total_seconds() > 90 * 86400 else "ACTIVE"


class TextAndLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.text_parts: list[str] = []
        self.links: list[tuple[str, str]] = []
        self._active_href: str | None = None
        self._active_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        if tag.lower() == "a":
            self._active_href = attrs_dict.get("href")
            self._active_text = []

    def handle_data(self, data: str) -> None:
        self.text_parts.append(data)
        if self._active_href is not None:
            self._active_text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "a" and self._active_href is not None:
            text = clean_text(" ".join(self._active_text), 250)
            self.links.append((text, urllib.parse.urljoin(SOURCE_DEFS["cert-in"]["url"], self._active_href)))
            self._active_href = None
            self._active_text = []


def parse_cert_in(previous_items: dict[str, dict[str, Any]], first_seen: str) -> list[dict[str, Any]]:
    url = SOURCE_DEFS["cert-in"]["url"]
    body, _ = http_get(url, accept="text/html,application/xhtml+xml")
    decoder = body.decode("utf-8", "replace")
    parser = TextAndLinks()
    parser.feed(decoder)
    flat = clean_text(" ".join(parser.text_parts), 200000)
    links_by_ref: dict[str, str] = {}
    for label, link in parser.links:
        match = re.search(r"CIAD-\d{4}-\d{4}", label)
        if match and valid_http_url(link):
            links_by_ref[match.group(0)] = link
    pattern = re.compile(r"CERT-In Advisory\s+(CIAD-\d{4}-\d{4})\s*\(?\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})\s*\)?\s*(.*?)(?=CERT-In Advisory\s+CIAD-|Previous\s*(?:\||Next|$)|Last Updated On|$)", re.I)
    output = []
    for match in pattern.finditer(flat):
        reference, date_text, title = match.groups()
        title = clean_text(title, 260).strip(" -*|·")
        if not title or reference not in links_by_ref:
            continue
        pub = iso_date(date_text)
        record_id = f"cert-in:{reference}"
        row = {
            "id": record_id, "sourceId": "cert-in", "sourceName": "CERT-In",
            "sourceUrl": links_by_ref[reference], "reference": reference, "title": title,
            "summary": "Official CERT-In advisory. Open the original notice for affected products, technical details and recommended actions.",
            "publishedAt": pub, "updatedAt": pub, "severity": "See original advisory",
            "category": classify(title), "confidence": "Official government advisory", "firstSeenAt": first_seen, "lastSeenAt": first_seen,
            "isKEV": False,
        }
        old = previous_items.get(record_id)
        if old:
            row["firstSeenAt"] = old.get("firstSeenAt") or first_seen
            row["lastSeenAt"] = first_seen
            row["updatedAt"] = old.get("updatedAt") or row["updatedAt"]
        row["contentHash"] = content_hash(row)
        row["status"] = calc_status(row, old)
        output.append(row)
    if not output:
        raise ValueError("CERT-In page loaded, but no advisory records matched the expected format; previous feed retained")
    return output[:60]


def classify(text: str) -> str:
    text = text.lower()
    if any(k in text for k in ("payment", "disbursement", "transaction", "bank")):
        return "API and financial workflow"
    if any(k in text for k in ("agent", "artificial intelligence", " ai ", "machine learning")):
        return "AI agent security"
    if any(k in text for k in ("microsoft", "sap", "oracle", "apple", "chrome", "linux", "vulnerability", "security update")):
        return "Vulnerability management"
    if any(k in text for k in ("phishing", "email", "notification", "fraud")):
        return "Detection and response"
    return "Security advisory"


def parse_cisa(previous_items: dict[str, dict[str, Any]], first_seen: str) -> list[dict[str, Any]]:
    url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
    body, _ = http_get(url, accept="application/json")
    payload = json.loads(body.decode("utf-8"))
    vulnerabilities = payload.get("vulnerabilities")
    if not isinstance(vulnerabilities, list):
        raise ValueError("CISA KEV JSON did not contain a vulnerabilities array")
    output = []
    for vuln in vulnerabilities[-100:]:
        cve = clean_text(vuln.get("cveID"), 80)
        if not cve:
            continue
        source_url = "https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
        title = clean_text(f"{vuln.get('vendorProject','')} {vuln.get('product','')} — {vuln.get('vulnerabilityName','')}", 240).strip(" —") or cve
        summary = clean_text(vuln.get("shortDescription") or "Listed in CISA's Known Exploited Vulnerabilities catalog.", 650)
        pub = iso_date(vuln.get("dateAdded"))
        updated = iso_date(vuln.get("dateAdded"))
        record_id = f"cisa-kev:{cve}"
        row = {
            "id": record_id, "sourceId": "cisa-kev", "sourceName": "CISA Known Exploited Vulnerabilities",
            "sourceUrl": source_url, "reference": cve, "title": title, "summary": summary,
            "publishedAt": pub, "updatedAt": updated, "severity": "Known exploited vulnerability catalogue",
            "category": "Vulnerability management", "confidence": "Official CISA KEV catalog",
            "firstSeenAt": first_seen, "lastSeenAt": first_seen, "isKEV": True,
        }
        old = previous_items.get(record_id)
        if old:
            row["firstSeenAt"] = old.get("firstSeenAt") or first_seen
            row["lastSeenAt"] = first_seen
        row["contentHash"] = content_hash(row)
        row["status"] = calc_status(row, old, is_kev=True)
        output.append(row)
    if not output:
        raise ValueError("CISA KEV feed returned no valid records")
    return output


def parse_github(previous_items: dict[str, dict[str, Any]], first_seen: str) -> list[dict[str, Any]]:
    url = "https://api.github.com/advisories?per_page=100&sort=updated&direction=desc&type=reviewed"
    body, _ = http_get(url, accept="application/vnd.github+json")
    payload = json.loads(body.decode("utf-8"))
    if not isinstance(payload, list):
        raise ValueError("GitHub global advisories API did not return a list")
    output = []
    for advisory in payload:
        ghsa = clean_text(advisory.get("ghsa_id"), 80)
        if not ghsa:
            continue
        summary = clean_public_title(advisory.get("summary") or "Public GitHub-reviewed security advisory.", 240)
        # Deliberately never copy author, reporter, submitter, avatar or profile fields to the public feed.
        pub = iso_date(advisory.get("published_at"))
        updated = iso_date(advisory.get("updated_at"))
        refs = advisory.get("references") if isinstance(advisory.get("references"), list) else []
        cve = clean_text(advisory.get("cve_id"), 80)
        severity = clean_text(advisory.get("severity") or "not rated", 40).lower()
        ecosystem = ", ".join(sorted({clean_text(p.get("package", {}).get("ecosystem"), 50) for p in (advisory.get("vulnerabilities") or []) if isinstance(p, dict) and isinstance(p.get("package"), dict) and p.get("package", {}).get("ecosystem")}))
        title = summary or ghsa
        record_id = f"github:{ghsa}"
        row = {
            "id": record_id, "sourceId": "github-advisories", "sourceName": "GitHub Global Security Advisories",
            "sourceUrl": f"https://github.com/advisories/{urllib.parse.quote(ghsa)}", "reference": cve or ghsa,
            "title": title, "summary": "Public GitHub-reviewed advisory metadata. Open the official advisory for affected versions and mitigation details; reporter identity is not replicated in this feed.", "publishedAt": pub, "updatedAt": updated,
            "severity": severity, "category": f"Package security{f' · {ecosystem}' if ecosystem else ''}",
            "confidence": "Public GitHub-reviewed advisory", "firstSeenAt": first_seen, "lastSeenAt": first_seen, "isKEV": False,
        }
        old = previous_items.get(record_id)
        if old:
            row["firstSeenAt"] = old.get("firstSeenAt") or first_seen
            row["lastSeenAt"] = first_seen
        row["contentHash"] = content_hash(row)
        row["status"] = calc_status(row, old)
        output.append(row)
    if not output:
        raise ValueError("GitHub advisories API returned no reviewed advisory records")
    return output


def xml_local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def parse_github_signals(previous_items: dict[str, dict[str, Any]], first_seen: str) -> list[dict[str, Any]]:
    """Find public issue/PR titles updated in the last 14 days; never ingest body or author fields."""
    since = (now_utc().date()).toordinal() - 14
    from datetime import date as _date
    since_date = _date.fromordinal(since).isoformat()
    queries = [
        f"security in:title is:issue updated:>={since_date}",
        f"vulnerability in:title is:issue updated:>={since_date}",
        f"security in:title is:pr updated:>={since_date}",
    ]
    all_results: dict[str, dict[str, Any]] = {}
    for query in queries:
        endpoint = "https://api.github.com/search/issues?" + urllib.parse.urlencode({"q": query, "sort": "updated", "order": "desc", "per_page": 50})
        body, _ = http_get(endpoint, accept="application/vnd.github+json")
        payload = json.loads(body.decode("utf-8"))
        results = payload.get("items") if isinstance(payload, dict) else None
        if not isinstance(results, list):
            raise ValueError("GitHub search API did not return an items list")
        for item in results:
            link = valid_http_url(item.get("html_url"))
            if not link:
                continue
            all_results[link] = item
        time.sleep(0.2)
    output = []
    for link, item in all_results.items():
        title = clean_public_title(item.get("title"), 220)
        title = title.replace("[handle omitted]", "[contributor handle omitted]")
        if not title:
            continue
        number = str(item.get("number") or "")
        is_pr = isinstance(item.get("pull_request"), dict)
        ref_type = "Public fix PR" if is_pr else "Public issue"
        ref = f"{ref_type} #{number}" if number else ref_type
        pub = iso_date(item.get("created_at"))
        updated = iso_date(item.get("updated_at"))
        ident_hash = hashlib.sha256(link.encode("utf-8")).hexdigest()[:18]
        record_id = f"github-signal:{ident_hash}"
        row = {
            "id": record_id, "sourceId": "github-signals", "sourceName": "GitHub Public Issues & Fix Signals",
            "sourceUrl": link, "reference": ref, "title": title,
            "summary": "Unverified public issue/fix title-only signal. Submitter identity, repository-owner display names, and body text are not collected in this feed. Corroborate the source before designing a challenge.",
            "publishedAt": pub, "updatedAt": updated, "severity": "Unverified signal",
            "category": "Unverified public community signal", "confidence": "Public issue/PR candidate — not confirmed vulnerability evidence",
            "firstSeenAt": first_seen, "lastSeenAt": first_seen, "isKEV": False,
        }
        old = previous_items.get(record_id)
        if old:
            row["firstSeenAt"] = old.get("firstSeenAt") or first_seen
            row["lastSeenAt"] = first_seen
        row["contentHash"] = content_hash(row)
        row["status"] = calc_status(row, old)
        output.append(row)
    if not output:
        raise ValueError("GitHub issue search returned no eligible public issue/PR title signals")
    output.sort(key=lambda x: x.get("updatedAt") or "", reverse=True)
    return output[:100]


def parse_debian(previous_items: dict[str, dict[str, Any]], first_seen: str) -> list[dict[str, Any]]:
    url = "https://www.debian.org/security/dsa"
    body, _ = http_get(url, accept="application/rss+xml, application/xml, text/xml, */*;q=0.8")
    root = ET.fromstring(body)
    output = []
    entries = [node for node in root.iter() if xml_local_name(node.tag) in ("item", "entry")]
    for node in entries[:100]:
        fields: dict[str, str] = {}
        for child in list(node):
            name = xml_local_name(child.tag)
            if name == "link":
                attr_link = next((value for key, value in child.attrib.items() if xml_local_name(key) in ("href", "resource")), None)
                fields[name] = attr_link or (child.text or "")
            elif name in ("title", "pubdate", "published", "updated", "date", "id", "guid", "description", "summary"):
                fields[name] = " ".join(child.itertext())
        title = clean_text(fields.get("title"), 240)
        about_link = next((value for key, value in node.attrib.items() if xml_local_name(key) == "about"), None)
        link = valid_http_url(fields.get("link")) or valid_http_url(fields.get("guid")) or valid_http_url(about_link)
        if not title:
            continue
        dsa_match = re.search(r"DSA-\d+(?:-\d+)?", f"{title} {fields.get('id','')} {fields.get('guid','')}", re.I)
        reference = dsa_match.group(0) if dsa_match else title[:80]
        if not link:
            link = "https://www.debian.org/security/dsa"
        date_raw = fields.get("published") or fields.get("pubdate") or fields.get("date") or fields.get("updated")
        pub = iso_date(date_raw)
        record_id = f"debian:{reference.lower()}"
        row = {
            "id": record_id, "sourceId": "debian", "sourceName": "Debian Security Advisories",
            "sourceUrl": link, "reference": reference, "title": title,
            "summary": "Public Debian security advisory. Open the original notice to review the affected package, fixed versions and distribution-specific guidance.",
            "publishedAt": pub, "updatedAt": iso_date(fields.get("updated")) or pub,
            "severity": "See original advisory", "category": "Distribution security update",
            "confidence": "Official Debian security feed", "firstSeenAt": first_seen, "lastSeenAt": first_seen, "isKEV": False,
        }
        old = previous_items.get(record_id)
        if old:
            row["firstSeenAt"] = old.get("firstSeenAt") or first_seen
            row["lastSeenAt"] = first_seen
        row["contentHash"] = content_hash(row)
        row["status"] = calc_status(row, old)
        output.append(row)
    if not output:
        # The Debian security page is also usable even if its RSS endpoint temporarily changes.
        raise ValueError("Debian DSA feed was reachable but no RSS/Atom entries were parsed")
    return output


def read_existing() -> dict[str, Any]:
    try:
        data = json.loads(FEED_PATH.read_text(encoding="utf-8"))
        if isinstance(data, dict) and isinstance(data.get("items"), list):
            return data
    except (OSError, json.JSONDecodeError):
        pass
    return {"schemaVersion": 1, "feedMode": "starter-snapshot", "generatedAt": None, "sources": [], "items": []}


def validate_feed(data: dict[str, Any]) -> None:
    if data.get("schemaVersion") != 1 or not isinstance(data.get("items"), list) or not isinstance(data.get("sources"), list):
        raise ValueError("feed schema invalid")
    seen: set[str] = set()
    forbidden = {"author", "reporter", "submitter", "avatar_url", "user_login", "username", "email", "profile_url"}
    for item in data["items"]:
        if not isinstance(item, dict):
            raise ValueError("an item is not an object")
        ident = item.get("id")
        if not ident or ident in seen:
            raise ValueError(f"missing or duplicate item id: {ident}")
        seen.add(ident)
        if not valid_http_url(item.get("sourceUrl")):
            raise ValueError(f"invalid source URL for {ident}")
        if str(item.get("status", "")).upper() not in {"NEW", "UPDATED", "ACTIVE", "ARCHIVED"}:
            raise ValueError(f"invalid freshness status for {ident}")
        leaked = forbidden.intersection({str(key).lower() for key in item})
        if leaked:
            raise ValueError(f"identity fields are forbidden in public feed ({ident})")


def self_test() -> int:
    data = read_existing()
    validate_feed(data)
    print(f"PASS: feed schema v{data['schemaVersion']}; {len(data['items'])} unique source records; {len(data['sources'])} source status records")
    print("PASS: all item source URLs are HTTP(S); all freshness labels are NEW/UPDATED/ACTIVE/ARCHIVED")
    print("PASS: no direct author/reporter/submitter identity fields in public source records")
    required = {"cert-in", "cisa-kev", "github-advisories", "debian", "github-signals"}
    found = {source.get("id") for source in data["sources"]}
    if not required.issubset(found):
        raise ValueError(f"source registry missing: {', '.join(sorted(required - found))}")
    print(f"PASS: approved source registry is present ({len(found)} source adapters)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true", help="validate the existing feed without making network requests")
    parser.add_argument("--scheduled", action="store_true", help="mark this run as invoked by a scheduled collector (used by GitHub Actions)")
    args = parser.parse_args()
    if args.self_test:
        return self_test()

    FEED_PATH.parent.mkdir(parents=True, exist_ok=True)
    previous = read_existing()
    old_items_list = previous.get("items", []) if isinstance(previous.get("items"), list) else []
    previous_items = {str(item.get("id")): item for item in old_items_list if isinstance(item, dict) and item.get("id")}
    source_health_old = {str(source.get("id")): source for source in (previous.get("sources", []) or []) if isinstance(source, dict) and source.get("id")}
    attempt = iso_now()
    item_map: dict[str, dict[str, Any]] = {key: dict(value) for key, value in previous_items.items()}
    source_health: list[dict[str, Any]] = []
    successes = 0
    adapters = [
        ("cert-in", lambda: parse_cert_in(previous_items, attempt)),
        ("cisa-kev", lambda: parse_cisa(previous_items, attempt)),
        ("github-advisories", lambda: parse_github(previous_items, attempt)),
        ("debian", lambda: parse_debian(previous_items, attempt)),
        ("github-signals", lambda: parse_github_signals(previous_items, attempt)),
    ]
    for source_id, collect in adapters:
        definition = SOURCE_DEFS[source_id]
        old_source = source_health_old.get(source_id, {})
        try:
            records = collect()
            successes += 1
            for record in records:
                # Never output arbitrary identity properties from external source records.
                record = {key: value for key, value in record.items() if key.lower() not in {"author", "reporter", "submitter", "avatar_url", "username", "email", "profile_url"}}
                item_map[record["id"]] = record
            health = {
                **definition, "status": "ok", "itemsSeen": len(records), "lastAttemptAt": attempt,
                "lastSuccessAt": attempt, "message": f"Retrieved {len(records)} public records; individual reporter identities are not published.",
            }
            print(f"PASS {source_id}: {len(records)} records")
        except Exception as exc:  # keep each adapter isolated; one broken source must not wipe the others
            message = clean_text(f"Refresh failed: {type(exc).__name__}: {exc}", 240)
            health = {
                **definition, "status": "error", "itemsSeen": int(old_source.get("itemsSeen", 0) or 0),
                "lastAttemptAt": attempt, "lastSuccessAt": old_source.get("lastSuccessAt"),
                "message": message + (" Previous records were retained." if item_map else ""),
            }
            print(f"WARN {source_id}: {message}; retained existing items")
        source_health.append(health)

    # Recalculate the freshness label for retained items without claiming that discovery time is publication time.
    for ident, item in list(item_map.items()):
        is_kev = bool(item.get("isKEV")) or str(item.get("sourceId")) == "cisa-kev"
        item["status"] = calc_status(item, previous_items.get(ident), is_kev=is_kev)
    # Keep recently changed and current records first; preserve historical items within a generous cap.
    merged = sorted(item_map.values(), key=lambda item: (parse_date(item.get("updatedAt")) or parse_date(item.get("publishedAt")) or datetime.min.replace(tzinfo=timezone.utc)), reverse=True)[:1200]
    feed = {
        "schemaVersion": 1,
        "feedMode": ("automated-refresh" if args.scheduled else "manual-refresh") if successes else previous.get("feedMode", "starter-snapshot"),
        "generatedAt": attempt if successes else (previous.get("generatedAt") or attempt),
        "scheduleHours": 6,
        "privacyPolicy": "Public feed intentionally omits individual reporter and submitter identity fields. Source organisations and source references are retained for traceability.",
        "sources": source_health,
        "items": merged,
    }
    validate_feed(feed)
    tmp_path = FEED_PATH.with_suffix(".json.tmp")
    tmp_path.write_text(json.dumps(feed, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    tmp_path.replace(FEED_PATH)
    print(f"Feed written atomically: {FEED_PATH} ({len(merged)} unique records; {successes}/{len(adapters)} sources succeeded)")
    if successes == 0:
        print("ERROR: every source failed. The previous records remain in the feed, but this run is not considered successful.", file=sys.stderr)
        return 1
    if successes < len(adapters):
        print("NOTE: partial refresh. Failed sources are clearly marked and their previous records were retained.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"ERROR: {clean_text(error, 500)}", file=sys.stderr)
        raise SystemExit(1)
