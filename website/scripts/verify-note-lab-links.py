#!/usr/bin/env python3
"""Check that every practice link shown on a lab card is also present in its DOCX notes.
Run from website/: python scripts/verify-note-lab-links.py
Uses Python's standard library only.
"""
from __future__ import annotations

import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path.cwd()
LABS_SOURCE = ROOT / "src" / "data" / "labs.js"
LINKS_SOURCE = ROOT / "src" / "components" / "ExternalLabLinks.jsx"
PUBLIC_ROOT = ROOT / "public"
NS = {"rel": "http://schemas.openxmlformats.org/package/2006/relationships"}

errors: list[str] = []

for path in (LABS_SOURCE, LINKS_SOURCE):
    if not path.is_file():
        print(f"ERROR: missing required source file: {path}")
        sys.exit(1)

labs_text = LABS_SOURCE.read_text(encoding="utf-8")
component_text = LINKS_SOURCE.read_text(encoding="utf-8")

lab_to_docx: dict[str, Path] = {}
# labs.js has one top-level object per lab, closed at a line containing two spaces + },
for block in re.split(r"(?m)^  \},\s*$", labs_text):
    id_match = re.search(r"\bid:\s*'([^']+)'", block)
    docx_match = re.search(r"\bdocx:\s*'notes/([^']+)'", block)
    if id_match and docx_match:
        lab_to_docx[id_match.group(1)] = Path("notes") / docx_match.group(1)

markers = list(re.finditer(r"(?m)^\s{2}'([^']+)':\s*\{", component_text))
card_links: dict[str, list[str]] = {}
for index, marker in enumerate(markers):
    end = markers[index + 1].start() if index + 1 < len(markers) else component_text.index("\n};", marker.start())
    block = component_text[marker.start():end]
    card_links[marker.group(1)] = re.findall(r"url:\s*'(https://[^']+)'", block)

for lab_id in sorted(set(lab_to_docx) - set(card_links)):
    errors.append(f"Visible lab card '{lab_id}' has no external-link group")
for lab_id in sorted(set(card_links) - set(lab_to_docx)):
    errors.append(f"External-link group '{lab_id}' does not match a visible lab card")

checked = 0
for lab_id, urls in card_links.items():
    docx_relative = lab_to_docx.get(lab_id)
    if not docx_relative:
        continue
    docx_path = PUBLIC_ROOT / docx_relative
    if not docx_path.is_file():
        errors.append(f"'{lab_id}' has no companion DOCX: {docx_relative.as_posix()}")
        continue
    try:
        with zipfile.ZipFile(docx_path) as archive:
            rels = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
            docx_urls = {
                element.attrib.get("Target", "")
                for element in rels
                if element.attrib.get("TargetMode") == "External"
            }
    except (OSError, zipfile.BadZipFile, KeyError, ET.ParseError) as exc:
        errors.append(f"Cannot read hyperlink relationships in '{docx_relative}': {exc}")
        continue
    for url in urls:
        checked += 1
        if url not in docx_urls:
            errors.append(f"Card '{lab_id}' links to a URL absent from its DOCX notes: {url}")

print("OpenCyberPath note/link consistency check")
print("=========================================")
print(f"Lab cards with DOCX notes: {len(lab_to_docx)}")
print(f"Card groups checked: {len(card_links)}")
print(f"External practice links cross-checked: {checked}")
if errors:
    print(f"FAILED: {len(errors)} issue(s)")
    for error in errors:
        print(f"  ERROR {error}")
    sys.exit(1)
print("PASSED: every external practice URL on a lab card is present in that card's companion DOCX notes.")
