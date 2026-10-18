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
import zipfile
import xml.etree.ElementTree as ET
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
        practice_match = re.search(rf"\bpracticeUrl:\s*{JS_STRING}", block)
        if practice_match:
            record["practiceUrl"] = unescape_js(practice_match.group(1))
        monogram_match = re.search(rf"\bmonogram:\s*{JS_STRING}", block)
        if monogram_match:
            record["monogram"] = unescape_js(monogram_match.group(1))
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


def check_career_paths(root: Path, resource_ids: set[str], lab_ids: set[str]) -> tuple[list[str], int]:
    """Validate the ten canonical career visions and their references to catalogue items."""
    errors: list[str] = []
    path_file = root / "website/src/data/careerPaths.js"
    if not path_file.is_file():
        return ["required file is missing: website/src/data/careerPaths.js"], 0
    source = path_file.read_text(encoding="utf-8")
    starts = list(re.finditer(r"^  \{\n    id: '([^']+)'", source, re.M))
    ids = [m.group(1) for m in starts]
    expected = {
        "soc-blue-team",
        "threat-hunting-detection-engineering",
        "digital-forensics-incident-response",
        "application-security-bug-bounty",
        "cloud-security",
        "grc-security-fundamentals",
        "penetration-testing-red-team",
        "security-engineering-devsecops-iam",
        "threat-intelligence-ethical-osint",
        "malware-analysis-reverse-engineering",
    }
    if len(ids) != 10:
        errors.append(f"careerPaths.js must define exactly 10 career visions; found {len(ids)}")
    if len(ids) != len(set(ids)):
        errors.append("career path IDs must be unique")
    if set(ids) != expected:
        errors.append(f"career path IDs differ from the canonical ten: {sorted(set(ids))}")

    path_images: list[str] = []
    for block_start, match in enumerate(starts):
        end = starts[block_start + 1].start() if block_start + 1 < len(starts) else source.find("\n];", match.start())
        if end < 0:
            end = len(source)
        block = source[match.start():end]
        image_match = re.search(r"\bimage:\s*'([^']+)'", block)
        if image_match:
            path_images.append(image_match.group(1))
    if len(path_images) != 10 or len(set(path_images)) != 10:
        errors.append("each of the ten career visions must have unique concept-specific artwork")

    roadmap_files = {
        "soc-blue-team": "soc-blue-team.md",
        "threat-hunting-detection-engineering": "threat-hunting-detection-engineering.md",
        "digital-forensics-incident-response": "digital-forensics-incident-response.md",
        "application-security-bug-bounty": "application-security-bug-bounty.md",
        "cloud-security": "cloud-security.md",
        "grc-security-fundamentals": "grc-security-fundamentals.md",
        "penetration-testing-red-team": "penetration-testing-red-team.md",
        "security-engineering-devsecops-iam": "security-engineering-devsecops-iam.md",
        "threat-intelligence-ethical-osint": "threat-intelligence-ethical-osint.md",
        "malware-analysis-reverse-engineering": "malware-analysis-reverse-engineering.md",
    }
    for index, match in enumerate(starts):
        path_id = match.group(1)
        end = starts[index + 1].start() if index + 1 < len(starts) else source.find("\n];", match.start())
        if end < 0:
            end = len(source)
        block = source[match.start():end]
        for field in ("prerequisites", "modules", "resourceIds", "labIds", "capstoneTitle", "capstone", "deliverables"):
            if re.search(rf"\b{field}\s*:", block) is None:
                errors.append(f"career path {path_id} is missing {field}")
        module_count = len(re.findall(r"\{\s*title:", block))
        if module_count < 4:
            errors.append(f"career path {path_id} needs at least 4 learning modules; found {module_count}")
        image_match = re.search(r"\bimage:\s*'([^']+)'", block)
        if not image_match or not image_match.group(1).startswith("/") or not (root / "website/public" / image_match.group(1).lstrip("/")).is_file():
            errors.append(f"career path {path_id} references a missing local image")
        for field, known in (("resourceIds", resource_ids), ("labIds", lab_ids)):
            array_match = re.search(rf"\b{field}:\s*\[([^\]]*)\]", block, re.S)
            references = re.findall(JS_STRING, array_match.group(1)) if array_match else []
            if not references:
                errors.append(f"career path {path_id} must reference at least one {field}")
            for reference in references:
                if reference not in known:
                    errors.append(f"career path {path_id} references unknown {field} item: {reference}")
        next_match = re.search(r"\bnextPathIds:\s*\[([^\]]*)\]", block, re.S)
        next_ids = re.findall(JS_STRING, next_match.group(1)) if next_match else []
        for next_id in next_ids:
            if next_id not in set(ids):
                errors.append(f"career path {path_id} references unknown next path: {next_id}")
        roadmap = root / "roadmaps" / roadmap_files.get(path_id, "")
        if path_id in roadmap_files and not roadmap.is_file():
            errors.append(f"career path {path_id} is missing its canonical roadmap: {roadmap.relative_to(root)}")
    return errors, len(ids)


