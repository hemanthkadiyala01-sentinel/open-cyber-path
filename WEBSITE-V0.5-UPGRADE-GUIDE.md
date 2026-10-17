# OpenCyberPath v0.5 upgrade guide

This is a **file overlay** for your existing repository. It intentionally does not include or replace `.git`, `package.json`, `package-lock.json`, `website/src/main.jsx`, or `node_modules`.

## 1. Extract the ZIP

Extract `open-cyber-path-v0.5-upgrade.zip` to:

`C:\Users\dell\Downloads\open-cyber-path-v0.5-upgrade`

Before copying, confirm that these files exist in the extracted folder:

- `website/src/App.jsx`
- `website/src/styles.css`
- `website/public/images/learning/soc-investigation.webp`
- `website/public/images/learning/handwritten-notes-study.svg`
- `website/public/labs/threat-hunt-auth-dns-samples.csv`

## 2. Stop Vite and check Git

In the terminal running the website, press `Ctrl+C`. Then in PowerShell:

```powershell
$repo = "$HOME\Downloads\open-cyber-path"
$overlay = "$HOME\Downloads\open-cyber-path-v0.5-upgrade"

git -C $repo status --short
Test-Path "$overlay\website\src\App.jsx"
Test-Path "$overlay\website\src\styles.css"
```

Both `Test-Path` commands should return `True`. Commit or back up any important uncommitted changes before copying.

## 3. Copy the overlay into the repository root

```powershell
Copy-Item "$overlay\*" $repo -Recurse -Force
```

Do **not** copy the ZIP into the `website` folder itself. The overlay's `website` folder must merge with your repository's existing `website` folder.

## 4. Build and run

```powershell
cd "$HOME\Downloads\open-cyber-path\website"
npm ci
npm run build
npm run dev
```

Open the localhost URL that Vite prints. In Chrome, press `Ctrl+Shift+R` for a hard refresh.

## 5. Check the new evidence panel

On the homepage, confirm that the synthetic CSV panel shows:

- 10 sample rows, 6 failed sign-ins, 2 successful sign-ins, and 2 DNS events.
- Label counts of 5 benign, 4 suspicious, and 1 ambiguous.
- The detection-rule scorecard: TP=2, FP=1, TN=4, FN=1; accuracy 75.0%, precision 66.7%, recall 66.7%, specificity 80.0%, and F1 66.7%.

These values are calculated from the included synthetic teaching files and are **not** live telemetry or real-world performance estimates. If the sample data changes, the browser panel should update with the new CSV values.

Also open the learning paths, verify the different concept visuals and colors, test lab filters, and download at least one PDF, DOCX, and sample CSV. The new public benchmark cards link to the original CIC-IDS2017, CTU-13, and Splunk BOTS v3 source pages; source caveats are recorded in `PUBLIC-DATA-SOURCES.md`.

## Validation completed for this bundle

The JavaScript/JSX source was parsed with TypeScript's JSX parser, the CSS was parsed with PostCSS, all SVGs were parsed as XML, all referenced learning image paths were checked, and the visible data calculations were tested against the included CSV files. A full Vite production build still needs to be run on the user's machine because the isolated packaging environment could not finish npm package installation.
