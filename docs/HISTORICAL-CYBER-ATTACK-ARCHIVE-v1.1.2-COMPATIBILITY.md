# Historical Cyber-Attack Archive v1.1.2 — compatibility merge

## Purpose

This patch brings the reviewed 119-case historical archive into the supplied current `LiveIncidentOps.jsx` snapshot without replacing its existing live-intelligence work. It is tailored to the exact component SHA-256 below and the original 26-case archive JSON baseline.

## Changes

- Updates `website/src/data/historical-incident-library.json` to schema 1.1.1 with 119 unique, source-backed records.
- Adds explicit historical-record classification labels in archive cards and search.
- Displays year-only and decade-approximate incident dates without implying a precise day.
- Clearly labels unknown publication dates instead of formatting placeholders as real publication dates.
- Preserves the supplied component's on-demand refresh state, refresh button, API fallback, and six incident-specific investigation mappings/cases.
- Adds dedicated archive tests and this compatibility note.

## Exact snapshot guards

- Required branch: `feat/caselab-case-experience`
- Baseline `website/src/data/historical-incident-library.json`: `9c975b8dc88489c43699ed5e0e82d9d305a520bbf34710c1ed252bdb00187ae7`
- Baseline `website/src/components/LiveIncidentOps.jsx`: `6910fa4df2d729d3432c787fd6a9812903abc5aed5f5e6bda84c2aca7af8e8b3`

The installer stops if either target differs, if a touched target is staged, or if either new-file destination already exists. It does not reset, clean, stage, commit, push, or deploy the repository. It backs up both replacement targets before writing and rolls them back if its tests fail.

## Apply

Extract the ZIP and run the included `apply-historical-cyber-archive-v1_1_2.py` with the repository root as the only argument. Then run:

```powershell
Set-Location "C:\Users\dell\Downloads\open-cyber-path"
python -m unittest discover -s tools/liveops -p "test_historical_incident_archive_v1_1_2.py" -v
python -m unittest discover -s tools/liveops -p "test_historical_incident_library.py" -v
Set-Location .\website
npm run check
```

A successful Python test run does not replace a browser smoke test. After the website check passes, verify that the live refresh button still appears, the 119-case historical count appears, search finds `Joybubbles` and `SBI`, and classification/date labels render correctly.