def check_career_toolkit(root: Path) -> tuple[list[str], dict[str, int]]:
    """Check the career-to-application toolkit's expected UI and data scaffolding."""
    errors: list[str] = []
    counts = {"career_directions": 0, "hacker_hat_terms": 0, "beginner_stages": 0, "job_sources": 0, "employer_portals": 0, "handwritten_note_pairs": 0, "cybersecurity_pillars": 0, "domain_specializations": 0, "isc2_cissp_domains": 0}
    component_path = root / "website/src/components/CareerExperience.jsx"
    data_path = root / "website/src/components/careerHubData.js"
    css_path = root / "website/src/components/career-experience.css"
    for required_path in (component_path, data_path, css_path):
        if not required_path.is_file():
            errors.append(f"required career toolkit file is missing: {required_path.relative_to(root)}")
    if any(not item.is_file() for item in (component_path, data_path, css_path)):
        return errors, counts

    component = component_path.read_text(encoding="utf-8")
    data = data_path.read_text(encoding="utf-8")
    for marker in (
        "export function CareerHub", "export function ResumeStudio", "export function JobsHub",
        "export function ApplicationLab", "buildResumeText", "buildResumeHtml", "ats-review-panel",
        "fictional practice vacancy", "application-tracker",
    ):
        if marker.lower() not in component.lower():
            errors.append(f"career toolkit component is missing expected feature marker: {marker}")

    expected_directions = {"soc-blue-team", "threat-hunting", "dfir", "appsec", "cloud", "grc", "pentest-red-team", "security-engineering", "threat-intel-osint", "malware-analysis"}
    direction_block = data.split("export const careerDirections = [", 1)[-1].split("export const hackerHats = [", 1)[0]
    direction_ids = set(re.findall(r"\bid:\s*'([^']+)'", direction_block))
    counts["career_directions"] = len(direction_ids)
    if direction_ids != expected_directions:
        errors.append(f"career toolkit directions differ from the canonical ten: {sorted(direction_ids)}")

    expected_hats = {"white", "black", "grey", "green", "blue", "red"}
    hats_block = data.split("export const hackerHats = [", 1)[-1].split("export const beginnerStages = [", 1)[0]
    hat_ids = set(re.findall(r"\bid:\s*'([^']+)'", hats_block))
    counts["hacker_hat_terms"] = len(hat_ids)
    if hat_ids != expected_hats:
        errors.append(f"hacker hat explainer must cover exactly the six requested labels: {sorted(hat_ids)}")

    stages_block = data.split("export const beginnerStages = [", 1)[-1].split("export const jobBoards = [", 1)[0]
    stage_ids = set(re.findall(r"\bid:\s*'([^']+)'", stages_block))
    counts["beginner_stages"] = len(stage_ids)
    if len(stage_ids) != 6:
        errors.append(f"beginner journey must define six stages; found {len(stage_ids)}")

    boards_block = data.split("export const jobBoards = [", 1)[-1].split("export const roleSearchPresets = [", 1)[0]
    board_ids = set(re.findall(r"\bid:\s*'([^']+)'", boards_block))
    counts["job_sources"] = len(board_ids)
    if len(board_ids) < 5:
        errors.append(f"job hub needs at least five search sources; found {len(board_ids)}")
    if "https://www.ncs.gov.in/" not in boards_block:
        errors.append("job hub must include the official National Career Service portal")

    employer_block = data.split("export const employerCareerPages = [", 1)[-1]
    employer_ids = set(re.findall(r"\bid:\s*'([^']+)'", employer_block))
    counts["employer_portals"] = len(employer_ids)
    if len(employer_ids) < 3:
        errors.append(f"job hub needs at least three official employer-career portals; found {len(employer_ids)}")
    for raw_url in re.findall(r"\burl:\s*'([^']+)'", data):
        if not valid_https_url(raw_url):
            errors.append(f"career toolkit static URL must be absolute HTTPS: {raw_url}")
    return errors, counts



