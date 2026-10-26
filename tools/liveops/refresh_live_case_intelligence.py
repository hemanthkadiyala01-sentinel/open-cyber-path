#!/usr/bin/env python3
"""Refresh OpenCyberPath's defensive live-incident operations feed.

Sources are public reporting/advisories only. The generated response drills use
fictional synthetic evidence and never contact or test a reported target.
Standard-library-only so the scheduled workflow has a small dependency surface.
"""
from __future__ import annotations

import argparse
import base64
import datetime as dt
import html
from html.parser import HTMLParser
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

UTC = dt.timezone.utc
NOW = lambda: dt.datetime.now(UTC).replace(microsecond=0)
USER_AGENT = "OpenCyberPath-LiveIncidentOps/1.0 (+public defensive training; source links retained)"
DEFAULT_ACCEPT = "application/json, application/rss+xml, application/xml, text/html;q=0.9, */*;q=0.8"
CISA_RSS_ACCEPT = "application/rss+xml, application/xml, text/xml, */*"
CERTIN_URL = f"https://www.cert-in.org.in/s2cMainServlet?pageid=PUBADVLIST02&year={dt.datetime.now(UTC).year}"
CERTIN_BASE = "https://www.cert-in.org.in/"
BLEEPING_FEED = "https://www.bleepingcomputer.com/feed/"
BLEEPING_RSS_PAGE = "https://www.bleepingcomputer.com/rss-feeds/"
THERECORD_FEED = "https://therecord.media/feed"
THERECORD_HOME = "https://therecord.media/"
HACKER_NEWS_FEED = "https://thehackernews.com/feeds/posts/default?alt=rss"
HACKER_NEWS_HOME = "https://thehackernews.com/"
NCSC_RSS = "https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml"
NCSC_FEEDS_PAGE = "https://www.ncsc.gov.uk/information/rss-feeds"
CISA_ADVISORIES_FEED = "https://www.cisa.gov/cybersecurity-advisories/all.xml"
CISA_ADVISORIES_FEEDS = (
    CISA_ADVISORIES_FEED,
    "https://www.cisa.gov/cybersecurity-advisories/cybersecurity-advisories.xml",
    "https://www.cisa.gov/cybersecurity-advisories/alerts.xml",
)
CISA_ADVISORIES_PAGE = "https://www.cisa.gov/cybersecurity-advisories"
CISA_KEV_JSON = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
CISA_KEV_PAGE = "https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
MAX_BODY = 8 * 1024 * 1024
MAX_ITEMS = 120
IS_WINDOWS = os.name == "nt"
SECURITY_TERMS = re.compile(
    r"cyber|hack|attack|breach|ransomware|malware|phish|vulnerab|exploit|security|"
    r"certificate|compromise|credential|data leak|supply.chain|remote code|CVE-\d{4}-\d+|"
    r"AI agent|package|PyPI|Docker image|unauthori[sz]ed|extortion|cloud|GitLab|PHP2Shell",
    re.I,
)
DATE_RE = re.compile(r"([A-Z][a-z]+\s+\d{1,2},\s*20\d{2})")


def iso_now() -> str:
    return NOW().isoformat().replace("+00:00", "Z")


def clean_text(value: str, limit: int = 900) -> str:
    value = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", value or "")
    value = re.sub(r"(?s)<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value).strip()
    return value[:limit]


def parse_date(value: str | None) -> str | None:
    if not value:
        return None
    value = value.strip()
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=UTC)
        return parsed.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    except ValueError:
        pass
    for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S GMT", "%B %d, %Y", "%b %d, %Y"):
        try:
            parsed = dt.datetime.strptime(value, fmt)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=UTC)
            return parsed.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
        except ValueError:
            continue
    return None


