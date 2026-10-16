# OpenCyberPath Website v0.2 Upgrade

This package overlays the existing `website` directory with: learning tiers (beginner/intermediate/advanced), a Labs & Notes page, downloadable PDF/DOCX notes, safe sample cases, a simple metrics exercise, and curated YouTube videos with linked official documentation.

## Apply

Extract the ZIP, then copy the contents of the extracted bundle into the root of the cloned `open-cyber-path` repository, preserving folder paths and overwriting only matching files. The bundle intentionally updates `README.md`, `data/resources.json`, `roadmaps/learning-tiers.md`, the video/quickstart docs, and selected files under `website/`; it does not replace `CONTRIBUTING.md`, `RESOURCE_VERIFICATION.md`, or the existing root SOC Analyst roadmap. In PowerShell, from the repository root, you can use `Copy-Item "$HOME\Downloads\open-cyber-path-v0.2-extracted\*" . -Recurse -Force` after extracting the ZIP to that folder.

## Run

```powershell
cd website
npm ci
npm run dev
```

## Note files

The `website/public/notes` folder contains DOCX and PDF versions of the original OpenCyberPath learning aids. The handwritten-style SOC notes use a notebook/handwriting-inspired style; they are typeset notes, not handwritten scans. `website/public/labs` contains synthetic training data and a small evaluation script.

## Lab safety and cost

All bundled events are synthetic examples. Do not use them as evidence of activity on a real host. Wazuh and other complete SIEM stacks may require significant local resources; check official requirements. Avoid starting cloud resources until you understand pricing. Video tutorial steps can be outdated; current official documentation takes precedence.

## Validate before committing

```powershell
npm run build
python .\public\labs\evaluate-detection-cases.py .\public\labs\detection-evaluation-cases.csv
```

From the repository root, review `git status`, stage only the intended files, and commit after you have viewed the website.