def check_handwritten_notes(root: Path) -> tuple[list[str], int]:
    """Verify the two published notebook PDF/DOCX pairs and their learning tiers."""
    errors: list[str] = []
    stems = {
        "handwritten-style-soc-siem-fundamentals": ("SOC", "SIEM", "triage", "detection"),
        "common-attack-patterns-beginner-guide": ("phishing", "ransomware", "OWASP", "defensive"),
    }
    notes_dir = root / "website/public/notes"
    labs_source = (root / "website/src/data/labs.js").read_text(encoding="utf-8") if (root / "website/src/data/labs.js").is_file() else ""
    for stem, expected_terms in stems.items():
        pdf_path = notes_dir / f"{stem}.pdf"
        docx_path = notes_dir / f"{stem}.docx"
        if not pdf_path.is_file():
            errors.append(f"handwritten learning notes PDF is missing: {pdf_path.relative_to(root)}")
        elif pdf_path.stat().st_size < 20000 or not pdf_path.read_bytes().startswith(b"%PDF-"):
            errors.append(f"handwritten learning notes PDF is empty or invalid: {pdf_path.relative_to(root)}")
        else:
            try:
                # Count PDF page objects directly so the repo checks work on Windows too;
                # pdfinfo is not installed by default on learner Windows machines.
                pdf_bytes = pdf_path.read_bytes()
                page_count = len(re.findall(rb"/Type\s*/Page\b", pdf_bytes))
                if page_count < 10:
                    errors.append(f"{pdf_path.relative_to(root)} must be at least 10 pages; found {page_count}")
            except OSError:
                errors.append(f"could not verify page count for {pdf_path.relative_to(root)}")
        if not docx_path.is_file():
            errors.append(f"handwritten learning notes DOCX is missing: {docx_path.relative_to(root)}")
        else:
            try:
                with zipfile.ZipFile(docx_path) as archive:
                    xml = archive.read("word/document.xml")
                root_xml = ET.fromstring(xml)
                content = " ".join(root_xml.itertext()).lower()
                drawing_count = len(root_xml.findall(".//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}drawing"))
                if drawing_count < 5:
                    errors.append(f"{docx_path.relative_to(root)} needs at least five inline diagrams/flowcharts; found {drawing_count}")
                if b"Z003" not in xml:
                    errors.append(f"{docx_path.relative_to(root)} should apply the connected-script cursive typeface to the notes")
                for term in ("beginner", "intermediate", "advanced"):
                    if term not in content:
                        errors.append(f"{docx_path.relative_to(root)} is missing a learning tier: {term}")
                for term in expected_terms:
                    if term.lower() not in content:
                        errors.append(f"{docx_path.relative_to(root)} is missing expected content term: {term}")
            except (OSError, zipfile.BadZipFile, KeyError, ET.ParseError) as exc:
                errors.append(f"could not inspect handwritten notes DOCX {docx_path.relative_to(root)}: {exc}")
        if f"{stem}.pdf" not in labs_source or f"{stem}.docx" not in labs_source:
            errors.append(f"lab catalogue does not link both PDF and DOCX for {stem}")
    return errors, len(stems)

