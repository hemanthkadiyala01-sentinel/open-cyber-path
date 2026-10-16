# OpenCyberPath website v0.1 — quick start

This starter website lives in `website/` so it does not overwrite the repository's existing README, resource catalogue, roadmap, or contribution policy.

## Run it locally

Requirements: Node.js LTS and npm.

```powershell
cd website
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Check the production build

```powershell
npm run build
```

The build output is written to `website/dist/`.

## What's included

- Responsive homepage describing the OpenCyberPath mission.
- Resource cards with provider, topic, level, access type, and official link.
- Working search plus category, access-type, and skill-level filters.
- SOC Analyst roadmap page.
- Clearly labelled free, open-source, free-tier, and variable-access resources.
- React/Vite app without a required icon library or paid API.

## Notes

- The website uses a curated starter catalogue in `website/src/data/resources.js`. The existing repository catalogue at `data/resources.json` is preserved; we can unify the schema after the first UI review.
- External resource pricing and access can change. Verify all links and free/paid conditions before treating them as fully checked.
- This is a local development milestone, not a deployed production website.
