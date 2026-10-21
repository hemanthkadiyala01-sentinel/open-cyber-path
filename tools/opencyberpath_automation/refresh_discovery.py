#!/usr/bin/env python3
"""Refresh OpenCyberPath's unified public-discovery snapshot.

This job complements (does not replace) the existing CyberPulse and YouTube jobs.
Only public-source metadata, short excerpts and original links are stored. Optional
social connectors are disabled unless the site owner configures approved API access.
The learner-facing catalogue is never edited by this script.
"""
from __future__ import annotations

import base64
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse, urlunparse, urlsplit, urlunsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
WEBSITE = ROOT / "website"
CONFIG_PATH = Path(__file__).with_name("sources.json")
OUTPUT_PATH = WEBSITE / "public" / "data" / "opencyberpath-discovery.json"
STATUS_PATH = WEBSITE / "public" / "data" / "opencyberpath-automation-status.json"
CYBERPULSE_PATH = WEBSITE / "public" / "data" / "cyberpulse-feed.json"
YOUTUBE_PATH = WEBSITE / "public" / "data" / "youtube-discovery.json"
RESOURCE_REVIEW_PATH = WEBSITE / "reports" / "weekly-resource-review.json"
CERT_STATUS_PATH = WEBSITE / "public" / "data" / "certification-source-status.json"
USER_AGENT = "OpenCyberPath-PublicDiscovery/1.0 (+https://github.com/hemanthkadiyala01-sentinel/open-cyber-path)"
MAX_BODY = 2_500_000

HIGH_RISK_TOOL_PHRASES = (
    "phishing kit", "credential stealer", "password stealer", "ransomware builder",
    "malware builder", "botnet panel", "rat builder", "remote access trojan builder",
    "keylogger download", "wifi deauthentication attack tool",
)

SECURITY_TERMS = (
    "cybersecurity", "cyber security", "information security", "infosec", "soc analyst",
    "security analyst", "security engineer", "security researcher", "bug bounty", "vulnerability",
    "application security", "appsec", "threat hunting", "threat intelligence", "incident response",
    "digital forensics", "dfir", "siem", "security intern", "cyber intern", "security internship",
    "penetration testing", "penetration tester", "ctf", "capture the flag", "blue team",
    "red team", "malware analysis", "security operations", "network security", "cloud security",
)


def now_utc() -> datetime:
    return datetime.now(timezone.utc).replace(microsecond=0)


