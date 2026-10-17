#!/usr/bin/env python3
"""Regenerate data/resources.json from the runtime website catalogue."""
import json
from pathlib import Path
from quality_checks import ROOT, parse_js_records

source = ROOT / "website/src/data/resources.js"
target = ROOT / "data/resources.json"
records = parse_js_records(source, "resources")
missing = []
required = ("id", "name", "provider", "category", "kind", "level", "description", "skills", "url", "account", "note", "image", "icon")
for record in records:
    for field in required:
        if field not in record:
            missing.append(f"{record.get('id', '<unknown>')}.{field}")
if missing:
    raise SystemExit("Cannot export catalogue; missing fields: " + ", ".join(missing))
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Synced {len(records)} resources from website/src/data/resources.js to data/resources.json")
