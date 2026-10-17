#!/usr/bin/env python3
"""Dependency-free structural and content checks for OpenCyberPath.

Run from the repository root: python scripts/quality_checks.py
The website catalogue in website/src/data/resources.js is the runtime source;
data/resources.json is its checked, machine-readable mirror.
"""
from __future__ import annotations

import csv
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
RESOURCE_FIELDS = (
    "id", "name", "provider", "category", "kind", "level", "description",
    "skills", "url", "account", "note", "image", "icon",
)
JS_STRING = r"'((?:\\.|[^'\\])*)'"


def unescape_js(value: str) -> str:
    """Decode the simple JS escapes used in this static catalogue."""
    return value.replace("\\'", "'").replace('\\\\', '\\').replace('\\n', '\n')


def parse_js_records(path: Path, declaration: str = "resources") -> list[dict[str, Any]]:
    """Parse the deliberately data-only object array exported by a JS module."""
    source = path.read_text(encoding="utf-8")
    prefix = f"export const {declaration} = ["
    if prefix not in source:
        raise ValueError(f"Could not find {prefix!r} in {path}")
    body = source.split(prefix, 1)[1].split("\n];", 1)[0]
    blocks = re.findall(r"\{\s*id:\s*'((?:\\.|[^'\\])*)'(.*?)\n\s*\}", body, re.S)
    if not blocks:
        raise ValueError(f"No {declaration} entries were parsed from {path}")

    records: list[dict[str, Any]] = []
    for raw_id, block in blocks:
        record: dict[str, Any] = {"id": unescape_js(raw_id)}
        field_names = RESOURCE_FIELDS if declaration == "resources" else (
            "id", "title", "level", "kind", "category", "summary", "pdf", "docx",
            "dataset", "script", "worksheet", "image", "estimated", "skill",
        )
        for field in field_names:
            if field == "id":
                continue
            match = re.search(rf"\b{re.escape(field)}:\s*{JS_STRING}", block)
            if match:
                record[field] = unescape_js(match.group(1))
        for list_field in ("skills", "tags"):
            match = re.search(rf"\b{list_field}:\s*\[([^\]]*)\]", block, re.S)
            if match:
                record[list_field] = [unescape_js(item) for item in re.findall(JS_STRING, match.group(1))]
        records.append(record)
    return records


def valid_https_url(value: Any) -> bool:
    return isinstance(value, str) and re.match(r"^https://[^\s/]+(?:/[^\s]*)?$", value) is not None


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def check_csv_shape(path: Path) -> tuple[int, list[str]]:
    """Return data row count and any CSV shape errors."""
    errors: list[str] = []
    try:
        with path.open(encoding="utf-8-sig", newline="") as handle:
            rows = list(csv.reader(handle))
    except (OSError, csv.Error) as exc:
        return 0, [f"cannot read CSV: {exc}"]
    if not rows or not rows[0] or not any(cell.strip() for cell in rows[0]):
        return 0, ["CSV has no non-empty header row"]
    header_width = len(rows[0])
    for row_number, row in enumerate(rows[1:], start=2):
        if not row or not any(cell.strip() for cell in row):
            continue
        if len(row) != header_width:
            errors.append(f"row {row_number} has {len(row)} columns; expected {header_width}")
    return sum(1 for row in rows[1:] if row and any(cell.strip() for cell in row)), errors


