#!/usr/bin/env python3
"""Refresh a small, public index of currently live YouTube cybersecurity classes.

Uses one YouTube Data API search call plus one optional video-details call per run.
Only active broadcasts returned by eventType=live are indexed. Viewer counts and start
metadata are best-effort public fields; absence of either does not invalidate a result.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "website" / "public" / "data" / "youtube-live-classes.json"
API_ROOT = "https://www.googleapis.com/youtube/v3"
USER_AGENT = "OpenCyberPath-LiveClasses/1.0 (public educational live-class index)"

# Boolean OR is supported by YouTube Data API q. One broad query keeps the
# scheduled refresh safely inside the standard search.list call limit.
SEARCH_QUERY = "cybersecurity|cyber security|information security|infosec|SOC analyst|SIEM|threat hunting|incident response|digital forensics|network security|cloud security|security operations|ethical hacking|cybersecurity class|cybersecurity beginner"
REFRESH_MINUTES = 30

TOPIC_SIGNALS = (
    ("Foundations", ("cybersecurity fundamentals", "cyber security basics", "security basics", "beginner cybersecurity", "information security")),
    ("SOC & SIEM", ("soc analyst", "siem", "blue team", "security operations", "splunk", "wazuh", "sentinel")),
    ("Networking", ("network security", "networking", "wireshark", "packet analysis", "dns", "tcp/ip")),
    ("Incident response & forensics", ("incident response", "digital forensics", "dfir", "forensics", "evidence timeline")),
    ("Threat hunting & detection", ("threat hunting", "detection engineering", "threat intelligence", "sigma rule", "yara")),
    ("Web & application security", ("web security", "application security", "appsec", "owasp", "api security")),
    ("Cloud security", ("cloud security", "aws security", "azure security", "cloud iam", "identity security")),
    ("CTF & authorised labs", ("capture the flag", "ctf", "authorised lab", "authorized lab", "training lab")),
    ("GRC & risk", ("governance", "compliance", "iso 27001", "nist", "cyber risk", "security audit")),
)


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def clean_text(value: object, limit: int = 500) -> str:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    text = re.sub(r"(?<![\w.+-])[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "", text)
    text = re.sub(r"(?<!\w)\+?\d[\d ().-]{7,}\d(?!\w)", "", text)
    text = re.sub(r"(?<!\w)@[A-Za-z0-9_]{1,30}\b", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text if len(text) <= limit else text[: limit - 1].rsplit(" ", 1)[0] + "…"


def classify_topic(title: str, description: str = "") -> str:
    haystack = f"{title} {description}".lower()
    for label, terms in TOPIC_SIGNALS:
        if any(term in haystack for term in terms):
            return label
    return "Cybersecurity"


def default_feed() -> dict:
    return {
        "schemaVersion": 1,
        "status": "not-configured",
        "generatedAt": None,
        "refreshIntervalMinutes": REFRESH_MINUTES,
        "source": "YouTube Data API v3",
        "note": "The live index has not been configured yet. Set the repository Actions secret YOUTUBE_API_KEY and enable YouTube Data API v3.",
        "results": [],
    }


def read_feed(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(value, dict) and isinstance(value.get("results"), list):
            return value
    except (OSError, json.JSONDecodeError):
        pass
    return default_feed()


def save_feed(path: Path, payload: dict) -> bool:
    """Persist atomically. Do not change generatedAt when the public result set did not change."""
    old = read_feed(path)
    comparable = ("status", "note", "results", "refreshIntervalMinutes", "source", "schemaVersion")
    unchanged = all(old.get(key) == payload.get(key) for key in comparable)
    if unchanged:
        payload["generatedAt"] = old.get("generatedAt")
    else:
        payload["generatedAt"] = utc_now() if payload.get("status") not in {"not-configured"} else None
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)
    return not unchanged


def get_json(url: str, timeout: int = 22) -> dict:
    request = Request(url, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=timeout) as response:
            raw = response.read(3_000_001)
            if len(raw) > 3_000_000:
                raise RuntimeError("API response exceeded the expected size")
            return json.loads(raw.decode("utf-8", "replace"))
    except HTTPError as exc:
        # Never print the full URL; the API key is a query parameter.
        if exc.code in {401, 403}:
            raise RuntimeError("authentication, API enablement, or quota check failed") from None
        raise RuntimeError(f"YouTube API returned HTTP {exc.code}") from None
    except URLError as exc:
        reason = getattr(exc, "reason", None)
        raise RuntimeError(f"network error ({type(reason).__name__ if reason else 'unavailable'})") from None


def api_get(resource: str, params: dict[str, object], api_key: str) -> dict:
    query = dict(params)
    query["key"] = api_key
    return get_json(f"{API_ROOT}/{resource}?{urlencode(query)}")


def normalise_results(search_payload: dict, details_payload: dict | None = None) -> list[dict]:
    details_by_id: dict[str, dict] = {}
    for detail in (details_payload or {}).get("items", []):
        video_id = clean_text(detail.get("id"), 32)
        if video_id:
            details_by_id[video_id] = detail

    results: list[dict] = []
    seen: set[str] = set()
    for row in search_payload.get("items", []):
        identity = row.get("id") or {}
        video_id = clean_text(identity.get("videoId"), 32)
        snippet = row.get("snippet") or {}
        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id) or video_id in seen:
            continue
        # Search eventType=live and snippet.liveBroadcastContent guard against scheduled
        # and completed streams; the UI still tells learners to verify on YouTube.
        if snippet.get("liveBroadcastContent") != "live":
            continue
        detail = details_by_id.get(video_id) or {}
        detail_snippet = detail.get("snippet") or {}
        live_details = detail.get("liveStreamingDetails") or {}
        detail_status = detail_snippet.get("liveBroadcastContent")
        if detail_status and detail_status != "live":
            continue
        title = clean_text(snippet.get("title"), 240)
        if not title:
            continue
        description = clean_text(snippet.get("description"), 460)
        thumbnails = snippet.get("thumbnails") or {}
        thumbnail = next((thumbnails.get(name, {}).get("url") for name in ("maxres", "high", "medium", "default") if thumbnails.get(name, {}).get("url")), "")
        viewers = live_details.get("concurrentViewers")
        try:
            viewers = int(viewers) if viewers is not None else None
            if viewers is not None and viewers < 0:
                viewers = None
        except (ValueError, TypeError):
            viewers = None
        channel_id = clean_text(snippet.get("channelId"), 64)
        record = {
            "videoId": video_id,
            "title": title,
            "description": description,
            "channelTitle": clean_text(snippet.get("channelTitle"), 160),
            "channelId": channel_id,
            "thumbnailUrl": thumbnail,
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "publishedAt": snippet.get("publishedAt") or None,
            "liveStartedAt": live_details.get("actualStartTime") or None,
            "concurrentViewers": viewers,
            "snapshotTopic": classify_topic(title, description),
            "broadcastStatus": "live",
        }
        if record["thumbnailUrl"] and not record["thumbnailUrl"].startswith("https://i.ytimg.com/"):
            record["thumbnailUrl"] = ""
        results.append(record)
        seen.add(video_id)
    return sorted(results, key=lambda item: (int(item.get("concurrentViewers") or 0), item.get("liveStartedAt") or ""), reverse=True)


def _api_search_params() -> dict[str, object]:
    return {
        "part": "snippet",
        "type": "video",
        "eventType": "live",
        "maxResults": 50,
        "q": SEARCH_QUERY,
        "regionCode": "IN",
        "relevanceLanguage": "en",
        "safeSearch": "moderate",
        "order": "relevance",
    }


def refresh(api_key: str, path: Path = OUTPUT) -> dict:
    api_key = (api_key or "").strip()
    old = read_feed(path)
    if not api_key:
        if old.get("results"):
            payload = {
                **old,
                "status": "stale",
                "note": "YOUTUBE_API_KEY is unavailable, so the last saved snapshot is shown. Verify each stream on YouTube.",
                "refreshIntervalMinutes": REFRESH_MINUTES,
                "source": "YouTube Data API v3",
                "schemaVersion": 1,
            }
        else:
            payload = default_feed()
        save_feed(path, payload)
        return payload

    try:
        search_payload = api_get("search", _api_search_params(), api_key)
        search_rows = search_payload.get("items", []) if isinstance(search_payload, dict) else []
        ids = [
            row.get("id", {}).get("videoId") for row in search_rows
            if row.get("snippet", {}).get("liveBroadcastContent") == "live"
            and re.fullmatch(r"[A-Za-z0-9_-]{11}", str(row.get("id", {}).get("videoId", "")))
        ]
        details_payload = {"items": []}
        if ids:
            try:
                details_payload = api_get("videos", {"part": "snippet,liveStreamingDetails", "id": ",".join(dict.fromkeys(ids[:50]))}, api_key)
            except RuntimeError:
                # Search itself is constrained to active streams; details only enriches cards.
                details_payload = {"items": []}
        results = normalise_results(search_payload, details_payload)
        payload = {
            "schemaVersion": 1,
            "status": "ok" if results else "empty",
            "generatedAt": None,
            "refreshIntervalMinutes": REFRESH_MINUTES,
            "source": "YouTube Data API v3",
            "note": "Only active broadcasts from YouTube's live-search filter are indexed. A stream can end before the next scheduled refresh; verify availability on YouTube.",
            "results": results,
        }
    except (RuntimeError, ValueError, TypeError, json.JSONDecodeError) as exc:
        safe_reason = str(exc)[:150]
        if old.get("results"):
            payload = {
                **old,
                "status": "stale",
                "note": f"The last scheduled live search failed ({safe_reason}). Showing the previous snapshot; verify on YouTube.",
                "refreshIntervalMinutes": REFRESH_MINUTES,
                "source": "YouTube Data API v3",
                "schemaVersion": 1,
            }
        else:
            payload = {
                "schemaVersion": 1,
                "status": "error",
                "generatedAt": None,
                "refreshIntervalMinutes": REFRESH_MINUTES,
                "source": "YouTube Data API v3",
                "note": f"The live search could not be refreshed ({safe_reason}). Check the Actions secret, API enablement, and quota.",
                "results": [],
            }
    save_feed(path, payload)
    return read_feed(path)


def self_test() -> None:
    params = _api_search_params()
    assert params["eventType"] == "live" and params["type"] == "video"
    assert params["maxResults"] == 50 and params["regionCode"] == "IN"
    assert "%7C" in urlencode({"q": SEARCH_QUERY})
    live_row = {
        "id": {"kind": "youtube#video", "videoId": "abcdefghijk"},
        "snippet": {
            "title": "Beginner SOC analyst SIEM class LIVE",
            "description": "Fundamentals of log analysis for beginners",
            "channelTitle": "Example Security Learning",
            "channelId": "UCexample",
            "publishedAt": "2026-10-22T00:00:00Z",
            "liveBroadcastContent": "live",
            "thumbnails": {"high": {"url": "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg"}},
        },
    }
    completed_row = {**live_row, "id": {"kind": "youtube#video", "videoId": "lmnopqrstuv"}, "snippet": {**live_row["snippet"], "liveBroadcastContent": "none"}}
    results = normalise_results({"items": [live_row, completed_row]})
    assert len(results) == 1 and results[0]["videoId"] == "abcdefghijk"
    assert results[0]["snapshotTopic"] == "SOC & SIEM"
    assert results[0]["broadcastStatus"] == "live"
    print("YouTube live-class self-test passed.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true", help="Run offline checks without network access")
    parser.add_argument("--output", type=Path, default=OUTPUT, help="Output JSON feed path")
    parser.add_argument("--refresh", action="store_true", help="Refresh using YOUTUBE_API_KEY from environment")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        if not args.refresh:
            return 0
    payload = refresh(os.environ.get("YOUTUBE_API_KEY", ""), args.output)
    print(f"Live-class feed status: {payload.get('status')}; active entries: {len(payload.get('results', []))}")
    print(f"Snapshot path: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
