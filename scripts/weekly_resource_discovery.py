#!/usr/bin/env python3
"""Generate a weekly, review-only queue of newly published security learning material.

RSS content and YouTube API results are candidates, not automatically trusted entries.
No catalogue file is edited by this discovery script.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEBSITE = ROOT / "website"
CONFIG_PATH = ROOT / "scripts" / "resource-review-sources.json"
HEALTH_PATH = WEBSITE / "src" / "data" / "resourceHealth.generated.json"
REPORT_DIR = WEBSITE / "reports"
REPORT_JSON = REPORT_DIR / "weekly-resource-review.json"
REPORT_MD = REPORT_DIR / "weekly-resource-review.md"
USER_AGENT = "OpenCyberPath-WeeklyResourceReview/1.0 (+https://github.com/hemanthkadiyala01-sentinel/open-cyber-path)"
LEARNING_TERMS = (
    "tutorial", "course", "training", "learn", "learning", "lab", "workshop",
    "hands-on", "getting started", "beginner", "guide", "how to", "explained",
    "walkthrough", "playbook", "cheat sheet", "checklist", "academy", "exercise",
    "blue team", "threat hunt", "threat hunting", "forensic", "siem", "detection",
    "network analysis", "cloud security", "web security", "incident response", "yara",
)
TOPIC_HINTS = {
    "SOC & SIEM": ("soc", "siem", "sentinel", "splunk", "wazuh", "log analysis", "alert triage"),
    "Threat Hunting": ("threat hunt", "threat hunting", "telemetry", "detection engineering", "incident response"),
    "DFIR": ("forensic", "dfir", "digital evidence", "incident response", "memory analysis"),
    "Networking": ("wireshark", "network analysis", "dns", "tcp", "packet capture", "network security"),
    "Web Security": ("owasp", "portswigger", "web security", "http", "sql injection", "xss", "bug bounty"),
    "Cloud Security": ("cloud security", "aws", "azure", "sentinel", "cloud posture", "iam"),
    "Malware Analysis": ("yara", "malware", "reverse engineering", "static analysis", "sandbox"),
    "GRC": ("grc", "nist", "risk management", "compliance", "controls", "governance"),
    "Threat Intelligence / OSINT": ("osint", "threat intelligence", "ioc", "indicators of compromise"),
    "Foundations": ("beginner", "fundamentals", "getting started", "introduction", "basics", "linux command"),
}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    value = value.strip()
    try:
        parsed = parsedate_to_datetime(value)
    except (TypeError, ValueError, OverflowError):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except (TypeError, ValueError, OverflowError):
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def normalise_url(url: str) -> str:
    """Canonicalise common URL variants for deduplication only."""
    from urllib.parse import urlsplit, urlunsplit
    try:
        parts = urlsplit(url.strip())
        host = (parts.hostname or "").lower()
        if host.startswith("www."):
            host = host[4:]
        path = parts.path.rstrip("/") or "/"
        query = parts.query
        if host in {"youtube.com", "m.youtube.com"}:
            query_parts = urllib.parse.parse_qs(query)
            video_id = (query_parts.get("v") or [None])[0]
            if video_id:
                return f"youtube:video:{video_id}"
        if host == "youtu.be":
            video_id = parts.path.strip("/").split("/")[0]
            if video_id:
                return f"youtube:video:{video_id}"
        # Fragments rarely distinguish a resource page; query parameters are retained.
        return urlunsplit((parts.scheme.lower(), host, path, query, ""))
    except ValueError:
        return url.strip()


def fetch_bytes(url: str, timeout: int = 18) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status < 200 or response.status >= 400:
            raise RuntimeError(f"HTTP {response.status}")
        return response.read(2_000_000)


def xml_local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def child_value(node: ET.Element, names: set[str]) -> str:
    for child in list(node):
        if xml_local_name(child.tag) in names:
            if xml_local_name(child.tag) == "link":
                href = child.attrib.get("href")
                if href:
                    return href.strip()
            value = " ".join("".join(child.itertext()).split())
            if value:
                return value
    return ""


def parse_feed(payload: bytes, source: dict, cutoff: datetime) -> tuple[list[dict], str | None]:
    try:
        root = ET.fromstring(payload)
    except ET.ParseError as error:
        return [], f"XML parse error: {error}"
    entries = [item for item in root.iter() if xml_local_name(item.tag) in {"item", "entry"}]
    results = []
    for item in entries:
        title = child_value(item, {"title"})
        link = child_value(item, {"link"})
        date_text = child_value(item, {"pubdate", "published", "updated", "date", "dc:date"})
        summary = child_value(item, {"description", "summary", "content", "encoded"})
        if not title or not link or not link.startswith(("https://", "http://")):
            continue
        published = parse_date(date_text)
        if published and published < cutoff:
            continue
        searchable = f"{title} {summary}".lower()
        score = sum(1 for term in LEARNING_TERMS if term in searchable)
        if score == 0:
            continue
        # Prefer tutorials and how-to material over incident-news reports.
        if any(term in searchable for term in ("tutorial", "training", "how to", "getting started", "hands-on", "lab", "guide", "learn", "course", "workshop")):
            score += 2
        candidate = {
            "kind": "publisher-feed",
            "title": title[:300],
            "url": link,
            "source": source["name"],
            "publishedAt": published.isoformat() if published else None,
            "publishedDateStatus": "date found in feed" if published else "feed date unavailable",
            "sourceCategory": source.get("category", "Cybersecurity"),
            "sourceTrust": source.get("trust", "curated publisher feed"),
            "summary": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", summary))[:380],
            "suggestedTopics": topic_hints(searchable),
            "learningRelevanceScore": score,
            "accessStatus": "Not verified; confirm that the page is useful learning material and check current free/account terms.",
        }
        results.append(candidate)
    return results, None


def topic_hints(text: str) -> list[str]:
    return [topic for topic, terms in TOPIC_HINTS.items() if any(term in text for term in terms)] or ["Review topic manually"]


def existing_catalogue_urls() -> set[str]:
    candidates = set()
    scan_dirs = [WEBSITE / "src" / "data", WEBSITE / "src" / "components"]
    url_re = re.compile(r"https?://[^\s\"'<>\\)\]}]+", re.IGNORECASE)
    for folder in scan_dirs:
        if not folder.exists():
            continue
        for file_path in folder.rglob("*"):
            if file_path.suffix.lower() not in {".js", ".jsx", ".mjs", ".json"}:
                continue
            try:
                body = file_path.read_text(encoding="utf-8-sig")
            except (OSError, UnicodeError):
                continue
            for raw in url_re.findall(body):
                candidates.add(normalise_url(raw.rstrip(".,;:")))
    return candidates


def fetch_youtube_candidates(api_key: str, queries: list[dict], known_urls: set[str], cutoff: datetime) -> tuple[list[dict], list[str]]:
    results: list[dict] = []
    errors: list[str] = []
    seen: set[str] = set()
    for item in queries:
        params = urllib.parse.urlencode({
            "part": "snippet", "type": "video", "order": "date", "maxResults": "10",
            "publishedAfter": cutoff.isoformat().replace("+00:00", "Z"),
            "regionCode": "IN", "relevanceLanguage": "en", "safeSearch": "moderate",
            "q": item["query"], "key": api_key,
        })
        url = "https://www.googleapis.com/youtube/v3/search?" + params
        try:
            payload = json.loads(fetch_bytes(url, timeout=15))
        except Exception as error:  # keep the weekly report useful even if a query fails
            errors.append(f"YouTube query '{item['query']}': {type(error).__name__}; API result unavailable")
            continue
        for row in payload.get("items", []):
            video_id = (row.get("id") or {}).get("videoId")
            snippet = row.get("snippet") or {}
            title = re.sub(r"\s+", " ", snippet.get("title", "")).strip()
            if not video_id or not title:
                continue
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            normalised = normalise_url(video_url)
            if normalised in known_urls or normalised in seen:
                continue
            seen.add(normalised)
            searchable = f"{title} {snippet.get('description', '')}".lower()
            score = sum(1 for term in LEARNING_TERMS if term in searchable)
            if score == 0:
                # The query itself provides a topic signal, but results still need human review.
                score = 1
            results.append({
                "kind": "youtube-video",
                "title": title[:300],
                "url": video_url,
                "source": snippet.get("channelTitle", "YouTube publisher"),
                "publishedAt": snippet.get("publishedAt"),
                "publishedDateStatus": "YouTube API publishedAt field",
                "sourceCategory": item.get("category", "Cybersecurity"),
                "sourceTrust": "Creator and quality require manual review",
                "summary": re.sub(r"\s+", " ", snippet.get("description", ""))[:380],
                "suggestedTopics": topic_hints(searchable),
                "learningRelevanceScore": score,
                "accessStatus": "Not verified; confirm channel credibility, video content, public availability, and whether the video is useful for the selected learning path.",
            })
    return results, errors


def markdown_escape(value: str) -> str:
    return str(value or "").replace("|", "\\|").replace("\n", " ").strip()


def build_markdown(report: dict) -> str:
    generated = report["generatedAt"]
    lines = [
        "# OpenCyberPath Weekly Resource Review",
        "",
        f"Generated: {generated}",
        "",
        "> This is a discovery and link-health report, not an auto-approved curriculum list. Newly discovered items are not inserted into the learner-facing catalogue automatically. Check learning value, source credibility, free/access terms, direct URL, content freshness, and safety/authorization notes before adding them.",
        "",
        "## Existing catalogue link health",
        "",
    ]
    summary = report.get("linkHealth", {}).get("summary", {})
    lines.append(f"- Unique URLs checked: **{summary.get('checkedUrls', 0)}**")
    lines.append(f"- Responded to HTTP request: **{summary.get('healthy', 0)}**")
    lines.append(f"- Possible broken links (404/410): **{summary.get('broken', 0)}**")
    lines.append(f"- Manual review required (blocked/transient/unknown): **{summary.get('review', 0)}**")
    lines.append("")
    lines.append("A responding URL is not proof that the content is accurate, relevant, free, or still the intended resource. A blocked or transient response is not automatically considered broken.")
    for status, label in [("broken", "Possible broken links"), ("review", "Links needing manual review")]:
        problem_items = [item for item in report.get("linkHealth", {}).get("resources", []) if item.get("status") == status]
        lines.extend(["", f"### {label}", ""])
        if not problem_items:
            lines.append("No items in this category for this run.")
        else:
            for item in problem_items[:40]:
                title = (item.get("entries") or [{}])[0].get("title") or item.get("url")
                code = f" (HTTP {item['statusCode']})" if item.get("statusCode") else ""
                lines.append(f"- [{markdown_escape(title)}]({item['url']}) — {markdown_escape(item.get('detail', ''))}{code}")
    lines.extend(["", "## New publisher-feed candidates", ""])
    rss = report.get("candidates", {}).get("rss", [])
    if not rss:
        lines.append("No new relevant items passed the keyword/date heuristic this week, or feeds were unavailable.")
    for item in rss:
        published = item.get("publishedAt") or "publication date not confirmed"
        topics = ", ".join(item.get("suggestedTopics", []))
        lines.append(f"- **[{markdown_escape(item['title'])}]({item['url']})** — {markdown_escape(item['source'])}; {published}; topic hints: {markdown_escape(topics)}. {markdown_escape(item.get('accessStatus', ''))}")
        if item.get("summary"):
            lines.append(f"  - {markdown_escape(item['summary'])}")
    lines.extend(["", "## New YouTube candidates", ""])
    youtube = report.get("candidates", {}).get("youtube", [])
    if not youtube:
        lines.append("No new video candidates were returned. If YouTube discovery is not configured, add the repository secret YOUTUBE_API_KEY and enable YouTube Data API v3 for its Google Cloud project.")
    for item in youtube:
        published = item.get("publishedAt") or "publication date not confirmed"
        topics = ", ".join(item.get("suggestedTopics", []))
        lines.append(f"- **[{markdown_escape(item['title'])}]({item['url']})** — channel: {markdown_escape(item['source'])}; {published}; topic hints: {markdown_escape(topics)}. {markdown_escape(item.get('accessStatus', ''))}")
    if report.get("feedErrors") or report.get("youtubeErrors"):
        lines.extend(["", "## Sources that could not be checked", ""])
        for error in report.get("feedErrors", []) + report.get("youtubeErrors", []):
            lines.append(f"- {markdown_escape(error)}")
    lines.extend(["", "## Recommended review checklist", "", "- Confirm direct destination and whether it is a video, written guide, course page, tutorial hub, or interactive lab.", "- Confirm creator/provider credibility and whether the resource actually teaches a useful skill.", "- Verify current free/free-tier/account/pricing terms; do not infer free access from an accessible landing page.", "- Add prerequisites, level, topic, learning outcome, canonical URL, and a clear safety/authorization note.", "- Avoid duplicates and prefer current official instructions for version-sensitive setup.", ""])
    return "\n".join(lines)


def main() -> int:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    now = now_utc()
    cutoff = now - timedelta(days=int(config.get("reviewWindowDays", 21)))
    known_urls = existing_catalogue_urls()
    rss_candidates: list[dict] = []
    feed_errors: list[str] = []
    for source in config.get("rssSources", []):
        try:
            payload = fetch_bytes(source["url"])
            found, error = parse_feed(payload, source, cutoff)
            if error:
                feed_errors.append(f"{source['name']}: {error}")
                continue
            for candidate in found:
                if normalise_url(candidate["url"]) not in known_urls:
                    rss_candidates.append(candidate)
        except Exception as error:
            feed_errors.append(f"{source.get('name', 'RSS source')}: {type(error).__name__}; feed unavailable")
    # Deduplicate and rank, retaining the latest date when provided.
    deduped: dict[str, dict] = {}
    for item in rss_candidates:
        key = normalise_url(item["url"])
        old = deduped.get(key)
        if old is None or (item.get("publishedAt") or "") > (old.get("publishedAt") or ""):
            deduped[key] = item
    rss_candidates = sorted(deduped.values(), key=lambda item: (item.get("learningRelevanceScore", 0), item.get("publishedAt") or ""), reverse=True)

    youtube_key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    if youtube_key:
        youtube_candidates, youtube_errors = fetch_youtube_candidates(youtube_key, config.get("youtubeQueries", []), known_urls, cutoff)
    else:
        youtube_candidates, youtube_errors = [], ["YOUTUBE_API_KEY repository secret is not configured; YouTube search was skipped."]

    cap = int(config.get("maxCandidates", 30))
    rss_candidates = rss_candidates[:cap]
    youtube_candidates = sorted(youtube_candidates, key=lambda item: (item.get("publishedAt") or ""), reverse=True)[:cap]
    try:
        health = json.loads(HEALTH_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        health = {"generatedAt": None, "summary": {}, "resources": []}
    report = {
        "schemaVersion": 1,
        "generatedAt": now.isoformat(),
        "reviewWindowDays": int(config.get("reviewWindowDays", 21)),
        "linkHealth": health,
        "candidates": {"rss": rss_candidates, "youtube": youtube_candidates},
        "feedErrors": feed_errors,
        "youtubeErrors": youtube_errors,
        "publicationPolicy": "Candidates are not auto-inserted into resources.js or learningVideos.js; manual approval is needed for learning quality, access terms, and safety.",
    }
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(build_markdown(report), encoding="utf-8")
    print(f"Wrote {REPORT_MD}")
    print(f"Wrote {REPORT_JSON}")
    print(f"New feed candidates: {len(rss_candidates)}; YouTube candidates: {len(youtube_candidates)}; feed errors: {len(feed_errors)}")
    if not youtube_key:
        print("YouTube search skipped: configure YOUTUBE_API_KEY as a repository Actions secret to enable it.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