def classify_case_type(title: str, summary: str = "") -> str:
    text = f"{title} {summary}".lower()
    if any(term in text for term in ("pypi", "package compromise", "docker image", "supply-chain", "supply chain", "dependency", "npm package", "build pipeline")):
        return "dependency-compromise"
    if any(term in text for term in ("certificate", "intermediate ca", "certificate authority", "trust chain")):
        return "certificate-compromise"
    if any(term in text for term in ("ai agent", "agentic ai", "agent tool", "model agent")):
        return "ai-agent"
    if any(term in text for term in ("payment api", "disbursement api", "api abuse", "unauthorized fund transfer", "unauthorised fund transfer")):
        return "api-abuse"
    if any(term in text for term in ("third-party vendor", "third party vendor", "employee learning records", "data breach", "extortion group", "stolen data", "data leak")):
        return "third-party-breach"
    if any(term in text for term in ("oauth", "sign-in", "identity compromise", "cloud access", "credential theft")):
        return "identity-cloud"
    if any(term in text for term in ("ransomware", "malware", "botnet", "infostealer", "trojan")):
        return "malware-ransomware"
    if any(term in text for term in ("vulnerability", "vulnerabilities", "remote code execution", "rce", "cve-", "security patch", "actively exploited", "php2shell", "code execution")):
        return "vulnerability"
    return "generic"


def parse_rss(
    xml_text: str,
    publisher: str = "BleepingComputer",
    now: dt.datetime | None = None,
    *,
    source_id: str = "bleepingcomputer",
    allowed_hosts: set[str] | None = None,
    signal_type: str | None = None,
    confidence: str = "reported",
    source_status: str | None = None,
) -> list[dict[str, Any]]:
    """Parse RSS/Atom without accepting links outside the configured publisher.

    Media feeds are deliberately labelled as reports rather than confirmed
    compromises. Official feeds may pass an explicit advisory confidence label.
    """
    now = now or NOW()
    allowed = {host.lower().rstrip(".") for host in (allowed_hosts or {"www.bleepingcomputer.com", "bleepingcomputer.com"})}
    root = ET.fromstring(xml_text)
    rows = root.findall(".//item")
    if not rows:
        # Atom namespace URI varies; child extraction below handles namespaced tags.
        rows = [node for node in root.iter() if node.tag.endswith("}entry") or node.tag == "entry"]
    items: list[dict[str, Any]] = []
    default_signal = "Media report — verify claims against the original vendor or incident statement"
    default_status = "Independent media report; cross-check material claims against primary disclosures where available."
    for row in rows:
        def child_text(name: str) -> str:
            for node in list(row):
                if node.tag.split("}")[-1].lower() == name.lower():
                    return "".join(node.itertext()).strip()
            return ""
        title = clean_text(child_text("title"), 220)
        url = child_text("link")
        if not url:
            for node in list(row):
                if node.tag.split("}")[-1].lower() == "link":
                    url = node.attrib.get("href", "")
                    if url:
                        break
        url = url.strip()
        if not title or not url:
            continue
        parsed_url = urllib.parse.urlparse(url)
        host = (parsed_url.hostname or "").lower().rstrip(".")
        if parsed_url.scheme.lower() != "https" or host not in allowed or parsed_url.username or parsed_url.password:
            continue
        summary = clean_text(child_text("description") or child_text("summary") or child_text("content"), 650)
        if not SECURITY_TERMS.search(f"{title} {summary}"):
            continue
        published = parse_date(child_text("pubDate") or child_text("published") or child_text("updated"))
        if published:
            try:
                age = now - dt.datetime.fromisoformat(published.replace("Z", "+00:00"))
                if age > dt.timedelta(days=45) or age < -dt.timedelta(days=1):
                    continue
            except ValueError:
                pass
        identity = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:90]
        items.append({
            "id": f"{source_id}-{identity}", "sourceId": source_id, "publisher": publisher,
            "title": title, "publishedAt": published, "url": url,
            "summary": summary or "Read the original publisher page for the stated facts, affected parties or products, and available guidance.",
            "signalType": signal_type or default_signal, "caseType": classify_case_type(title, summary),
            "confidence": confidence,
            "sourceStatus": source_status or default_status,
        })
    return items