def check_tools_threats(root: Path) -> tuple[list[str], dict[str, int]]:
    """Check the learner-curated tool catalogue and movie-case-study page."""
    errors: list[str] = []
    page = root / "website/src/components/ToolsThreats.jsx"
    css = root / "website/src/components/tools-threats.css"
    app = root / "website/src/App.jsx"
    guide = root / "TOOLS-THREATS-MOVIE-STUDIES.md"
    curation = root / "TOOLS-CATALOGUE-CURATION.md"
    for path in (page, css, app, guide, curation):
        if not path.is_file():
            errors.append(f"required tools & movie studies file is missing: {path.relative_to(root)}")
    if errors:
        return errors, {"security_tools": 0, "movie_cases": 0, "safe_practice_links": 0}

    page_text = page.read_text(encoding="utf-8")
    app_text = app.read_text(encoding="utf-8")
    guide_text = guide.read_text(encoding="utf-8")
    curation_text = curation.read_text(encoding="utf-8")
    all_guide_text = guide_text + "\n" + curation_text
    catalog_block = page_text.split("const baseToolCatalog = [", 1)[-1].split("const toolMeta = {", 1)[0]
    tool_ids = re.findall(r"\bid:\s*'([^']+)'", catalog_block)
    tool_names = re.findall(r"\bid:\s*'[^']+'\s*,\s*name:\s*'([^']+)'", catalog_block)
    counts = {"security_tools": len(tool_ids), "movie_cases": 0, "safe_practice_links": 0}
    if len(tool_ids) != len(set(tool_ids)):
        errors.append("tool catalogue contains duplicate ids")
    if len(tool_ids) < 30:
        errors.append(f"learner tool catalogue must contain at least 30 curated profiles; found {len(tool_ids)}")
    if "const additionalTools = [" not in page_text or "const toolMeta = {" not in page_text:
        errors.append("tool catalogue must separate the expanded profiles and learner metadata")

    required_tools = (
        "Wireshark", "Nmap", "OWASP ZAP", "Burp Suite Community Edition", "Metasploit Framework",
        "Microsoft Sysmon", "Autopsy", "Ghidra", "Zeek", "CyberChef", "MITRE ATT&CK",
        "Python", "Visual Studio Code", "GitHub", "Wazuh", "Sigma detection rules", "Suricata",
        "Security Onion", "osquery", "Volatility 3", "The Sleuth Kit", "Eric Zimmerman’s Windows forensic tools",
        "crt.sh", "Internet Archive Wayback Machine", "GreyNoise", "Shodan", "VirusTotal",
        "Have I Been Pwned", "Prowler", "Grafana + Prometheus", "AbuseIPDB",
        "AlienVault Open Threat Exchange (OTX)", "OSINT Framework",
    )
    for name in required_tools:
        if name not in page_text:
            errors.append(f"tools & movie page is missing tool/reference: {name}")
        if name not in all_guide_text:
            errors.append(f"tool guide/curation guide is missing tool/reference: {name}")

    required_films = ("Mr. Robot", "Hackers (1995)", "Blackhat (2015)")
    for name in required_films:
        if name not in page_text or name not in guide_text:
            errors.append(f"movie case study must exist in page and guide: {name}")
    if "ToolsThreats" not in app_text or "['tools','Tools & films']" not in app_text:
        errors.append("Tools & films page is not connected to application navigation")
    for phrase in ("No attack commands", "explicit", "misuse", "fictional", "official", "first safe task"):
        if phrase.lower() not in page_text.lower():
            errors.append(f"tools & movie page is missing safety/content cue: {phrase}")
    for marker in ("tt-search", "toolQuery", "Start here", "cost", "setup", "firstTask", "const threatReading = [", "CISA Cybersecurity Advisories", "The DFIR Report", "ThreatFox", "SANS Internet Storm Center", "Cisco Talos Intelligence"):
        if marker not in page_text:
            errors.append(f"tool catalogue is missing learner usability feature: {marker}")
    safe_links = page_text.count("https://")
    if safe_links < 45:
        errors.append(f"tools & movie page should include curated official provider and educational links; found {safe_links}")
    if "real commands" in page_text.lower() or "attack commands" not in page_text.lower():
        errors.append("tools & movie page must clearly frame itself as command-free tool literacy")
    for disallowed in (
        "pimeyes.com", "snusbase.com", "breached.com", "haveibeenpawned.com", "shodanhq.com",
        "volatiltityfoundation.or", "ericsimmerman.githut.io",
    ):
        if disallowed in page_text.lower() or disallowed in curation_text.lower():
            errors.append(f"non-canonical or privacy-sensitive raw-list link should not be promoted: {disallowed}")
    if "people-search" not in curation_text.lower() or "breach-data" not in curation_text.lower():
        errors.append("curation guide must explain why privacy-invasive and breach-data services were not promoted")
    if "free starter content" not in page_text.lower() or "limits vary" not in page_text.lower():
        errors.append("training-platform section should acknowledge access/pricing differences")
    counts["movie_cases"] = len(required_films)
    counts["safe_practice_links"] = safe_links
    return errors, counts



