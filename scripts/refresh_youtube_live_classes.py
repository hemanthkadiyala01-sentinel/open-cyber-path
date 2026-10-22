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
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "website" / "public" / "data" / "youtube-live-classes.json"
API_ROOT = "https://www.googleapis.com/youtube/v3"
USER_AGENT = "OpenCyberPath-LiveClasses/1.0 (public educational live-class index)"

# Search globally. Each scheduled run rotates one query across three languages so the
# default search.list quota remains below its 100-call/day bucket (48 scheduled runs/day).
# relevanceLanguage is a ranking hint, not proof of the spoken language in a broadcast.
LANGUAGE_PROFILES = (
    {
        "id": "en",
        "label": "English",
        "relevanceLanguage": "en",
        "query": "cybersecurity|cyber security|ethical hacking|penetration testing|bug bounty|CTF|capture the flag|infosec|information security|network security|web security|OWASP|cloud security|SOC analyst|SIEM|blue team|red team|purple team|threat hunting|incident response|digital forensics|malware analysis|threat intelligence|secure coding|DevSecOps|cryptography|privacy security|AI security|IoT security|security awareness|Linux security|Windows security|security research|cybersecurity webinar",
    },
    {
        "id": "hi",
        "label": "Hindi",
        "relevanceLanguage": "hi",
        "query": "साइबर सुरक्षा|साइबर सिक्योरिटी|एथिकल हैकिंग|बग बाउंटी|सीटीएफ|नेटवर्क सुरक्षा|वेब सुरक्षा|क्लाउड सुरक्षा|साइबर फॉरेंसिक्स|मैलवेयर विश्लेषण|हिंदी साइबर सुरक्षा|हिन्दी साइबर सुरक्षा|साइबर सुरक्षा लाइव|हैकिंग से बचाव|cybersecurity Hindi|ethical hacking Hindi|penetration testing Hindi|bug bounty Hindi|SOC analyst Hindi|network security Hindi|cybersecurity webinar Hindi",
    },
    {
        "id": "te",
        "label": "Telugu",
        "relevanceLanguage": "te",
        "query": "సైబర్ సెక్యూరిటీ|సైబర్ భద్రత|ఎథికల్ హ్యాకింగ్|బగ్ బౌంటీ|సీటీఎఫ్|నెట్‌వర్క్ భద్రత|వెబ్ భద్రత|క్లౌడ్ భద్రత|సైబర్ ఫోరెన్సిక్స్|మాల్వేర్ విశ్లేషణ|తెలుగు సైబర్ సెక్యూరిటీ|సైబర్ సెక్యూరిటీ లైవ్|హ్యాకింగ్ భద్రత|cybersecurity Telugu|ethical hacking Telugu|penetration testing Telugu|bug bounty Telugu|SOC analyst Telugu|network security Telugu|cybersecurity webinar Telugu",
    },
)
REFRESH_MINUTES = 30
RESULT_RETENTION_MINUTES = 90
# OCP-CYBER-LIVE-TOPICS-EXPANSION-V1