def run_quality_checks(root: Path = ROOT) -> tuple[list[str], list[str], dict[str, int]]:
    errors: list[str] = []
    warnings: list[str] = []
    counts = {"resources": 0, "labs": 0, "csv_files": 0, "csv_rows": 0, "document_pairs": 0}

    json_path = root / "data/resources.json"
    js_resources_path = root / "website/src/data/resources.js"
    labs_path = root / "website/src/data/labs.js"
    required = [json_path, js_resources_path, labs_path,
                root / "website/public/labs/detection-evaluation-cases.csv",
                root / "website/public/labs/evaluate-detection-cases.py"]
    for path in required:
        if not path.is_file():
            errors.append(f"required file is missing: {path.relative_to(root)}")
    if errors:
        return errors, warnings, counts

    # Validate the JSON resource mirror against the catalogue used by the UI.
    try:
        catalogue_json = load_json(json_path)
        catalogue_js = parse_js_records(js_resources_path, "resources")
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        errors.append(f"could not load resource catalogue: {exc}")
        return errors, warnings, counts

    if not isinstance(catalogue_json, list):
        errors.append("data/resources.json must contain a JSON array")
        catalogue_json = []
    json_by_id: dict[str, dict[str, Any]] = {}
    for index, item in enumerate(catalogue_json):
        if not isinstance(item, dict):
            errors.append(f"data/resources.json item {index} is not an object")
            continue
        rid = item.get("id")
        if not isinstance(rid, str) or not rid.strip():
            errors.append(f"data/resources.json item {index} has no resource id")
            continue
        if rid in json_by_id:
            errors.append(f"duplicate JSON resource id: {rid}")
        json_by_id[rid] = item
        for field in RESOURCE_FIELDS:
            if field not in item:
                errors.append(f"resource {rid} is missing required field {field}")
        if not valid_https_url(item.get("url")):
            errors.append(f"resource {rid} URL must be an absolute HTTPS URL")
        if not isinstance(item.get("skills"), list) or not item.get("skills"):
            errors.append(f"resource {rid} must have a non-empty skills array")

    js_by_id: dict[str, dict[str, Any]] = {}
    for record in catalogue_js:
        rid = record.get("id")
        if rid in js_by_id:
            errors.append(f"duplicate JS resource id: {rid}")
        js_by_id[rid] = record
        for field in RESOURCE_FIELDS:
            if field not in record:
                errors.append(f"website resource {rid} is missing required field {field}")
        if not valid_https_url(record.get("url")):
            errors.append(f"website resource {rid} URL must be an absolute HTTPS URL")
        image = record.get("image", "")
        if isinstance(image, str) and image.startswith("/"):
            local_image = root / "website/public" / image.lstrip("/")
            if not local_image.is_file():
                errors.append(f"website resource {rid} image is missing: {image}")
        else:
            errors.append(f"website resource {rid} image must be a local /images/... path")

    json_ids, js_ids = set(json_by_id), set(js_by_id)
    if json_ids != js_ids:
        errors.append(
            "resource catalogue IDs differ between data/resources.json and "
            f"website/src/data/resources.js (JSON-only: {sorted(json_ids - js_ids)}; "
            f"website-only: {sorted(js_ids - json_ids)})"
        )
    else:
        # All shared fields must match. JSON is a checked export of the runtime JS catalogue.
        for rid in sorted(json_ids):
            for field in RESOURCE_FIELDS:
                if json_by_id[rid].get(field) != js_by_id[rid].get(field):
                    errors.append(f"resource mirror mismatch for {rid}.{field}; run python scripts/sync_catalogue.py")
    counts["resources"] = len(js_by_id)

    # Validate lab/module metadata and all referenced local files.
    try:
        lab_records = parse_js_records(labs_path, "labs")
    except (OSError, ValueError) as exc:
        errors.append(f"could not parse lab catalogue: {exc}")
        lab_records = []
    seen_lab_ids: set[str] = set()
    for lab in lab_records:
        lab_id = lab.get("id", "<missing-id>")
        if lab_id in seen_lab_ids:
            errors.append(f"duplicate lab id: {lab_id}")
        seen_lab_ids.add(lab_id)
        if not lab.get("title") or not lab.get("summary"):
            errors.append(f"lab {lab_id} must include a title and summary")
        for field in ("pdf", "docx", "dataset", "script", "worksheet"):
            value = lab.get(field)
            if not value:
                continue
            target = root / "website/public" / value
            if not target.is_file():
                errors.append(f"lab {lab_id} references missing {field}: {value}")
            elif field in ("pdf", "docx"):
                # Count each explicitly paired PDF/DOCX pair once below.
                pass
        image = lab.get("image", "")
        if image.startswith("/") and not (root / "website/public" / image.lstrip("/")).is_file():
            errors.append(f"lab {lab_id} references missing image: {image}")
    counts["labs"] = len(lab_records)
    counts["document_pairs"] = sum(1 for lab in lab_records if lab.get("pdf") and lab.get("docx"))

    # CSV validity and required columns.
    labs_dir = root / "website/public/labs"
    for path in sorted(labs_dir.glob("*.csv")):
        count, csv_errors = check_csv_shape(path)
        counts["csv_files"] += 1
        counts["csv_rows"] += count
        for error in csv_errors:
            errors.append(f"{path.relative_to(root)}: {error}")
    expected_headers = {
        "detection-evaluation-cases.csv": {"case_id", "activity_label", "process", "command_line", "rationale"},
        "threat-hunt-auth-dns-samples.csv": {"timestamp_utc", "case_id", "host", "user", "event_type", "source_ip", "result", "label", "training_note"},
        "threat-hunt-dns-samples.csv": {"timestamp_utc", "case_id", "host", "user", "dns_query", "answer_ip", "query_count_10m", "label", "training_note"},
    }
    for filename, expected in expected_headers.items():
        path = labs_dir / filename
        if not path.is_file():
            errors.append(f"expected training CSV is missing: {path.relative_to(root)}")
            continue
        with path.open(encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            headers = set(reader.fieldnames or [])
        missing = expected - headers
        if missing:
            errors.append(f"{path.relative_to(root)} is missing columns: {sorted(missing)}")

    # Parse included JSON sample file.
    windows_sample = labs_dir / "windows-process-creation-samples.json"
    if windows_sample.is_file():
        try:
            sample = load_json(windows_sample)
            if not isinstance(sample, (list, dict)):
                errors.append("windows-process-creation-samples.json must be a JSON array or object")
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"invalid windows-process-creation-samples.json: {exc}")
    else:
        errors.append("expected JSON lab sample is missing: website/public/labs/windows-process-creation-samples.json")

    # Run the included evaluator, checking its documented deterministic teaching output.
    evaluator = labs_dir / "evaluate-detection-cases.py"
    evaluation_csv = labs_dir / "detection-evaluation-cases.csv"
    if evaluator.is_file() and evaluation_csv.is_file():
        result = subprocess.run(
            [sys.executable, str(evaluator), str(evaluation_csv)],
            cwd=root, text=True, capture_output=True, check=False,
        )
        if result.returncode != 0:
            errors.append(f"detection evaluator exited {result.returncode}: {result.stderr.strip() or result.stdout.strip()}")
        else:
            expected_output = [
                "Scored cases: 8; ambiguous excluded: 1",
                "TP=2 FP=1 TN=4 FN=1",
                "Accuracy: 0.750; Precision: 0.667; Recall: 0.667; Specificity: 0.800; F1: 0.667",
                "Synthetic teaching data only; these metrics are not real-world performance estimates.",
            ]
            for expected_line in expected_output:
                if expected_line not in result.stdout:
                    errors.append(f"detection evaluator output changed unexpectedly; missing: {expected_line}")

    return errors, warnings, counts


def main() -> int:
    errors, warnings, counts = run_quality_checks()
    print("OpenCyberPath quality checks")
    print(f"Resources: {counts['resources']} | Labs: {counts['labs']} | PDF/DOCX pairs: {counts['document_pairs']} | CSV files: {counts['csv_files']} ({counts['csv_rows']} rows)")
    for warning in warnings:
        print(f"WARNING: {warning}")
    if errors:
        for error in errors:
            print(f"FAIL: {error}")
        print(f"FAILED: {len(errors)} check(s)")
        return 1
    print("PASS: catalogue parity, required metadata, local assets, documents, CSV/JSON structure, and synthetic evaluator output.")
    print("Scope note: these checks do not verify external URLs or replace browser/accessibility tests.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
