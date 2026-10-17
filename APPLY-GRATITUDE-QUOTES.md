# Apply the OpenCyberPath learner-motivation update

This version replaces the earlier passive “Gratitude & Growth” reflections with a practical, learner-first “Keep going” section. The featured message is paired with buttons to open labs and learning paths. Each of six cards has a distinct color, original encouragement, one concrete next step, and a copy/share action.

## Contents

- `website/src/App.jsx` — new learner-focused copy and actionable cards.
- `website/src/styles.css` — stronger visual hierarchy, vivid accents, compact action prompts, responsive layout, and reduced-motion support.
- `GRATITUDE-QUOTES.md` — the source text for the original motivation cards.

## Safe installation

1. Stop the Vite dev server with Ctrl+C.
2. Extract this ZIP to a new folder such as `C:\Users\dell\Downloads\open-cyber-path-motivation-overlay`.
3. Confirm that `website\src\App.jsx` and `website\src\styles.css` exist in that folder. The ZIP paths begin with `website/`, not another enclosing project folder.
4. From PowerShell, run:

```powershell
$repo = "$HOME\Downloads\open-cyber-path"
$overlay = "$HOME\Downloads\open-cyber-path-motivation-overlay"

Test-Path "$overlay\website\src\App.jsx"
Test-Path "$overlay\website\src\styles.css"
```

Both checks must return `True` before copying. Then apply only these files:

```powershell
Copy-Item "$overlay\website\src\App.jsx" "$repo\website\src\App.jsx" -Force
Copy-Item "$overlay\website\src\styles.css" "$repo\website\src\styles.css" -Force
Copy-Item "$overlay\GRATITUDE-QUOTES.md" "$repo\GRATITUDE-QUOTES.md" -Force
```

5. Run checks from the website directory:

```powershell
cd "$HOME\Downloads\open-cyber-path\website"
npm run build
npm run dev
```

6. Open the localhost URL Vite prints and scroll to “Keep going”. Test both featured buttons, each “Share this boost” copy button, and the layout at mobile width. Do not commit until the page has been reviewed.

All updated quotes are original OpenCyberPath writing and are not attributed to real people. The cards encourage safe practice and do not promise jobs or outcomes.
