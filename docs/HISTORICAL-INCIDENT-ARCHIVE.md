# Historical Cyber Incident Archive — 1.0.1

## What this patch changes

- Adds a source-backed archive of real, publicly documented cyber incidents spanning India and international cases across health, education, banking/payments, energy, aviation, software supply chain, public services, media and other sectors.
- Makes the existing incident search search both the refreshed live feed and the archive. If no exact archive search result exists, it shows a labelled set of recent archived cases instead of leaving the archive area empty.
- Each archive card includes incident date, publication date, country/sector, the source-status label, a paraphrased summary, key facts/caveats, a primary source, and related resources.
- Adds original sector-themed SVG illustrations. They are explicitly labelled as illustrative artwork, not photographs of the specific incident. Sources link to the original publishers.
- Does not replace or alter the live-feed refresh script, its current JSON snapshot, backend routes, database, authentication, `.env` files, Docker Compose, or any `.bak` files.

## Accuracy rules

- The archive is a curated starter library, not a claim to enumerate every incident worldwide.
- Official advisories are not automatically proof that any particular organisation was breached.
- The wording retains the source's confidence level: official statement, regulatory filing, company report, media report, or legal charging document.
- Counts local to a jurisdiction (such as PowerSchool figures in Newfoundland and Labrador) are not presented as global totals.
- The reported PwC data volume is labelled as unverified in the source; PHP2Shell exploitation reporting is kept separate from proof of compromise at a particular victim.
- All summaries are paraphrases. Article bodies and copyrighted news images are not copied into the site.
- Synthetic evidence in the existing training drill remains separate from actual incident data.

## Apply

Extract the package and run from PowerShell:

```powershell
python .\apply-historical-incident-archive.py "C:\Users\dell\Downloads\open-cyber-path"
```

The installer requires `feat/caselab-case-experience`, refuses staged changes, validates exact SHA-256 baselines for the installed 0.3.1 incident-specific JSX/CSS, refuses to overwrite new-file destinations, backs up only the two edited files outside the repo and rolls back if the archive contract tests fail. If the baseline differs, stop and export the changed target files for a new merge; do not bypass the guard.

## Verify after applying

```powershell
python -m unittest discover -s tools/liveops -p "test_historical_incident_library.py" -v
Set-Location .\website
npm run check
```

Then in the browser search for `AIIMS`, `C-Edge`, `Kudankulam`, `Air India`, `PowerSchool`, `Synnovis`, `Change Healthcare`, `MOVEit`, `eMudhra`, `PwC`, and `Cisco SD-WAN`. Each should resolve to a card from the live feed and/or historical archive, with source and resource links.

## Live coverage caveat

Current-feed coverage still depends on the refresh script's configured publishers and feeds. This archive broadens the historical catalogue; it does not pretend to be a complete live global incident monitor. Additional live source ingestion should be added source-by-source with parser tests and source freshness metadata.