def check_cybersecurity_pillars(root: Path) -> tuple[list[str], dict[str, int]]:
    """Verify the eight learner-oriented pillars and their links to canonical paths."""
    errors: list[str] = []
    counts = {"cybersecurity_pillars": 0, "domain_specializations": 0, "isc2_cissp_domains": 0}
    data_path = root / "website/src/data/cybersecurityDomains.js"
    app_path = root / "website/src/App.jsx"
    if not data_path.is_file():
        return ["missing website/src/data/cybersecurityDomains.js"], counts
    if not app_path.is_file():
        errors.append("missing website/src/App.jsx for pillar rendering")
        return errors, counts

    source = data_path.read_text(encoding="utf-8")
    app = app_path.read_text(encoding="utf-8")
    block_match = re.search(
        r"export const cybersecurityPillars = \[(.*?)\n\];\n\n// This is ISC2's current CISSP exam-domain list",
        source,
        re.S,
    )
    if not block_match:
        return ["could not find the cybersecurityPillars data array"], counts
    block = block_match.group(1)
    top = list(re.finditer(r"^  \{\n    id: '([^']+)'", block, re.M))
    ids = [match.group(1) for match in top]
    expected_ids = {
        "offensive-security", "defensive-security", "engineering-architecture",
        "cloud-modern-infrastructure", "dfir-cyber-investigation", "grc-risk-compliance",
        "emerging-advanced-domains", "physical-human-security",
    }
    counts["cybersecurity_pillars"] = len(ids)
    if len(ids) != 8 or set(ids) != expected_ids:
        errors.append(f"domain map must define the eight canonical pillars; found {sorted(ids)}")
    if len(ids) != len(set(ids)):
        errors.append("cybersecurity pillar IDs must be unique")

    all_specializations = re.findall(r"\{ name: '([^']+)', description: '([^']+)', firstStep: '([^']+)' \}", block)
    names = [name for name, _, _ in all_specializations]
    counts["domain_specializations"] = len(all_specializations)
    if len(all_specializations) != 31:
        errors.append(f"the eight pillars should cover the 31 supplied specializations; found {len(all_specializations)}")
    if len(names) != len(set(names)):
        errors.append("specialization names must be unique")
    for name, description, first_step in all_specializations:
        if not description.strip() or not first_step.strip():
            errors.append(f"specialization {name} needs both a description and beginner first step")

    expected_official = {
        "Security and Risk Management", "Asset Security", "Security Architecture and Engineering",
        "Communication and Network Security", "Identity and Access Management (IAM)",
        "Security Assessment and Testing", "Security Operations", "Software Development Security",
    }
    official_block = source.split("export const isc2CisspDomains = [", 1)[-1].split("];", 1)[0]
    official_domains = set(re.findall(JS_STRING, official_block))
    counts["isc2_cissp_domains"] = len(official_domains)
    if official_domains != expected_official:
        errors.append("ISC2 CISSP exam domain list does not match the official eight-domain list stored in the module")

    if "not" not in app.lower() or "official (isc)² cissp exam-domain list" not in app.lower():
        errors.append("Paths page must clarify the OpenCyberPath map is not the official ISC2 CISSP domain list")
    if "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline" not in app:
        errors.append("Paths page must link to the official ISC2 CISSP exam outline")
    if "visibleCybersecurityPillars" not in app or "domain-pillars-grid" not in app:
        errors.append("Paths page must render the searchable cybersecurity pillar map")
    plain_app = re.sub(r"<[^>]+>", " ", app)
    plain_app = re.sub(r"\s+", " ", plain_app)
    if "domain-quick-card-grid" not in app or "All 8 cybersecurity pillars" not in plain_app:
        errors.append("Paths page must display all eight pillars in a visible at-a-glance grid")
    if "10 career visions" not in plain_app or "Choose one of the" not in plain_app or "learningPaths.map((path) => <PathCard" not in app:
        errors.append("Paths page must visibly offer ten learner-selectable career visions")

    path_ids = {m.group(1) for m in re.finditer(r"^    id: '([^']+)'", (root / "website/src/data/careerPaths.js").read_text(encoding="utf-8"), re.M)}
    starts = list(re.finditer(r"^  \{\n    id: '([^']+)'", block, re.M))
    for index, match in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(block)
        pillar_block = block[match.start():end]
        related_match = re.search(r"relatedPathIds:\s*\[([^\]]*)\]", pillar_block, re.S)
        related = re.findall(JS_STRING, related_match.group(1)) if related_match else []
        if not related:
            errors.append(f"pillar {match.group(1)} must map to at least one existing learning route")
        for path_id in related:
            if path_id not in path_ids:
                errors.append(f"pillar {match.group(1)} references unknown learning path: {path_id}")
    return errors, counts


