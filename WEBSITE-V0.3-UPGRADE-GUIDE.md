# OpenCyberPath v0.4 overlay — corrected extraction layout

This ZIP is deliberately **flattened**: its top-level entries are `website/`, `data/`, `roadmaps/`, and project documentation. Do not copy a wrapper folder into your repository. The website theme is defined by `website/src/App.jsx` and `website/src/styles.css`.

## Apply on Windows PowerShell

1. Stop Vite with `Ctrl+C` in the terminal where `npm run dev` is running.
2. Download this ZIP and extract it to `C:\Users\dell\Downloads\open-cyber-path-v0.3-overlay-fixed` (or another empty folder).
3. Check that the extracted folder has a `website` folder directly inside it, and that this file exists:

   `open-cyber-path-v0.3-overlay-fixed\website\src\App.jsx`

4. Run the following commands, adjusting the extraction folder only if you chose a different name:

```powershell
$repo = "$HOME\Downloads\open-cyber-path"
$overlay = "$HOME\Downloads\open-cyber-path-v0.3-overlay-fixed"
Test-Path "$overlay\website\src\App.jsx"
Copy-Item "$overlay\*" $repo -Recurse -Force
```

The `Test-Path` command must return `True`. The copy command should replace the actual `website\src\App.jsx` and `website\src\styles.css` in your repository, not create a nested `open-cyber-path-v0.3-upgrade` folder. Your existing `website\src\main.jsx`, `package.json`, lockfile, `.git`, and other setup files are intentionally not included in this overlay.

5. Verify the files really changed:

```powershell
cd "$HOME\Downloads\open-cyber-path"
Select-String -Path .\website\src\App.jsx -Pattern "No fake ratings|Choose your learning|THE RESOURCE LIBRARY"
Select-String -Path .\website\src\styles.css -Pattern "#06121d|#071721|--mint"
```

6. Build and restart the dev server:

```powershell
cd "$HOME\Downloads\open-cyber-path\website"
npm ci
npm run build
npm run dev
```

Open the localhost URL Vite prints. If Chrome still shows the old page, perform a hard refresh with `Ctrl+Shift+R`. Confirm the new dark navy-and-emerald home hero, image-led resource and lab cards, learning paths, and attack-pattern explanations appear.

## What's included

- Premium dark navy-and-emerald redesign; responsive cards and navigation.
- Custom inline SVG icons with distinct icons for notebooks, hunting, web security, and commands.
- Dedicated threat-hunting and responsible bug-bounty paths and labs.
- PDF and editable DOCX notes, plus sample CSVs and command cheat sheet.
- Plain-language attack-pattern explanations with causes, examples, and defensive mitigations.
- Honest resource labels; synthetic datasets; no fake popularity numbers or testimonials.

## Safety and verification

Threat-hunting examples use synthetic data. Bug-bounty practice must remain in purpose-built labs or within explicit written scope. The overlay does not grant permission to test public targets. The build must be run locally after applying the overlay; do not treat this package as deployed online.


For the per-path palette and unique topic illustrations, also see `WEBSITE-V0.4-STYLE-UPGRADE.md`.