class CertInParser(HTMLParser):
    """Collect table rows containing official CERT-In advisory links."""
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.rows: list[dict[str, str]] = []
        self.row: dict[str, Any] | None = None
        self.anchor: dict[str, str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_map = dict(attrs)
        if tag.lower() == "tr":
            self.row = {"text": "", "links": []}
        elif tag.lower() == "a" and self.row is not None and attrs_map.get("href"):
            self.anchor = {"href": attrs_map["href"] or "", "text": ""}
            self.row["links"].append(self.anchor)

    def handle_data(self, data: str) -> None:
        if self.row is not None:
            self.row["text"] += " " + data
        if self.anchor is not None:
            self.anchor["text"] += data

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "a":
            self.anchor = None
        elif tag.lower() == "tr" and self.row is not None:
            self.rows.append({"text": clean_text(self.row["text"], 1600), "links": self.row["links"]})
            self.row = None


def parse_certin_html(html_text: str, now: dt.datetime | None = None) -> list[dict[str, Any]]:
    """Parse advisory anchors from CERT-In's public listing (table/list markup)."""
    now = now or NOW()
    items: list[dict[str, Any]] = []
    # The public page has changed its layout over time, so parse each official
    # advisory link and the text up to the next link rather than assuming a table.
    link_pattern = re.compile(
        r"<a\b[^>]*href=[\'\"](?P<href>[^\'\"]*VLCODE=(?P<code>CIAD-\d{4}-\d+)[^\'\"]*)[\'\"][^>]*>(?P<anchor>.*?)</a>",
        re.I | re.S,
    )
    for match in link_pattern.finditer(html_text):
        href = html.unescape(match.group("href"))
        advisory_id = match.group("code").upper()
        url = urllib.parse.urljoin(CERTIN_BASE, href)
        if urllib.parse.urlparse(url).hostname not in {"cert-in.org.in", "www.cert-in.org.in"}:
            continue
        tail_html = html_text[match.end():]
        next_link = re.search(r"<a\b", tail_html, re.I)
        segment = tail_html[:next_link.start()] if next_link else tail_html[:5000]
        tail_text = clean_text(segment, 1600)
        date_match = DATE_RE.search(tail_text)
        published = parse_date(date_match.group(1)) if date_match else None
        title = tail_text[date_match.end():].strip(" :-–()") if date_match else ""
        title = clean_text(title, 220)
        if not title:
            # Fallback to the nearest row/cell text if the following content is nested or sparse.
            parser = CertInParser()
            parser.feed(html_text[max(0, match.start() - 1200):match.end() + 2200])
            row_text = next((row["text"] for row in parser.rows if advisory_id in row["text"]), "")
            fallback_date = DATE_RE.search(row_text)
            if fallback_date and not published:
                published = parse_date(fallback_date.group(1))
            title = clean_text(row_text, 220) if row_text else advisory_id
        if published:
            try:
                age = now - dt.datetime.fromisoformat(published.replace("Z", "+00:00"))
                if age > dt.timedelta(days=180) or age < -dt.timedelta(days=1):
                    continue
            except ValueError:
                pass
        summary = "Official CERT-In advisory. Review the linked notice for exact affected products, exploitation context, and vendor-approved mitigation; do not assume every installation is affected."
        items.append({
            "id": f"certin-{advisory_id.lower()}", "sourceId": "cert-in", "publisher": "CERT-In",
            "title": title, "publishedAt": published, "url": url,
            "summary": summary, "signalType": "Official security advisory",
            "caseType": classify_case_type(title), "confidence": "official-advisory",
            "sourceStatus": f"Listed by CERT-In as {advisory_id}; details must be checked in the linked notice",
        })
    # A unique ID keeps duplicate listing links from creating duplicate cards.
    unique: dict[str, dict[str, Any]] = {}
    for item in items:
        unique[item["id"]] = item
    return list(unique.values())


def parse_cisa_kev(payload: str, now: dt.datetime | None = None) -> list[dict[str, Any]]:
    now = now or NOW()
    data = json.loads(payload)
    vulnerabilities = data.get("vulnerabilities", [])
    items: list[dict[str, Any]] = []
    cutoff = now - dt.timedelta(days=90)
    for vuln in vulnerabilities:
        cve = str(vuln.get("cveID", "")).strip()
        if not re.fullmatch(r"CVE-\d{4}-\d+", cve):
            continue
        published = parse_date(vuln.get("dateAdded"))
        if not published:
            continue
        try:
            stamp = dt.datetime.fromisoformat(published.replace("Z", "+00:00"))
            if stamp < cutoff or stamp > now + dt.timedelta(days=1):
                continue
        except ValueError:
            continue
        title = f"{cve}: {clean_text(str(vuln.get('vulnerabilityName', 'Known exploited vulnerability')), 180)}"
        description = clean_text(str(vuln.get("shortDescription", "")), 500)
        action = clean_text(str(vuln.get("requiredAction", "")), 500)
        summary_bits = [description, action]
        summary = " ".join(piece for piece in summary_bits if piece).strip()
        if not summary:
            summary = "CISA lists this CVE in its Known Exploited Vulnerabilities catalog. Check the vendor advisory for affected versions and mitigation instructions."
        items.append({
            "id": f"cisa-{cve.lower()}", "sourceId": "cisa-kev", "publisher": "CISA KEV Catalog",
            "title": title, "publishedAt": published, "url": f"https://nvd.nist.gov/vuln/detail/{cve}",
            "summary": summary, "signalType": "Known exploited vulnerability — listed by CISA KEV",
            "caseType": classify_case_type(title + " " + summary), "confidence": "cisa-kev-listed",
            "sourceStatus": "The CVE is listed in CISA KEV; this does not establish that the learner's assets are affected.",
            "sourceCatalogUrl": CISA_KEV_PAGE,
        })
    items.sort(key=lambda x: x.get("publishedAt") or "", reverse=True)
    return items[:40]


def _powershell_quote(value: str) -> str:
    """Quote one literal safely for a fixed PowerShell command."""
    return "'" + value.replace("'", "''") + "'"


def fetch_cisa_with_powershell(url: str) -> bytes:
    """Fetch one allow-listed CISA RSS endpoint with Windows' native HTTP stack.

    Local probes showed .NET/PowerShell could retrieve CISA RSS while Python
    urllib received an HTML 403 response. This is a Windows-only transport
    fallback; non-Windows runners keep using urllib and report real failures.
    """
    if url not in CISA_ADVISORIES_FEEDS:
        raise ValueError("PowerShell CISA fetch refused a non-allow-listed URL")

    script = (
        "$ErrorActionPreference = 'Stop'; "
        f"$headers = @{{ 'User-Agent' = {_powershell_quote(USER_AGENT)}; "
        f"'Accept' = {_powershell_quote(CISA_RSS_ACCEPT)} }}; "
        "try { "
        f"$response = Invoke-WebRequest -UseBasicParsing -Uri {_powershell_quote(url)} "
        "-Headers $headers -TimeoutSec 22; "
        "$bytes = [System.Text.Encoding]::UTF8.GetBytes([string]$response.Content); "
        "[Console]::Out.Write([Convert]::ToBase64String($bytes)); "
        "} catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 }"
    )
    last_missing: FileNotFoundError | None = None
    for executable in ("powershell.exe", "pwsh.exe", "pwsh"):
        try:
            result = subprocess.run(
                [executable, "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script],
                capture_output=True, text=True, encoding="utf-8", errors="replace",
                timeout=30, check=False,
            )
        except FileNotFoundError as exc:
            last_missing = exc
            continue
        except subprocess.TimeoutExpired as exc:
            raise TimeoutError(f"PowerShell CISA request timed out: {url}") from exc
        if result.returncode != 0:
            detail = (result.stderr or result.stdout or "PowerShell request failed").strip()[:400]
            raise OSError(f"PowerShell CISA request failed for {url}: {detail}")
        encoded = result.stdout.strip()
        try:
            body = base64.b64decode(encoded, validate=True)
        except Exception as exc:
            raise ValueError(f"PowerShell returned an invalid encoded response for {url}") from exc
        if not body:
            raise ValueError(f"PowerShell returned an empty response for {url}")
        if len(body) > MAX_BODY:
            raise ValueError(f"Source response too large: {url}")
        return body
    raise FileNotFoundError("No PowerShell executable (powershell.exe/pwsh) was found") from last_missing


def _fetch_with_urllib(url: str) -> bytes:
    accept = CISA_RSS_ACCEPT if url in CISA_ADVISORIES_FEEDS else DEFAULT_ACCEPT
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": accept})
    with urllib.request.urlopen(request, timeout=22) as response:
        body = response.read(MAX_BODY + 1)
    if len(body) > MAX_BODY:
        raise ValueError(f"Source response too large: {url}")
    return body


def fetch_url(url: str) -> bytes:
    # On Windows, prefer the native .NET/PowerShell client for CISA RSS because
    # Python urllib received HTTP 403 HTML pages for these same URLs in local
    # diagnostics. Fall back to urllib if PowerShell is unavailable or fails.
    if url in CISA_ADVISORIES_FEEDS and IS_WINDOWS:
        try:
            return fetch_cisa_with_powershell(url)
        except Exception as powershell_exc:
            try:
                return _fetch_with_urllib(url)
            except Exception as urllib_exc:
                raise OSError(
                    f"PowerShell fetch failed: {str(powershell_exc)[:220]}; "
                    f"Python urllib fallback failed: {str(urllib_exc)[:220]}"
                ) from urllib_exc
    return _fetch_with_urllib(url)


def source_records(now: dt.datetime | None = None) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Fetch the allow-listed global/India source set, isolating failures per source."""
    now = now or NOW()
    items: list[dict[str, Any]] = []
    configs = [
        {
            "id": "cert-in", "name": "CERT-In Advisories", "url": CERTIN_URL,
            "fetchUrl": CERTIN_URL, "description": "Official Indian cybersecurity advisories",
            "parser": lambda text: parse_certin_html(text, now=now),
        },
        {
            "id": "bleepingcomputer", "name": "BleepingComputer News", "url": BLEEPING_RSS_PAGE,
            "fetchUrl": BLEEPING_FEED, "description": "Independent global incident and vulnerability reporting; cross-check material claims",
            "parser": lambda text: parse_rss(text, "BleepingComputer", now, source_id="bleepingcomputer",
                allowed_hosts={"www.bleepingcomputer.com", "bleepingcomputer.com"}),
        },
        {
            "id": "therecord", "name": "The Record — Recorded Future News", "url": THERECORD_HOME,
            "fetchUrl": THERECORD_FEED, "description": "Global reporting on breaches, cybercrime, and threat activity; reports are not automatically primary confirmation",
            "parser": lambda text: parse_rss(text, "The Record", now, source_id="therecord",
                allowed_hosts={"therecord.media", "www.therecord.media"}),
        },
        {
            "id": "thehackernews", "name": "The Hacker News", "url": HACKER_NEWS_HOME,
            "fetchUrl": HACKER_NEWS_FEED, "description": "Independent global cybersecurity reporting; verify claims against primary disclosures where available",
            "parser": lambda text: parse_rss(text, "The Hacker News", now, source_id="thehackernews",
                allowed_hosts={"thehackernews.com", "www.thehackernews.com"}),
        },
        {
            "id": "ncsc-uk", "name": "UK NCSC Publications", "url": NCSC_FEEDS_PAGE,
            "fetchUrl": NCSC_RSS, "description": "Official UK NCSC news, guidance and threat reports; distinguish incidents from general guidance",
            "parser": lambda text: parse_rss(text, "UK NCSC", now, source_id="ncsc-uk",
                allowed_hosts={"www.ncsc.gov.uk", "ncsc.gov.uk"},
                signal_type="Official NCSC publication — inspect the linked item to distinguish incident reporting from guidance",
                confidence="official-publication",
                source_status="Published by the UK NCSC; consult the linked notice for its evidence and scope."),
        },
        {
            "id": "cisa-advisories", "name": "CISA Cybersecurity Advisories", "url": CISA_ADVISORIES_PAGE,
            "fetchUrl": CISA_ADVISORIES_FEED, "fetchUrls": CISA_ADVISORIES_FEEDS, "description": "Official US cybersecurity advisories; an advisory is not proof of a particular victim compromise",
            "parser": lambda text: parse_rss(text, "CISA", now, source_id="cisa-advisories",
                allowed_hosts={"www.cisa.gov", "cisa.gov"},
                signal_type="Official CISA cybersecurity advisory",
                confidence="official-advisory",
                source_status="Published by CISA; distinguish vulnerability guidance from confirmed incident reporting."),
        },
        {
            "id": "cisa-kev", "name": "CISA Known Exploited Vulnerabilities", "url": CISA_KEV_PAGE,
            "fetchUrl": CISA_KEV_JSON, "description": "Official catalog of vulnerabilities with evidence of exploitation in the wild",
            "parser": lambda text: parse_cisa_kev(text, now=now),
        },
    ]
    sources: list[dict[str, Any]] = []
    for config in configs:
        source = {
            "id": config["id"], "name": config["name"], "url": config["url"],
            "description": config["description"], "status": "error", "itemCount": 0,
        }
        sources.append(source)
        try:
            candidate_urls = config.get("fetchUrls") or [config["fetchUrl"]]
            usable_items: list[dict[str, Any]] = []
            endpoint_diagnostics: list[dict[str, Any]] = []
            endpoint_errors: list[str] = []
            for candidate_url in candidate_urls:
                try:
                    body = fetch_url(candidate_url)
                    decoded = body.decode("utf-8", errors="replace")
                    endpoint_items = config["parser"](decoded)
                    # An empty/obsolete response is not a healthy feed. For CISA,
                    # continue to its published alternative RSS endpoints.
                    if not endpoint_items:
                        raise ValueError("No recent security records could be parsed from this endpoint")
                    usable_items.extend(endpoint_items)
                    endpoint_diagnostics.append({
                        "url": candidate_url, "status": "ok", "itemCount": len(endpoint_items),
                    })
                except Exception as endpoint_exc:
                    detail = str(endpoint_exc)[:180]
                    endpoint_errors.append(f"{candidate_url}: {detail}")
                    endpoint_diagnostics.append({
                        "url": candidate_url, "status": "error", "error": detail,
                    })

            # Deduplicate records present in more than one official CISA feed by URL.
            deduplicated: list[dict[str, Any]] = []
            seen_keys: set[str] = set()
            for item in usable_items:
                key = str(item.get("url") or item.get("id") or "")
                if key and key not in seen_keys:
                    seen_keys.add(key)
                    deduplicated.append(item)
            if not deduplicated:
                detail = " | ".join(endpoint_errors) or "No configured endpoint yielded recent records"
                raise ValueError("No CISA advisory feed endpoint returned usable records: " + detail)
            fetched = deduplicated
            if config.get("fetchUrls"):
                source["feedEndpoints"] = endpoint_diagnostics
                source["successfulFeedCount"] = sum(1 for e in endpoint_diagnostics if e["status"] == "ok")
                if endpoint_errors:
                    source["partialFeedErrors"] = endpoint_errors
            source["status"] = "ok"
            source["itemCount"] = len(fetched)
            items.extend(fetched)
        except Exception as exc:  # Keep other public-source feeds running if one publisher is down.
            source["error"] = str(exc)[:240]
            source["status"] = "error"
    return items, sources


def load_previous(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"items": [], "sources": []}


def refresh(output: Path, now: dt.datetime | None = None, fetched: tuple[list[dict[str, Any]], list[dict[str, Any]]] | None = None) -> dict[str, Any]:
    now = now or NOW()
    previous = load_previous(output)
    new_items, source_status = fetched if fetched is not None else source_records(now)
    if not any(source.get("status") == "ok" for source in source_status):
        raise RuntimeError("All live-intelligence sources failed. Preserved the existing snapshot; see workflow logs.")

    new_by_id = {item["id"]: item for item in new_items}
    new_source_by_id = {source["id"]: source for source in source_status}
    previous_sources = {source.get("id"): source for source in previous.get("sources", []) if isinstance(source, dict)}
    # Retain recent items from any temporarily unavailable source, but mark that source stale.
    keep_cutoff = now - dt.timedelta(days=90)
    for old in previous.get("items", []):
        if not isinstance(old, dict) or not old.get("id") or old["id"] in new_by_id:
            continue
        source_id = old.get("sourceId", "")
        source = new_source_by_id.get(source_id)
        published = parse_date(old.get("publishedAt"))
        recent = not published or dt.datetime.fromisoformat(published.replace("Z", "+00:00")) >= keep_cutoff
        if source and source.get("status") == "error" and recent:
            preserved = dict(old)
            preserved["staleSource"] = True
            new_by_id[preserved["id"]] = preserved
        elif source_id not in new_source_by_id and recent:
            # Keep manually curated seeds/records until 90 days old, still with their source link.
            new_by_id[old["id"]] = old

    for source in source_status:
        if source["status"] == "error" and previous_sources.get(source["id"]):
            source["status"] = "stale"
            source["lastKnownItemCount"] = previous_sources[source["id"]].get("itemCount", 0)

    items = list(new_by_id.values())
    items.sort(key=lambda x: (x.get("publishedAt") or "0000", x.get("title", "")), reverse=True)
    items = items[:MAX_ITEMS]
    final = {
        "schemaVersion": 1,
        "generatedAt": now.isoformat().replace("+00:00", "Z"),
        "freshnessPolicy": "Scheduled source check every three hours when the workflow is enabled on the default branch. Publication time is from the source where supplied. Feed errors are shown; source reporting does not prove local exposure.",
        "safetyNotice": "This feed reports public cybersecurity incidents, advisories and exploited-vulnerability signals. Selecting a card starts a defensive drill with synthetic records; it never probes an affected target.",
        "sources": source_status,
        "items": items,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(final, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return final


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default="website/public/live-case-intelligence.json", help="Path to the generated JSON feed")
    args = parser.parse_args()
    output = Path(args.output)
    try:
        feed = refresh(output)
    except Exception as exc:
        print(f"REFRESH FAILED: {exc}", file=sys.stderr)
        return 1
    print(f"Live incident intelligence snapshot written: {output}")
    print(f"Items: {len(feed['items'])}; generatedAt: {feed['generatedAt']}")
    for source in feed["sources"]:
        print(f"- {source['name']}: {source['status']} ({source.get('itemCount', source.get('lastKnownItemCount', 0))} records)")
        for endpoint in source.get("feedEndpoints", []):
            endpoint_count = f" ({endpoint['itemCount']} records)" if "itemCount" in endpoint else ""
            endpoint_error = f" — {endpoint['error']}" if endpoint.get("error") else ""
            print(f"    endpoint {endpoint['status']}: {endpoint['url']}{endpoint_count}{endpoint_error}")
        for partial_error in source.get("partialFeedErrors", []):
            print(f"    endpoint warning: {partial_error}")
        if source.get("error"):
            print(f"    source error: {source['error']}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