def run_quality_checks(root: Path = ROOT) -> tuple[list[str], list[str], dict[str, int]]:
    errors: list[str] = []
    warnings: list[str] = []
    counts = {"resources": 0, "labs": 0, "career_paths": 0, "csv_files": 0, "csv_rows": 0, "document_pairs": 0, "career_directions": 0, "hacker_hat_terms": 0, "beginner_stages": 0, "job_sources": 0, "employer_portals": 0, "handwritten_note_pairs": 0, "cybersecurity_pillars": 0, "domain_specializations": 0, "isc2_cissp_domains": 0}

    json_path = root / "data/resources.json"
    js_resources_path = root / "website/src/data/resources.js"
    labs_path = root / "website/src/data/labs.js"
    required = [json_path, js_resources_path, labs_path,
                root / "website/public/labs/detection-evaluation-cases.csv",
                root / "website/public/labs/evaluate-detection-cases.py"]
    for path in required:
        if not path.is_file():
            errors.append(f"required file is missing: {path.relative_to(root)}")

    # Catch malformed SVG files before they can silently render as broken images in the browser.
    image_root = root / "website/public/images"
    valid_svg_count = 0
    if image_root.is_dir():
        for svg_file in image_root.rglob("*.svg"):
            try:
                ET.parse(svg_file)
                valid_svg_count += 1
            except (ET.ParseError, OSError) as exc:
                errors.append(f"SVG artwork is malformed: {svg_file.relative_to(root)} ({exc})")
        counts["svg_assets"] = valid_svg_count
    else:
        errors.append("required image directory is missing: website/public/images")

    app_source_path = root / "website/src/App.jsx"
    css_source_path = root / "website/src/styles.css"
    if app_source_path.is_file():
        app_source = app_source_path.read_text(encoding="utf-8")
        if "function handleArtworkError(event)" not in app_source or app_source.count("onError={handleArtworkError}") < 6:
            errors.append("the main card images must include the shared artwork fallback handler")
        if 'className="quote-spotlight"' not in app_source:
            errors.append("the homepage is missing the learner quote spotlight")
    if css_source_path.is_file():
        css_source = css_source_path.read_text(encoding="utf-8")
        if css_source.lstrip().startswith("import { useEffect") or "function App()" in css_source[:1000]:
            errors.append("website/src/styles.css contains JavaScript instead of CSS")
        if ".quote-spotlight {" not in css_source or ".gratitude-card:after" not in css_source:
            errors.append("learner quotes must have prominent styling in the stylesheet")

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
        practice = item.get("practiceUrl")
        if practice and not valid_https_url(practice):
            errors.append(f"resource {rid} practice URL must be an absolute HTTPS URL: {practice}")
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
        practice = record.get("practiceUrl")
        if practice and not valid_https_url(practice):
            errors.append(f"website resource {rid} practice URL must be an absolute HTTPS URL: {practice}")
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
            js_practice = js_by_id[rid].get("practiceUrl")
            json_practice = json_by_id[rid].get("practiceUrl")
            if js_practice != json_practice:
                errors.append(f"resource mirror mismatch for {rid}.practiceUrl; run python scripts/sync_catalogue.py")
            js_monogram = js_by_id[rid].get("monogram")
            json_monogram = json_by_id[rid].get("monogram")
            if js_monogram != json_monogram:
                errors.append(f"resource mirror mismatch for {rid}.monogram; run python scripts/sync_catalogue.py")
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
    path_errors, path_count = check_career_paths(root, set(js_by_id), seen_lab_ids)
    errors.extend(path_errors)
    counts["career_paths"] = path_count
    toolkit_errors, toolkit_counts = check_career_toolkit(root)
    errors.extend(toolkit_errors)
    counts.update(toolkit_counts)
    handwritten_errors, handwritten_count = check_handwritten_notes(root)
    errors.extend(handwritten_errors)
    counts["handwritten_note_pairs"] = handwritten_count
    tools_errors, tools_counts = check_tools_threats(root)
    errors.extend(tools_errors)
    counts.update(tools_counts)
    pillar_errors, pillar_counts = check_cybersecurity_pillars(root)
    errors.extend(pillar_errors)
    counts.update(pillar_counts)

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
    print(f"Resources: {counts['resources']} | Career paths: {counts['career_paths']} | Labs: {counts['labs']} | PDF/DOCX pairs: {counts['document_pairs']} | CSV files: {counts['csv_files']} ({counts['csv_rows']} rows)")
    print(f"Career toolkit: {counts['career_directions']} directions | {counts['hacker_hat_terms']} hat labels | {counts['beginner_stages']} journey stages | {counts['job_sources']} job sources | {counts['employer_portals']} employer portals | {counts['handwritten_note_pairs']} handwritten note pairs")
    print(f"Tools & films: {counts.get('security_tools', 0)} tool/reference profiles | {counts.get('movie_cases', 0)} movie case studies | {counts.get('safe_practice_links', 0)} official/reference links")
    print(f"Domain map: {counts['cybersecurity_pillars']} pillars | {counts['domain_specializations']} specialisations | {counts['isc2_cissp_domains']} official CISSP domains referenced separately")
    print(f"Visuals: {counts.get('svg_assets', 0)} valid SVG assets | fallback handlers and learner quote highlights present")
    for warning in warnings:
        print(f"WARNING: {warning}")
    if errors:
        for error in errors:
            print(f"FAIL: {error}")
        print(f"FAILED: {len(errors)} check(s)")
        return 1
    print("PASS: catalogue parity, ten career visions, visible eight-pillar domain map, valid SVG artwork, resilient image fallbacks, prominent learner quotes, official CISSP-domain distinction, career toolkit, tool/movie case studies, required metadata, local assets, documents, CSV/JSON structure, and synthetic evaluator output.")
    print("Scope note: these checks do not verify external URLs or replace browser/accessibility tests.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
