# OpenCyberPath v0.4 — Distinct colours and visual identities

This overlay builds on v0.3. It is designed so different learning areas no longer reuse one image and one mint accent everywhere.

## Visual language

- Foundations: cobalt/sky blue, network topology and workstation art.
- SOC & SIEM: coral/rose, alert and event-monitoring art.
- Threat hunting: teal/cyan, radar and timeline art.
- Bug bounty/web security: violet/magenta, browser and inspection art.
- Detection engineering: indigo/lavender, rule workbench and evaluation art.
- Handwritten notes: warm paper, amber and pen/sketch illustrations.
- Command cheat sheets: gold/amber terminal visual.
- Attack awareness: coral/red alert visual; each explanatory card has its own icon.
- Digital forensics: copper/amber timeline and evidence-container visual.
- Video guides: warm yellow play-screen visual.

CSS uses topic-specific classes on resource, learning-path, lab, video, and attack cards, so cards retain their palette when filtered or moved between sections. SVG cover illustrations are local, sharp at different card sizes, and load without external image requests.

## Apply

Extract the ZIP, then from PowerShell run:

```powershell
$repo = "$HOME\Downloads\open-cyber-path"
$overlay = "$HOME\Downloads\open-cyber-path-v0.4-upgrade"
Copy-Item "$overlay\*" $repo -Recurse -Force
cd "$repo\website"
npm ci
npm run build
npm run dev
```

When extracting, make sure `$overlay\website\src\App.jsx` exists before copying. Open the Vite localhost URL and press Ctrl+Shift+R. Do not overwrite package files or Git history; this overlay contains the updated website source, resource data, generated art, and learning handouts.

## What to test

1. Learning path cards each have a different art asset and accent.
2. Resource cards use topic-appropriate artwork.
3. Lab filters keep category-specific colors.
4. SOC notebook banner has a warm paper colour.
5. Threat-hunting, bug-bounty, detection, cheat-sheet and attack-basics cards are visually distinct.
6. PDF/DOCX links and the existing detection evaluation script still work.