def iso(dt: datetime | None = None) -> str:
    return (dt or now_utc()).astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def parse_date(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None
    raw = value.strip()
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        try:
            dt = parsedate_to_datetime(raw)
        except (TypeError, ValueError, OverflowError):
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def clean_text(value: Any, limit: int = 320) -> str:
    if not isinstance(value, str):
        return ""
    value = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", value)
    value = re.sub(r"(?s)<[^>]+>", " ", value)
    value = value.replace("\u200b", "").replace("\ufeff", "")
    # Keep useful public context while removing obvious personal contact details and social handles.
    value = re.sub(r"(?<![\w.+-])[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[contact redacted]", value)
    value = re.sub(r"(?<![\w.+-])@[A-Za-z0-9_]{1,30}\b", "[account omitted]", value)
    value = re.sub(r"(?<!\w)\+?\d[\d ().-]{7,}\d(?!\w)", "[phone redacted]", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value if len(value) <= limit else value[: limit - 1].rsplit(" ", 1)[0] + "…"


def safe_url(value: Any) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parts = urlsplit(value.strip())
    except ValueError:
        return None
    if parts.scheme.lower() not in {"http", "https"} or not parts.hostname:
        return None
    # No credentials in URLs, and no fragments in canonical source links.
    if parts.username or parts.password:
        return None
    host = parts.hostname.lower()
    try:
        port = parts.port
    except ValueError:
        return None
    netloc = host + (f":{port}" if port and port not in {80, 443} else "")
    return urlunsplit((parts.scheme.lower(), netloc, parts.path or "/", parts.query, ""))[:1200]


def canonical_url(value: str) -> str:
    safe = safe_url(value) or value.strip()
    try:
        p = urlsplit(safe)
        host = (p.hostname or "").lower().removeprefix("www.")
        path = p.path.rstrip("/") or "/"
        return urlunsplit((p.scheme.lower(), host, path, p.query, ""))
    except ValueError:
        return safe


def digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8", "replace")).hexdigest()[:20]


def http_bytes(url: str, *, headers: dict[str, str] | None = None, data: bytes | None = None, timeout: int = 18) -> bytes:
    req_headers = {"User-Agent": USER_AGENT, "Accept": "application/json,application/atom+xml,application/rss+xml,application/xml,text/xml;q=0.9,*/*;q=0.4"}
    if headers:
        req_headers.update(headers)
    request = Request(url, headers=req_headers, data=data, method="POST" if data is not None else "GET")
    try:
        with urlopen(request, timeout=timeout) as response:
            body = response.read(MAX_BODY + 1)
            if len(body) > MAX_BODY:
                raise ValueError(f"response exceeded {MAX_BODY} bytes")
            if response.status < 200 or response.status >= 300:
                raise RuntimeError(f"HTTP {response.status}")
            return body
    except HTTPError as exc:
        raise RuntimeError(f"HTTP {exc.code}") from None
    except URLError as exc:
        reason = getattr(exc, "reason", None)
        # Avoid exposing tokens, full URLs, or request data in logs/status JSON.
        raise RuntimeError(f"network error: {type(reason).__name__ if reason else 'unavailable'}") from None


def http_json(url: str, *, headers: dict[str, str] | None = None, data: bytes | None = None) -> Any:
    return json.loads(http_bytes(url, headers=headers, data=data).decode("utf-8", "replace"))


def load_json(path: Path, fallback: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return fallback


def save_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp.replace(path)


def item_record(*, kind: str, title: Any, url: Any, source: str, summary: Any = "", published_at: Any = None,
                topic: str = "Cybersecurity", source_url: Any = None, confidence: str = "Public-source candidate; verify original",
                extra: dict[str, Any] | None = None) -> dict[str, Any] | None:
    title_text = clean_text(title, 220)
    safe = safe_url(url)
    if not title_text or not safe:
        return None
    pub = parse_date(published_at)
    record: dict[str, Any] = {
        "id": f"{kind}:{digest(canonical_url(safe))}", "kind": kind, "title": title_text,
        "summary": clean_text(summary, 360), "url": safe, "source": clean_text(source, 100),
        "sourceUrl": safe_url(source_url) or safe, "publishedAt": iso(pub) if pub else None,
        "lastSeenAt": iso(), "topics": [clean_text(topic, 90)] if topic else ["Cybersecurity"],
        "confidence": clean_text(confidence, 180), "reviewStatus": "PUBLIC_SOURCE_CANDIDATE",
    }
    if extra:
        for key, value in extra.items():
            # Never add social account/usernames or contact details to public output.
            if key.lower() in {"author", "username", "user_name", "email", "phone", "author_name", "display_name"}:
                continue
            record[key] = value
    return record


def source_status(source_id: str, label: str, status: str, item_count: int = 0, note: str = "", checked_at: str | None = None) -> dict[str, Any]:
    return {"id": source_id, "label": label, "status": status, "itemCount": int(item_count), "lastCheckedAt": checked_at or iso(), "note": clean_text(note, 260)}


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].split(":")[-1].lower()


def child_text(node: ET.Element, names: set[str]) -> str:
    for child in list(node):
        if local_name(child.tag) in names:
            href = child.attrib.get("href") if local_name(child.tag) == "link" else None
            if href:
                return href.strip()
            text = " ".join("".join(child.itertext()).split())
            if text:
                return text
    return ""


def fetch_public_rss_sources(config: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    sources = list(config.get("rssSources", [])) + list(config.get("opportunityFeeds", []))
    if not sources:
        return [], source_status("configured-public-feeds", "Configured public RSS/Atom feeds", "not-configured", 0, "No additional feed URLs are configured. Add only official or otherwise permitted feeds to sources.json.")
    items: list[dict[str, Any]] = []
    errors = 0
    successes = 0
    allowed_kinds = {"news", "learning", "education", "job", "internship", "event", "community"}
    relevant_terms = set(SECURITY_TERMS) | {"university", "universities", "institute", "institute", "admission", "scholarship", "internship", "intern", "student programme", "graduate programme", "trainee", "fellowship", "workshop", "course", "tutorial", "conference", "competition", "hackathon", "ctf"}
    for source in sources[:80]:
        feed_url = safe_url(source.get("url"))
        if not feed_url:
            errors += 1
            continue
        try:
            raw = http_bytes(feed_url)
            root = ET.fromstring(raw)
            successes += 1
            entries = [node for node in root.iter() if local_name(node.tag) in {"item", "entry"}]
            for entry in entries[:60]:
                title = child_text(entry, {"title"})
                link = safe_url(child_text(entry, {"link"}))
                if not link or not title:
                    continue
                summary = child_text(entry, {"description", "summary", "content", "encoded"})
                published = child_text(entry, {"pubdate", "published", "updated", "date", "issued"})
                kind = str(source.get("kind", "learning")).lower()
                if kind not in allowed_kinds:
                    kind = "learning"
                text = (title + " " + summary).lower()
                if any(term in text for term in HIGH_RISK_TOOL_PHRASES):
                    continue
                if not any(term in text for term in relevant_terms) and kind not in {"news", "community"}:
                    continue
                record = item_record(kind=kind, title=title, url=link, source=source.get("label") or source.get("name") or "Public RSS source", source_url=feed_url,
                    summary=summary, published_at=published, topic=source.get("topic") or "Public learning and opportunity feed",
                    confidence=source.get("trust") or "Publisher RSS/Atom candidate; verify original source and date",
                    extra={"feedId": clean_text(source.get("id") or "configured-feed", 80), "reviewStatus": "PUBLIC_SOURCE_CANDIDATE"})
                if record:
                    items.append(record)
        except Exception:
            errors += 1
    items = deduplicate(items)
    status = "fresh" if successes == len(sources) else "partial" if successes or items else "unavailable"
    note = f"{len(items)} items from configured feeds; {successes}/{len(sources)} feeds checked successfully; original publisher links retained."
    if errors:
        note += f" {errors} feed(s) failed or returned an unreadable response."
    return items[:160], source_status("configured-public-feeds", "Configured public RSS/Atom feeds", status, len(items), note)


def fetch_configured_job_boards(config: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    boards = [("Greenhouse", b) for b in config.get("greenhouseBoards", [])] + [("Lever", b) for b in config.get("leverBoards", [])]
    if not boards:
        return [], source_status("employer-job-boards", "Configured employer job boards", "not-configured", 0, "Optional. Add verified public Greenhouse/Lever board identifiers to sources.json; do not guess a company board token.")
    keywords = [str(x).lower() for x in config.get("remoteJobKeywords", SECURITY_TERMS)]
    out: list[dict[str, Any]] = []
    errors = 0
    for provider, board in boards[:50]:
        token = clean_text(board.get("board") or board.get("site") or "", 80)
        label = clean_text(board.get("label") or token, 100)
        if not token or not re.fullmatch(r"[A-Za-z0-9._-]+", token):
            errors += 1
            continue
        try:
            if provider == "Greenhouse":
                payload = http_json(f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true", headers={"Accept": "application/json"})
                rows = payload.get("jobs", []) if isinstance(payload, dict) else []
                for row in rows:
                    if not isinstance(row, dict):
                        continue
                    title = row.get("title") or ""
                    content = clean_text(row.get("content"), 900)
                    location = ((row.get("location") or {}).get("name") if isinstance(row.get("location"), dict) else "")
                    haystack = f"{title} {content} {location}".lower()
                    if not any(term in haystack for term in keywords):
                        continue
                    kind = "job" if not re.search(r"\b(intern(ship)?|student|graduate|trainee|co-op)\b", haystack) else "internship"
                    rec = item_record(kind=kind, title=title, url=row.get("absolute_url"), source=f"{label} · Greenhouse", source_url=f"https://boards.greenhouse.io/{token}", summary=f"{clean_text(location or 'Location not specified', 100)} · {content}", published_at=row.get("updated_at"), topic="Jobs and internships", confidence="Public employer job-board entry; confirm eligibility and close date at employer page", extra={"employer": label, "location": clean_text(location or "Not specified", 100), "sourceProvider": "Greenhouse"})
                    if rec: out.append(rec)
            else:
                payload = http_json(f"https://api.lever.co/v0/postings/{token}?mode=json", headers={"Accept": "application/json"})
                rows = payload if isinstance(payload, list) else []
                for row in rows:
                    if not isinstance(row, dict):
                        continue
                    title = row.get("text") or ""
                    content = clean_text(row.get("descriptionPlain") or row.get("description") or "", 900)
                    categories = row.get("categories") if isinstance(row.get("categories"), dict) else {}
                    location = categories.get("location") or ""
                    haystack = f"{title} {content} {location}".lower()
                    if not any(term in haystack for term in keywords):
                        continue
                    kind = "job" if not re.search(r"\b(intern(ship)?|student|graduate|trainee|co-op)\b", haystack) else "internship"
                    created = row.get("createdAt")
                    published = datetime.fromtimestamp(float(created) / 1000, timezone.utc).isoformat() if isinstance(created, (int, float)) else None
                    rec = item_record(kind=kind, title=title, url=row.get("hostedUrl") or row.get("applyUrl"), source=f"{label} · Lever", source_url=f"https://jobs.lever.co/{token}", summary=f"{clean_text(location or 'Location not specified', 100)} · {content}", published_at=published, topic="Jobs and internships", confidence="Public employer job-board entry; confirm eligibility and close date at employer page", extra={"employer": label, "location": clean_text(location or "Not specified", 100), "sourceProvider": "Lever"})
                    if rec: out.append(rec)
        except Exception:
            errors += 1
    out = deduplicate(out)
    status = "fresh" if out and not errors else "partial" if out or errors < len(boards) else "unavailable"
    note = f"{len(out)} relevant listings from configured public employer boards. Employer boards are not a complete job-market index."
    if errors: note += f" {errors} board(s) could not be checked."
    return out[:180], source_status("employer-job-boards", "Configured employer job boards", status, len(out), note)


def fetch_github_repositories(config: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    query_specs = config.get("githubQueries", [])
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    items: list[dict[str, Any]] = []
    errors = []
    for spec in query_specs[:8]:
        try:
            url = "https://api.github.com/search/repositories?" + urlencode({"q": spec["query"], "sort": "updated", "order": "desc", "per_page": 10})
            payload = http_json(url, headers=headers)
            rows = payload.get("items", []) if isinstance(payload, dict) else []
            for row in rows:
                if not isinstance(row, dict) or row.get("private") is True or row.get("archived") is True:
                    continue
                topics = row.get("topics") if isinstance(row.get("topics"), list) else []
                if any(term in f"{row.get('name', '')} {row.get('description', '')}".lower() for term in HIGH_RISK_TOOL_PHRASES):
                    continue
                info = [clean_text(row.get("language"), 60)] if row.get("language") else []
                info += [clean_text(topic, 60) for topic in topics[:6]]
                record = item_record(
                    kind="repository", title=row.get("name"), url=row.get("html_url"), source="GitHub public repositories",
                    source_url="https://github.com/search?q=" + __import__("urllib.parse", fromlist=["quote_plus"]).quote_plus(spec["query"]),
                    summary=row.get("description") or "Public repository; inspect the README, licence, release activity and issue history before use.",
                    published_at=row.get("updated_at"), topic=spec.get("topic", "Open-source project"),
                    confidence="GitHub public metadata; repository content and safety are not independently vetted",
                    extra={"updatedAt": row.get("updated_at"), "language": clean_text(row.get("language"), 60),
                           "topicsList": info[:7], "stars": max(0, int(row.get("stargazers_count") or 0)),
                           "license": clean_text(((row.get("license") or {}).get("spdx_id") or "Licence not detected"), 80),
                           "repositoryState": "archived" if row.get("archived") else "active"},
                )
                if record:
                    items.append(record)
        except Exception as exc:
            errors.append(f"GitHub search: {type(exc).__name__}; query unavailable")
    status = "fresh" if items and not errors else "partial" if items else "unavailable"
    note = f"{len(items)} public repository candidates; review the README, license, activity, dependencies and safe-use context." if items else "No new repository candidates were returned."
    if errors:
        note += f" {len(errors)} query/query-group(s) could not be checked."
    return items, source_status("github-repositories", "GitHub public repositories", status, len(items), note)


def fetch_remoteok_jobs(config: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    try:
        payload = http_json("https://remoteok.com/api", headers={"Accept": "application/json", "User-Agent": USER_AGENT})
        rows = payload if isinstance(payload, list) else []
        keywords = [str(x).lower() for x in config.get("remoteJobKeywords", SECURITY_TERMS)]
        items = []
        for row in rows:
            if not isinstance(row, dict) or not row.get("id") or not row.get("url"):
                continue
            title = clean_text(row.get("position") or row.get("title"), 180)
            tags = row.get("tags") if isinstance(row.get("tags"), list) else []
            haystack = " ".join([title, clean_text(row.get("description"), 800), " ".join(str(t) for t in tags)]).lower()
            if not title or not any(key in haystack for key in keywords):
                continue
            listing_kind = "internship" if re.search(r"\b(intern(ship)?|student|graduate|trainee|co-op)\b", haystack) else "job"
            record = item_record(
                kind=listing_kind, title=title, url=row.get("url"), source="Remote OK", source_url="https://remoteok.com/faq",
                summary=f"{clean_text(row.get('company'), 100)} · {clean_text(row.get('location') or 'Location not specified', 90)} · {clean_text(' · '.join(str(t) for t in tags[:5]), 140)}",
                published_at=row.get("date") or row.get("epoch"), topic="Jobs and internships",
                confidence="Public Remote OK listing; verify company, eligibility, location and application link before applying",
                extra={"company": clean_text(row.get("company"), 100), "location": clean_text(row.get("location") or "Not specified", 90),
                       "employmentType": "Remote listing", "applyUrl": safe_url(row.get("apply_url")) or safe_url(row.get("url")),
                       "sourceCredit": "Remote OK; open the original listing to apply."},
            )
            if record:
                items.append(record)
        items.sort(key=lambda x: x.get("publishedAt") or "", reverse=True)
        return items[:100], source_status("remoteok-jobs", "Remote OK public jobs feed", "fresh", len(items), "Relevant public listings filtered by cybersecurity keywords. Remote OK asks aggregators to credit it and link directly to original listings.")
    except Exception as exc:
        return [], source_status("remoteok-jobs", "Remote OK public jobs feed", "unavailable", 0, f"Feed could not be checked: {type(exc).__name__}. Previous snapshot entries may be retained as stale candidates.")


def fetch_ctftime_events(config: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    now = now_utc()
    limit_days = max(14, min(120, int(config.get("ctftimeWindowDays", 75))))
    url = "https://ctftime.org/api/v1/events/?" + urlencode({"limit": 100, "start": int(now.timestamp()), "finish": int((now + timedelta(days=limit_days)).timestamp())})
    try:
        payload = http_json(url, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
        rows = payload if isinstance(payload, list) else []
        items = []
        for row in rows:
            if not isinstance(row, dict):
                continue
            ends = parse_date(row.get("finish") or row.get("end"))
            start = parse_date(row.get("start") or row.get("starts"))
            if ends and ends < now:
                continue
            record = item_record(
                kind="event", title=row.get("title"), url=row.get("ctftime_url") or row.get("url"), source="CTFtime public event listing",
                source_url="https://ctftime.org/event/list/upcoming", summary=row.get("description") or "Public CTF/infosec event listing. Verify eligibility, rules, format, dates and participation requirements at the original page.",
                published_at=iso(start) if start else None, topic="CTF and cybersecurity events",
                confidence="Public event listing; dates and eligibility should be confirmed with the organiser",
                extra={"startsAt": iso(start) if start else None, "endsAt": iso(ends) if ends else None,
                       "format": "On-site" if row.get("onsite") else "Online or hybrid; confirm with organiser",
                       "eligibility": clean_text(row.get("restrictions") or "Check original event rules", 120)},
            )
            if record:
                items.append(record)
        items.sort(key=lambda x: x.get("startsAt") or "9999", reverse=False)
        return items[:100], source_status("ctftime-events", "CTFtime public events API", "fresh", len(items), "Upcoming public events; confirm registration windows and competition rules at the organiser.")
    except Exception as exc:
        return [], source_status("ctftime-events", "CTFtime public events API", "unavailable", 0, f"Events could not be checked: {type(exc).__name__}. Previous snapshot entries may be retained as stale candidates.")


def reddit_token() -> str:
    client_id = os.getenv("REDDIT_CLIENT_ID", "").strip()
    client_secret = os.getenv("REDDIT_CLIENT_SECRET", "").strip()
    user_agent = os.getenv("REDDIT_USER_AGENT", "").strip()
    if not (client_id and client_secret and user_agent):
        return ""
    encoded = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    body = urlencode({"grant_type": "client_credentials"}).encode()
    token_payload = http_json("https://www.reddit.com/api/v1/access_token", headers={"Authorization": f"Basic {encoded}", "Content-Type": "application/x-www-form-urlencoded", "User-Agent": user_agent}, data=body)
    return str(token_payload.get("access_token") or "") if isinstance(token_payload, dict) else ""


def fetch_reddit(config: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if not (os.getenv("REDDIT_CLIENT_ID") and os.getenv("REDDIT_CLIENT_SECRET") and os.getenv("REDDIT_USER_AGENT")):
        return [], source_status("reddit-public-search", "Reddit public discussions", "needs-approved-access", 0, "Not connected. Requires approved API access and compliance with current Reddit Data API terms; no scraping fallback is used.")
    try:
        token = reddit_token()
        if not token:
            raise RuntimeError("OAuth token unavailable")
        items: list[dict[str, Any]] = []
        queries = config.get("redditQueries", [])
        for query in queries[:3]:
            url = "https://oauth.reddit.com/search.json?" + urlencode({"q": query, "sort": "new", "t": "week", "limit": 25})
            payload = http_json(url, headers={"Authorization": f"Bearer {token}", "User-Agent": os.getenv("REDDIT_USER_AGENT", USER_AGENT)})
            children = ((payload.get("data") or {}).get("children") or []) if isinstance(payload, dict) else []
            for child in children:
                post = child.get("data") if isinstance(child, dict) else None
                if not isinstance(post, dict):
                    continue
                permalink = post.get("permalink")
                record = item_record(kind="community", title=post.get("title"), url=("https://www.reddit.com" + permalink if isinstance(permalink, str) and permalink.startswith("/") else None),
                    source="Reddit public discussion", source_url="https://www.reddit.com/", summary=post.get("selftext") or "Public community discussion; treat comments as user-generated claims and check primary sources.",
                    published_at=datetime.fromtimestamp(float(post.get("created_utc") or 0), timezone.utc).isoformat() if post.get("created_utc") else None,
                    topic="Community discussion", confidence="Public user-generated discussion; not independently verified",
                    extra={"community": clean_text(post.get("subreddit_name_prefixed") or "Reddit community", 80), "score": max(0, int(post.get("score") or 0))})
                if record:
                    items.append(record)
        items = deduplicate(items)[:80]
        return items, source_status("reddit-public-search", "Reddit public discussions", "fresh" if items else "partial", len(items), "Public posts only. Keep excerpts short, link to Reddit, respect removals, rate limits and current API terms.")
    except Exception as exc:
        return [], source_status("reddit-public-search", "Reddit public discussions", "unavailable", 0, f"Approved Reddit access could not be used: {type(exc).__name__}.")


def fetch_x_public_posts(config: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    token = os.getenv("X_BEARER_TOKEN", "").strip()
    if not token:
        return [], source_status("x-public-search", "X public post search", "needs-provider-access", 0, "Not connected. Configure a permitted X API plan and bearer token to enable recent public search; scraping is not used.")
    queries = config.get("xQueries", [])
    all_items = []
    errors = 0
    for query in queries[:2]:
        url = "https://api.x.com/2/tweets/search/recent?" + urlencode({"query": query, "max_results": 25, "tweet.fields": "created_at,lang,public_metrics"})
        try:
            payload = http_json(url, headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
            rows = payload.get("data", []) if isinstance(payload, dict) else []
            for row in rows:
                if not isinstance(row, dict) or not row.get("id"):
                    continue
                record = item_record(kind="community", title=clean_text(row.get("text"), 180) or "Public post", url=f"https://x.com/i/web/status/{row['id']}", source="X public post search", source_url="https://x.com/search", summary=row.get("text"), published_at=row.get("created_at"), topic="Public community signal", confidence="Public post; user-generated claims require independent verification", extra={"language": clean_text(row.get("lang"), 12)})
                if record:
                    all_items.append(record)
        except Exception:
            errors += 1
    all_items = deduplicate(all_items)
    status = "fresh" if all_items and not errors else "partial" if all_items else "unavailable"
    note = "Recent public posts searched through the configured X API; only short excerpts and generic post links are retained."
    if errors:
        note += f" {errors} query/query-group(s) failed, possibly due to plan or quota restrictions."
    return all_items[:80], source_status("x-public-search", "X public post search", status, len(all_items), note)


def fetch_instagram_public_hashtags(config: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    token = os.getenv("INSTAGRAM_ACCESS_TOKEN", "").strip()
    ig_user_id = os.getenv("INSTAGRAM_IG_USER_ID", "").strip()
    if not (token and ig_user_id):
        return [], source_status("instagram-hashtags", "Instagram public hashtag discovery", "needs-approved-access", 0, "Not connected. Requires eligible professional-account setup, approved permissions and access token. This is hashtag-scoped discovery, not every Instagram post.")
    api_version = os.getenv("INSTAGRAM_GRAPH_API_VERSION", "").strip() or "v24.0"
    hashtags = [str(x).lstrip("#") for x in config.get("instagramHashtags", []) if str(x).strip()][:8]
    items = []
    errors = 0
    for hashtag in hashtags:
        try:
            base = f"https://graph.facebook.com/{api_version}"
            search = http_json(base + "/ig_hashtag_search?" + urlencode({"user_id": ig_user_id, "q": hashtag, "access_token": token}))
            rows = search.get("data", []) if isinstance(search, dict) else []
            if not rows:
                continue
            hashtag_id = rows[0].get("id")
            if not hashtag_id:
                continue
            payload = http_json(base + f"/{hashtag_id}/recent_media?" + urlencode({"user_id": ig_user_id, "fields": "id,caption,media_type,permalink,timestamp", "access_token": token}))
            for row in payload.get("data", []) if isinstance(payload, dict) else []:
                record = item_record(kind="community", title=(clean_text(row.get("caption"), 180) or f"Public #{hashtag} post"), url=row.get("permalink"), source="Instagram public hashtag discovery", source_url=f"https://www.instagram.com/explore/tags/{hashtag}/", summary=row.get("caption"), published_at=row.get("timestamp"), topic=f"#{hashtag}", confidence="Public hashtag-scoped media; captions and claims are not independently verified", extra={"mediaType": clean_text(row.get("media_type"), 30), "hashtag": hashtag})
                if record:
                    items.append(record)
        except Exception:
            errors += 1
    items = deduplicate(items)
    status = "fresh" if items and not errors else "partial" if items else "unavailable" if errors else "fresh"
    note = "Hashtag-scoped public media only; not an index of all Instagram content. Configure official permissions and ensure API terms permit this use."
    if errors:
        note += f" {errors} hashtag(s) could not be checked."
    return items[:80], source_status("instagram-hashtags", "Instagram public hashtag discovery", status, len(items), note)


def fetch_linkedin_authorized_org_posts() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    token = os.getenv("LINKEDIN_ACCESS_TOKEN", "").strip()
    org_urn = os.getenv("LINKEDIN_ORG_URN", "").strip()
    if not (token and org_urn):
        return [], source_status("linkedin-authorized-posts", "LinkedIn authorized organization posts", "needs-approved-access", 0, "Not connected. Standard API access does not provide an unrestricted global public-post search. An approved organization-scoped token and permission are required for posts from an authorized organization.")
    version = os.getenv("LINKEDIN_VERSION", "").strip() or "202607"
    query = urlencode({"q": "author", "author": org_urn, "count": 25, "sortBy": "LAST_MODIFIED"})
    url = "https://api.linkedin.com/rest/posts?" + query
    try:
        payload = http_json(url, headers={"Authorization": f"Bearer {token}", "LinkedIn-Version": version, "X-Restli-Protocol-Version": "2.0.0", "Accept": "application/json"})
        elements = payload.get("elements", []) if isinstance(payload, dict) else []
        items = []
        for row in elements:
            if not isinstance(row, dict):
                continue
            urn = str(row.get("id") or "")
            commentary = row.get("commentary") or ""
            content = row.get("content") if isinstance(row.get("content"), dict) else {}
            share = content.get("share") if isinstance(content.get("share"), dict) else {}
            headline = (share.get("shareCommentary") or {}).get("text") if isinstance(share.get("shareCommentary"), dict) else ""
            text_value = clean_text(commentary or headline, 180)
            if not text_value or not urn:
                continue
            post_link = "https://www.linkedin.com/feed/update/" + urn.replace(":", "%3A")
            created = (row.get("createdAt") or row.get("lastModifiedAt"))
            published = datetime.fromtimestamp(float(created) / 1000, timezone.utc).isoformat() if isinstance(created, (int, float)) else None
            record = item_record(kind="community", title=text_value, url=post_link, source="LinkedIn authorized organization posts", source_url="https://www.linkedin.com/", summary=text_value, published_at=published, topic="Professional community post", confidence="Authorized organization-scoped post; not global LinkedIn search")
            if record:
                items.append(record)
        return deduplicate(items)[:50], source_status("linkedin-authorized-posts", "LinkedIn authorized organization posts", "fresh", len(items), "Only posts accessible through the configured authorized organization identity are indexed; global public-post discovery is not available through this connector.")
    except Exception as exc:
        return [], source_status("linkedin-authorized-posts", "LinkedIn authorized organization posts", "unavailable", 0, f"Approved organization post access failed: {type(exc).__name__}.")


def read_existing_snapshots(config: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    items: list[dict[str, Any]] = []
    statuses: list[dict[str, Any]] = []
    now = now_utc()
    freshness_path = WEBSITE / "public" / "data" / "site-freshness.json"
    freshness = load_json(freshness_path, {})
    cyber = load_json(CYBERPULSE_PATH, {})
    cyber_items = cyber.get("items", []) if isinstance(cyber, dict) else []
    for row in cyber_items if isinstance(cyber_items, list) else []:
        if not isinstance(row, dict):
            continue
        kind = "community" if row.get("type") == "community-signal" else "news"
        item = item_record(kind=kind, title=row.get("title"), url=row.get("url"), source=row.get("source") or "CyberPulse public feeds", source_url=row.get("sourceUrl") or row.get("url"), summary=row.get("summary"), published_at=row.get("publishedAt") or row.get("updatedAt") or row.get("firstSeenAt"), topic=row.get("topic") or "Security news", confidence=row.get("confidence") or "Public-source news lead", extra={"cveId": clean_text(row.get("cveId"), 32) or None})
        if item:
            items.append(item)
    cyber_at = parse_date(cyber.get("generatedAt") or cyber.get("lastSuccessfulSyncAt")) if isinstance(cyber, dict) else None
    cyber_age = (now - cyber_at).total_seconds() / 3600 if cyber_at else None
    cyber_status = "fresh" if cyber.get("status") == "ok" and cyber_age is not None and cyber_age <= 12 else "partial" if cyber.get("status") == "partial" and cyber_age is not None and cyber_age <= 24 else "stale" if cyber_items else "unavailable"
    statuses.append(source_status("cyberpulse-news", "CyberPulse news and advisories", cyber_status, len(cyber_items) if isinstance(cyber_items, list) else 0, f"Existing six-hour public-source refresh; latest snapshot age: {int(cyber_age)}h." if cyber_age is not None else "No timestamped snapshot available.", iso(cyber_at) if cyber_at else None))

    yt = load_json(YOUTUBE_PATH, {})
    yt_items = yt.get("items", []) if isinstance(yt, dict) else []
    for row in yt_items if isinstance(yt_items, list) else []:
        if not isinstance(row, dict):
            continue
        item = item_record(kind="video", title=row.get("title"), url=row.get("url"), source="YouTube public discovery", source_url="https://www.youtube.com/", summary=row.get("summary"), published_at=row.get("publishedAt"), topic=", ".join(row.get("suggestedTopics", [])[:3]) if isinstance(row.get("suggestedTopics"), list) else "Cybersecurity video", confidence="Automated discovery candidate; review creator, content and date", extra={"reviewStatus": row.get("reviewStatus") or "UNVERIFIED_DISCOVERY", "channelLabel": "YouTube creator", "videoId": clean_text(row.get("videoId"), 24)})
        if item:
            items.append(item)
    yt_at = parse_date(yt.get("generatedAt")) if isinstance(yt, dict) else None
    yt_age = (now - yt_at).total_seconds() / 3600 if yt_at else None
    yt_status = "fresh" if yt.get("status") == "available" and yt_age is not None and yt_age <= 36 else "stale" if yt_items else "unavailable"
    statuses.append(source_status("youtube-discovery", "YouTube recent public videos", yt_status, len(yt_items) if isinstance(yt_items, list) else 0, yt.get("refreshNote") or (f"Existing API-key-based discovery snapshot; latest snapshot age: {int(yt_age)}h." if yt_age is not None else "No YouTube discovery snapshot available."), iso(yt_at) if yt_at else None))

    review = load_json(RESOURCE_REVIEW_PATH, {})
    report = review.get("candidates", {}) if isinstance(review, dict) else {}
    rss_rows = report.get("rss", []) if isinstance(report, dict) else []
    for row in rss_rows if isinstance(rss_rows, list) else []:
        if not isinstance(row, dict):
            continue
        item = item_record(kind="learning", title=row.get("title"), url=row.get("url"), source=row.get("source") or "Public publisher feed", source_url=row.get("url"), summary=row.get("summary"), published_at=row.get("publishedAt"), topic=", ".join(row.get("suggestedTopics", [])[:3]) if isinstance(row.get("suggestedTopics"), list) else "Learning material", confidence=row.get("sourceTrust") or "Publisher-feed discovery lead", extra={"reviewStatus": "UNVERIFIED_DISCOVERY", "accessStatus": clean_text(row.get("accessStatus"), 240)})
        if item:
            items.append(item)
    review_at = parse_date(review.get("generatedAt")) if isinstance(review, dict) else None
    review_age = (now - review_at).total_seconds() / 3600 if review_at else None
    statuses.append(source_status("publisher-learning-feeds", "Publisher RSS learning discovery", "fresh" if review_age is not None and review_age <= 30 else "stale" if rss_rows else "unavailable", len(rss_rows) if isinstance(rss_rows, list) else 0, f"Existing review-only feed snapshot; latest report age: {int(review_age)}h." if review_age is not None else "No publisher discovery report available.", iso(review_at) if review_at else None))

    cert = load_json(CERT_STATUS_PATH, {})
    source_rows = cert.get("sources", []) if isinstance(cert, dict) else []
    cert_at = parse_date(cert.get("generatedAt") or cert.get("checkedAt")) if isinstance(cert, dict) else None
    cert_note = f"Certification-source status available for {len(source_rows)} source record(s)." if isinstance(source_rows, list) else "Certification snapshot is present."
    statuses.append(source_status("certification-monitor", "Certification source monitor", "fresh" if cert_at and (now - cert_at).total_seconds() <= 48 * 3600 else "stale" if cert else "unavailable", len(source_rows) if isinstance(source_rows, list) else 0, cert_note, iso(cert_at) if cert_at else None))
    return items, statuses


def deduplicate(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    best: dict[str, dict[str, Any]] = {}
    for item in items:
        url = safe_url(item.get("url"))
        if not url:
            continue
        key = canonical_url(url)
        old = best.get(key)
        current_date = str(item.get("publishedAt") or item.get("updatedAt") or "")
        old_date = str((old or {}).get("publishedAt") or (old or {}).get("updatedAt") or "")
        score = (10 if item.get("confidence", "").lower().startswith("official") else 0) + (3 if item.get("kind") in {"repository", "job", "event"} else 0) + (2 if item.get("summary") else 0)
        old_score = (10 if (old or {}).get("confidence", "").lower().startswith("official") else 0) + (3 if (old or {}).get("kind") in {"repository", "job", "event"} else 0) + (2 if (old or {}).get("summary") else 0)
        if old is None or (score, current_date) > (old_score, old_date):
            best[key] = {**item, "url": url}
    return list(best.values())


def load_previous_items() -> list[dict[str, Any]]:
    previous = load_json(OUTPUT_PATH, {})
    rows = previous.get("items", []) if isinstance(previous, dict) else []
    cutoff = now_utc() - timedelta(days=120)
    out = []
    for row in rows if isinstance(rows, list) else []:
        if not isinstance(row, dict) or not safe_url(row.get("url")):
            continue
        seen = parse_date(row.get("publishedAt") or row.get("lastSeenAt"))
        kind = row.get("kind")
        max_age = 45 if kind in {"job", "event", "community", "news", "video", "learning"} else 120
        if seen and seen < now_utc() - timedelta(days=max_age):
            continue
        row = dict(row)
        row["snapshotStatus"] = "retained-previous-snapshot"
        out.append(row)
    return out


def connector_placeholders() -> list[dict[str, Any]]:
    return [
        source_status("linkedin-global-search", "LinkedIn global public-post search", "not-supported-by-standard-connector", 0, "No unrestricted global public-post search is claimed. Authorized organization-scoped post retrieval can be configured separately."),
        source_status("social-platform-coverage", "Platform coverage guardrail", "policy-limited", 0, "Connectors only index public material returned by an approved API/feed. Private posts, login-gated material and unavailable platform data are not scraped."),
    ]


def build_snapshot(config: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    snapshot_items, statuses = read_existing_snapshots(config)
    connectors = [
        ("Configured RSS/Atom feeds", lambda: fetch_public_rss_sources(config)),
        ("Configured employer job boards", lambda: fetch_configured_job_boards(config)),
        ("GitHub", lambda: fetch_github_repositories(config)),
        ("Remote OK jobs", lambda: fetch_remoteok_jobs(config)),
        ("CTFtime events", lambda: fetch_ctftime_events(config)),
        ("Reddit", lambda: fetch_reddit(config)),
        ("X", lambda: fetch_x_public_posts(config)),
        ("Instagram", lambda: fetch_instagram_public_hashtags(config)),
        ("LinkedIn organization posts", fetch_linkedin_authorized_org_posts),
    ]
    errors = []
    fresh_items: list[dict[str, Any]] = []
    for label, runner in connectors:
        try:
            items, status = runner()
        except Exception as exc:
            items = []
            status = source_status(label.lower().replace(" ", "-"), label, "unavailable", 0, f"Connector failed safely: {type(exc).__name__}.")
        fresh_items.extend(items)
        statuses.append(status)
        if status["status"] in {"unavailable", "partial"}:
            errors.append({"source": label, "status": status["status"], "note": status["note"]})
    statuses.extend(connector_placeholders())
    previous = load_previous_items()
    items = deduplicate(snapshot_items + fresh_items + previous)
    now = now_utc()
    items.sort(key=lambda x: (parse_date(x.get("publishedAt") or x.get("updatedAt") or x.get("lastSeenAt")) or datetime(1970, 1, 1, tzinfo=timezone.utc)), reverse=True)
    cap = max(50, min(700, int(config.get("maxOutputItems", 350))))
    items = items[:cap]
    fresh_sources = sum(1 for row in statuses if row["status"] == "fresh")
    active_sources = sum(1 for row in statuses if row["status"] not in {"unavailable", "needs-approved-access", "needs-provider-access", "not-supported-by-standard-connector", "policy-limited"})
    status = "fresh" if fresh_sources >= 3 and not errors else "partial" if fresh_sources or items else "unavailable"
    note = "Public discovery snapshot from configured APIs, feeds, and existing OpenCyberPath snapshots. It does not claim complete coverage of the internet. Candidate posts, jobs, repositories, and events require source-level review; open original pages before relying on them."
    snapshot = {"schemaVersion": 1, "generatedAt": iso(now), "status": status, "itemCount": len(items), "items": items, "note": note}
    automation_status = {
        "schemaVersion": 1, "generatedAt": iso(now), "status": status,
        "summary": {"connectedSources": active_sources, "freshSources": fresh_sources, "sourceCount": len(statuses), "latestItemAt": next((x.get("publishedAt") for x in items if x.get("publishedAt")), None)},
        "sources": statuses, "errors": errors,
        "privacy": {"scope": "public data only", "personalProfilesStored": False, "privateOrLoginGatedContentScraped": False, "republication": "Short excerpts with original links; comply with each source's current terms and removal rules."},
        "notes": ["A source marked unavailable is not proof that the platform has no new content.", "LinkedIn global public-post discovery is not supported through this standard connector; only specifically authorized scopes can be integrated.", "Social API keys must be stored in repository Actions secrets, never in frontend code or the public JSON files."]
    }
    return snapshot, automation_status


def self_test() -> int:
    assert parse_date("2026-10-20T12:00:00Z") is not None
    assert parse_date("not a date") is None
    assert safe_url("https://example.com/resource#section") == "https://example.com/resource"
    assert safe_url("javascript:alert(1)") is None
    assert safe_url("https://user:pass@example.com") is None
    rows = [item_record(kind="job", title="Security Intern", url="https://remoteok.com/l/1", source="Remote OK"),
            item_record(kind="job", title="Duplicate", url="https://remoteok.com/l/1#apply", source="Remote OK")]
    assert len(deduplicate([x for x in rows if x])) == 1
    social = item_record(kind="community", title="Public post", url="https://x.com/i/web/status/1", source="X", extra={"username": "must not survive", "language": "en"})
    assert social and "username" not in social
    config = load_json(CONFIG_PATH, {})
    assert config.get("githubQueries") and config.get("remoteJobKeywords") and config.get("rssSources") is not None
    snap = {"items": deduplicate([x for x in rows if x]), "status": "partial"}
    assert all(safe_url(x.get("url")) for x in snap["items"])
    print("OpenCyberPath discovery self-test: PASS")
    return 0


def main() -> int:
    if "--self-test" in sys.argv:
        return self_test()
    config = load_json(CONFIG_PATH, {})
    if not config:
        print(f"Missing or invalid config: {CONFIG_PATH}", file=sys.stderr)
        return 2
    snapshot, status = build_snapshot(config)
    save_json(OUTPUT_PATH, snapshot)
    save_json(STATUS_PATH, status)
    print(f"Discovery snapshot written: {OUTPUT_PATH} ({len(snapshot['items'])} candidates; status={snapshot['status']})")
    print(f"Automation status written: {STATUS_PATH} ({status['summary']['freshSources']} fresh sources; status={status['status']})")
    for source in status["sources"]:
        print(f"- {source['label']}: {source['status']} ({source['itemCount']}) — {source['note']}")
    # Source outages are reflected in the status file and should not erase data or fail publishing.
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
