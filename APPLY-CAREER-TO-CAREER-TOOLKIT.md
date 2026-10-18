# Apply the OpenCyberPath visual-refresh, 10-vision, and handwritten-notes upgrade

This is the **current cumulative overlay** for OpenCyberPath. It contains the visible eight-pillar map, ten career visions, career-to-application toolkit, connected-cursive notes, curated tool catalogue, movie case studies, and quality checks. It is not a complete standalone repository export. Back up or commit your repository first and review the files to be replaced.

## 1. Download and extract

Download `open-cyber-path-visual-refresh-overlay-20261017.zip` and extract its contents into a separate folder, for example:

`C:\Users\dell\Downloads\open-cyber-path-visual-refresh-overlay-20261017`

The extracted folder should contain `website\src\App.jsx`, `website\src\data\careerPaths.js`, `website\src\data\cybersecurityDomains.js`, the career-toolkit components, both updated DOCX/PDF notes, the ten route markdown files, and this guide.

## 2. Merge into the local repository

Adjust these paths if your folders differ. In PowerShell:

```powershell
$repo = "$HOME\Downloads\open-cyber-path"
$overlay = "$HOME\Downloads\open-cyber-path-visual-refresh-overlay-20261017"

Test-Path "$overlay\website\src\App.jsx"
Test-Path "$overlay\website\src\data\careerPaths.js"
Test-Path "$overlay\website\src\data\cybersecurityDomains.js"
Test-Path "$overlay\website\public\notes\handwritten-style-soc-siem-fundamentals.pdf"
Test-Path "$overlay\website\public\notes\common-attack-patterns-beginner-guide.pdf"
Test-Path "$overlay\TEN-CAREER-VISIONS.md"
```

All six checks should return `True`. Then copy the overlay's top-level contents into the repository:

```powershell
Get-ChildItem -LiteralPath $overlay -Force | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $repo -Recurse -Force
}
```

Do not copy into `website` itself; the files such as `scripts` and `tests` live at the repository root. Review local customisations before overwriting any file.

## 3. Run checks at the repository root

```powershell
cd "$HOME\Downloads\open-cyber-path"
python scripts\sync_catalogue.py
python scripts\quality_checks.py
python -m unittest discover -s tests -v
```

Expected quality summary: **10 career visions, 8 domain pillars, 31 specialisations, 8 separately recorded CISSP domains, 33 curated tool/reference profiles, and two study-note pairs with at least ten pages and diagrams**. Python tests are designed not to depend on `pdfinfo`, which is usually not installed on Windows.

## 4. Build and run the website

```powershell
cd website
npm ci
npm run build
npm run dev
```

Open the local URL printed by Vite. The pages include Paths, Career hub, Resume, Jobs, Application demo, Tools & films, and Labs & notes.

## 5. Visual refresh and quote emphasis

- The cloud-posture SVG was repaired; the malformed `&` character had made it invalid XML and caused several cards that reused it to show broken-image icons.
- The ten career paths now use ten distinct local, concept-specific generated illustrations. The resource and lab catalogues use matching concept art where useful.
- Main images have an `onError` fallback, so if an image ever fails to load the card uses the local foundations artwork instead of displaying a broken-image icon.
- The homepage has a prominent actionable quote panel near the top, and the six learner encouragement cards use pull-quote styling, a large quote mark, and strong accent borders.
- The current overlay includes the 13-page SOC/SIEM and 15-page attack-pattern PDF/DOCX files at the exact paths used by the website's note cards.

## 6. Manual acceptance tests

- Open Paths. Confirm the page visibly starts with **All 8 cybersecurity pillars** in a card grid, then separately shows **10 career visions**.
- Open each pillar card and verify descriptions, levels, safe first steps, and related roadmap links. Confirm the CISSP domains are separately labelled and the official (ISC)² outline is linked.
- Open each of the ten career directions and confirm it reaches a distinct roadmap detail with modules, safe practice, evidence, and capstone.
- In Labs & notes, open the SOC/SIEM PDF and the Common Attack Patterns PDF. Confirm they show 13 and 15 pages respectively, connected cursive text, flowcharts/diagrams, legible contrast, page numbers, and no clipping. Check the editable DOCX versions too.
- Open Resume; edit fields; test preview, text/HTML downloads and Print/Save as PDF. Verify the keyword reviewer is labelled as a basic heuristic, not an ATS predictor.
- Open Jobs; try a role/location search and verify external listings on the original provider. Review employer eligibility before applying.
- Use the fictional application demo and confirm no application is actually submitted. Test tracker edits, JSON export, remove, and browser-local persistence.
- Open Tools & films; test search/category filters and representative cards, official links, safe first tasks, risks, and film reality checks.
- Test on a narrow viewport and via keyboard; check focus states, headings, download links, and horizontal overflow.

## 7. Review and commit

```powershell
git diff --check
git status --short
git diff --stat
```

Review changed files before staging. When satisfied:

```powershell
git add -A
git diff --cached --stat
git commit -m "feat: add ten career visions and illustrated handwritten notes"
git push
```

Only push after reviewing the staged diff and ensuring it includes no unrelated local or personal files. Preparing the ZIP does not change GitHub.

## Build validation note

The package-level checks confirm all 25 SVGs parse, all 10 career paths have unique local artwork, all referenced catalogue images exist, and the JSX/CSS source parses. The full Vite build and interactive browser review still need to run locally because this overlay excludes `package.json`, lockfiles, and dependencies by design.