TOPIC_SIGNALS = (
    ("Foundations & awareness", ("cybersecurity basics", "cyber security basics", "security awareness", "cybersecurity fundamentals", "information security fundamentals", "beginner cybersecurity")),
    ("Ethical hacking & authorised testing", ("ethical hacking", "authorized testing", "authorised testing", "penetration testing", "pentest", "red team", "purple team")),
    ("Bug bounty & responsible disclosure", ("bug bounty", "responsible disclosure", "vulnerability disclosure", "bugcrowd", "hackerone")),
    ("CTF & training labs", ("capture the flag", "ctf", "tryhackme", "hack the box", "training lab", "authorized lab", "authorised lab")),
    ("Web & application security", ("web security", "application security", "appsec", "owasp", "secure web application")),
    ("API security", ("api security", "api testing", "oauth security", "web api")),
    ("SOC & SIEM", ("soc analyst", "siem", "blue team", "security operations", "splunk", "wazuh", "sentinel", "log analysis")),
    ("Threat hunting & detection", ("threat hunting", "detection engineering", "sigma rule", "yara rule", "threat detection", "endpoint detection")),
    ("Incident response & forensics", ("incident response", "digital forensics", "dfir", "forensics", "evidence timeline", "incident handling")),
    ("Malware analysis & reverse engineering", ("malware analysis", "malware research", "reverse engineering", "static analysis", "dynamic analysis")),
    ("Threat intelligence & security research", ("threat intelligence", "osint", "security research", "ioc analysis", "threat report")),
    ("Networking & protocols", ("network security", "networking fundamentals", "wireshark", "packet analysis", "dns", "tcp/ip", "pcap")),
    ("Cloud, identity & containers", ("cloud security", "aws security", "azure security", "gcp security", "iam", "identity security", "container security", "kubernetes security")),
    ("Secure coding & DevSecOps", ("secure coding", "devsecops", "sast", "dast", "software supply chain", "dependency security")),
    ("Cryptography & privacy", ("cryptography", "encryption", "privacy engineering", "data privacy", "key management")),
    ("AI & machine-learning security", ("ai security", "llm security", "prompt injection defense", "machine learning security", "model security")),
    ("Mobile, IoT & OT security", ("mobile security", "android security", "ios security", "iot security", "ot security", "industrial control security")),
    ("GRC, risk & compliance", ("governance", "risk management", "compliance", "iso 27001", "nist", "security audit", "grc")),
    ("Linux, Windows & system hardening", ("linux security", "windows security", "system hardening", "endpoint hardening", "server hardening")),
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



# OCP-STRICT-RESOURCE-RELEVANCE-GATE-V1
# Accept only streams whose TITLE explicitly identifies a cybersecurity topic
# and whose title/description indicates instruction. This deliberately favours
# relevance over volume; generic live streams are not learner recommendations.
STRICT_CYBER_TITLE_TERMS = (
    "cybersecurity", "cyber security", "information security", "infosec",
    "security basics", "security fundamentals", "security awareness training",
    "ethical hacking", "penetration testing", "pen testing", "pentest",
    "bug bounty", "responsible disclosure", "vulnerability disclosure",
    "capture the flag", "cybersecurity ctf", "cyber security ctf", "ctf training",
    "soc analyst", "siem", "blue team", "red team", "security operations",
    "threat hunting", "threat intelligence", "incident response", "digital forensics",
    "computer forensics", "dfir", "malware analysis", "reverse engineering malware",
    "network security", "wireshark", "packet analysis", "web security",
    "application security", "appsec", "owasp", "api security",
    "cloud security", "aws security", "azure security", "gcp security",
    "identity and access management", "iam security", "cloud iam",
    "container security", "kubernetes security", "cspm", "devsecops",
    "secure coding", "software supply chain security", "cryptography", "encryption",
    "key management", "iso 27001", "nist security", "cybersecurity governance",
    "cyber risk", "security audit", "vulnerability management", "osint",
    "linux hardening", "windows hardening", "powershell security",
    "python for cybersecurity", "android security", "mobile security", "iot security",
    "operational technology security", "industrial control system security",
)
LEARNING_SIGNAL_RE = re.compile(
    r"\b(class|course|tutorial|training|workshop|webinar|lab|walkthrough|lesson|"
    r"lecture|bootcamp|explained|fundamentals|basics|beginners?|guide|demo|"
    r"demonstration|hands[ -]?on|learning|teaching|teach|session|academy|"
    r"masterclass|deep dive|crash course|how to|step[ -]by[ -]step|practical|seminar)\b",
    re.IGNORECASE,
)


def _contains_topic_phrase(text: str, phrase: str) -> bool:
    # Whole-word / whole-phrase matching avoids false hits such as "soc" in "soccer".
    pattern = r"(?<![a-z0-9])" + re.escape(phrase).replace(" ", r"\s+") + r"(?![a-z0-9])"
    return re.search(pattern, text, re.IGNORECASE) is not None


def is_relevant_learning_class(title: str, description: str = "") -> bool:
    safe_title = str(title or "").strip().lower()
    safe_details = f"{safe_title} {str(description or '')}".lower()
    title_has_topic = any(_contains_topic_phrase(safe_title, term) for term in STRICT_CYBER_TITLE_TERMS)
    has_instruction_signal = LEARNING_SIGNAL_RE.search(safe_details) is not None
    return bool(title_has_topic and has_instruction_signal)

def default_feed() -> dict:
    return {
        "schemaVersion": 2,
        "status": "not-configured",
        "generatedAt": None,
        "refreshIntervalMinutes": REFRESH_MINUTES,
        "source": "YouTube Data API v3",
        "searchScope": "worldwide",
        "supportedSearchLanguages": ["en", "hi", "te"],
        "note": "Global live discovery rotates English, Hindi, and Telugu search profiles. Set the repository Actions secret YOUTUBE_API_KEY and enable YouTube Data API v3. Search-language tags are hints, not verified spoken-language labels.",
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


def normalise_results(search_payload: dict, details_payload: dict | None = None, discovery_language: str = "en", observed_at: str | None = None) -> list[dict]:
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
        if not is_relevant_learning_class(title, description):
            continue
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
            "discoveryLanguages": [discovery_language] if discovery_language in {"en", "hi", "te"} else ["en"],
            "lastSeenAt": observed_at or utc_now(),
        }
        if record["thumbnailUrl"] and not record["thumbnailUrl"].startswith("https://i.ytimg.com/"):
            record["thumbnailUrl"] = ""
        results.append(record)
        seen.add(video_id)
    return sorted(results, key=lambda item: (int(item.get("concurrentViewers") or 0), item.get("liveStartedAt") or ""), reverse=True)


def active_search_profile(now: datetime | None = None) -> dict[str, str]:
    """Return a stable, half-hourly rotating profile for English, Hindi, or Telugu."""
    moment = now or datetime.now(timezone.utc)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    slot = int(moment.timestamp() // (REFRESH_MINUTES * 60))
    return LANGUAGE_PROFILES[slot % len(LANGUAGE_PROFILES)]


def _api_search_params(profile: dict[str, str] | None = None) -> dict[str, object]:
    selected = profile or active_search_profile()
    return {
        "part": "snippet",
        "type": "video",
        "eventType": "live",
        "maxResults": 50,
        "q": selected["query"],
        # Deliberately omit regionCode: this is worldwide discovery, not an India-only feed.
        "relevanceLanguage": selected["relevanceLanguage"],
        "safeSearch": "moderate",
        "order": "relevance",
    }


def _parse_iso(value: object) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except (TypeError, ValueError):
        return None


def merge_recent_live_results(previous: list[dict], fresh: list[dict], prior_snapshot_at: str | None = None, now: datetime | None = None) -> list[dict]:
    """Keep the three language sweeps together, deduplicate videos, and age out old matches."""
    moment = now or datetime.now(timezone.utc)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    moment = moment.astimezone(timezone.utc)
    cutoff = moment - timedelta(minutes=RESULT_RETENTION_MINUTES)
    merged: dict[str, dict] = {}
    fallback_seen = _parse_iso(prior_snapshot_at)
    for raw in previous:
        if not isinstance(raw, dict):
            continue
        video_id = str(raw.get("videoId") or "")
        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
            continue
        last_seen = _parse_iso(raw.get("lastSeenAt")) or fallback_seen
        if not last_seen or last_seen < cutoff:
            continue
        row = dict(raw)
        row["lastSeenAt"] = last_seen.replace(microsecond=0).isoformat().replace("+00:00", "Z")
        raw_languages = row.get("discoveryLanguages")
        if not isinstance(raw_languages, list):
            legacy_language = row.get("discoveryLanguage", "en")
            raw_languages = [legacy_language if legacy_language in {"en", "hi", "te"} else "en"]
        row["discoveryLanguages"] = list(dict.fromkeys(code for code in raw_languages if code in {"en", "hi", "te"})) or ["en"]
        merged[video_id] = row
    for raw in fresh:
        video_id = str(raw.get("videoId") or "")
        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
            continue
        prior = merged.get(video_id, {})
        languages = list(dict.fromkeys(
            [code for code in (prior.get("discoveryLanguages") or []) if code in {"en", "hi", "te"}]
            + [code for code in (raw.get("discoveryLanguages") or []) if code in {"en", "hi", "te"}]
        )) or ["en"]
        row = {**prior, **raw, "discoveryLanguages": languages}
        row["lastSeenAt"] = moment.replace(microsecond=0).isoformat().replace("+00:00", "Z")
        merged[video_id] = row
    return sorted(merged.values(), key=lambda item: (int(item.get("concurrentViewers") or 0), item.get("liveStartedAt") or ""), reverse=True)


def verify_existing_live_results(previous: list[dict], api_key: str) -> list[dict]:
    """Retain a cached card only if YouTube still reports its broadcast as live.

    The rotating language searches run every 30 minutes, but a video can end before
    its next language sweep. Verify cached IDs using videos.list (low-cost) so old
    broadcasts are not incorrectly shown with a LIVE NOW badge.
    """
    video_ids = list(dict.fromkeys(
        str(row.get("videoId") or "") for row in previous
        if isinstance(row, dict) and re.fullmatch(r"[A-Za-z0-9_-]{11}", str(row.get("videoId") or ""))
    ))
    if not video_ids:
        return []
    active_ids: set[str] = set()
    for offset in range(0, len(video_ids), 50):
        batch = video_ids[offset:offset + 50]
        payload = api_get("videos", {"part": "snippet,liveStreamingDetails", "id": ",".join(batch)}, api_key)
        for item in payload.get("items", []):
            video_id = str(item.get("id") or "")
            snippet = item.get("snippet") or {}
            streaming = item.get("liveStreamingDetails") or {}
            if snippet.get("liveBroadcastContent") == "live" and not streaming.get("actualEndTime"):
                active_ids.add(video_id)
    return [dict(row) for row in previous if str(row.get("videoId") or "") in active_ids]


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
                "searchScope": "worldwide",
                "supportedSearchLanguages": ["en", "hi", "te"],
                "schemaVersion": 2,
            }
        else:
            payload = default_feed()
        save_feed(path, payload)
        return payload

    try:
        profile = active_search_profile()
        print(f"Worldwide query profile: {profile['label']} ({profile['id']})")
        observed_at = utc_now()
        search_payload = api_get("search", _api_search_params(profile), api_key)
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
        fresh_results = normalise_results(search_payload, details_payload, discovery_language=profile["id"], observed_at=observed_at)
        verified_previous = verify_existing_live_results(old.get("results", []), api_key)
        results = merge_recent_live_results(verified_previous, fresh_results, old.get("generatedAt"), now=_parse_iso(observed_at))
        payload = {
            "schemaVersion": 2,
            "status": "ok" if results else "empty",
            "generatedAt": None,
            "refreshIntervalMinutes": REFRESH_MINUTES,
            "source": "YouTube Data API v3",
            "searchScope": "worldwide",
            "supportedSearchLanguages": ["en", "hi", "te"],
            "note": "Worldwide discovery rotates English, Hindi, and Telugu searches. Results were returned as active broadcasts at last observation and retained for up to 90 minutes to combine the rotating language sweeps. A stream can end before the next scan; verify availability and captions on YouTube.",
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
                "searchScope": "worldwide",
                "supportedSearchLanguages": ["en", "hi", "te"],
                "schemaVersion": 2,
            }
        else:
            payload = {
                "schemaVersion": 2,
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
    profile = active_search_profile(datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc))
    params = _api_search_params(profile)
    assert params["eventType"] == "live" and params["type"] == "video"
    assert params["maxResults"] == 50 and "regionCode" not in params
    assert params["relevanceLanguage"] == profile["relevanceLanguage"]
    assert len(LANGUAGE_PROFILES) == 3 and {item["id"] for item in LANGUAGE_PROFILES} == {"en", "hi", "te"}
    assert "penetration testing" in LANGUAGE_PROFILES[0]["query"] and "سایبر सुरक्षा" not in LANGUAGE_PROFILES[0]["query"]
    assert "हिंदी" in LANGUAGE_PROFILES[1]["query"] and "తెలుగు" in LANGUAGE_PROFILES[2]["query"]
    assert "%7C" in urlencode({"q": profile["query"]})
    first = active_search_profile(datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc))
    second = active_search_profile(datetime(2026, 1, 1, 0, 30, tzinfo=timezone.utc))
    third = active_search_profile(datetime(2026, 1, 1, 1, 0, tzinfo=timezone.utc))
    assert [first["id"], second["id"], third["id"]] == ["en", "hi", "te"]
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
    results = normalise_results({"items": [live_row, completed_row]}, discovery_language="hi", observed_at="2026-10-22T00:00:00Z")
    assert len(results) == 1 and results[0]["videoId"] == "abcdefghijk"
    assert results[0]["snapshotTopic"] == "SOC & SIEM"
    assert results[0]["broadcastStatus"] == "live"
    assert results[0]["discoveryLanguages"] == ["hi"]
    assert results[0]["lastSeenAt"] == "2026-10-22T00:00:00Z"
    old = [{**results[0], "lastSeenAt": "2026-10-22T00:00:00Z"}]
    fresh_en = [{**results[0], "discoveryLanguages": ["en"], "lastSeenAt": "2026-10-22T00:30:00Z"}]
    merged = merge_recent_live_results(old, fresh_en, now=datetime(2026, 10, 22, 0, 30, tzinfo=timezone.utc))
    assert len(merged) == 1 and set(merged[0]["discoveryLanguages"]) == {"en", "hi"}
    assert merge_recent_live_results(old, [], now=datetime(2026, 10, 22, 2, 0, tzinfo=timezone.utc)) == []
    print("YouTube global multilingual live-class self-test passed.")


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
    print(f"Live-class feed status: {payload.get('status')}; recently matched streams: {len(payload.get('results', []))}")
    print(f"Snapshot path: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
