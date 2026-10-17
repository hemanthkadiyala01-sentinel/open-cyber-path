# Apply CP-01 / CP-02 to OpenCyberPath

This is a **small overlay** for the existing OpenCyberPath repository. It does not replace `website/package.json`, `website/package-lock.json`, `website/src/App.jsx`, styles, assets, or Git history. It adds an audit report, Python data-quality checks, a GitHub Actions workflow, tests, and an up-to-date JSON mirror of the runtime resource catalogue.

## 1. Back up/check your working tree

From PowerShell:

```powershell
$repo = "$HOME\Downloads\open-cyber-path"
git -C $repo status --short
```

Commit or back up any important uncommitted work before copying the patch.

## 2. Extract the ZIP

Extract the ZIP to:

`C:\Users\dell\Downloads\open-cyber-path-cp01-cp02-overlay`

Then merge **all** overlay contents into the repository, including `.github`:

```powershell
$repo = "$HOME\Downloads\open-cyber-path"
$overlay = "$HOME\Downloads\open-cyber-path-cp01-cp02-overlay"

Get-ChildItem -LiteralPath $overlay -Force | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $repo -Recurse -Force
}
```

## 3. Run local validation

```powershell
cd "$HOME\Downloads\open-cyber-path"
python scripts\quality_checks.py
python -m unittest discover -s tests -v

Push-Location website
npm ci
npm run build
Pop-Location
```

Expected Python validation summary for the current dataset: 19 resources, 11 labs, 11 PDF/DOCX pairs, and five CSV files. The evaluation smoke test should report TP=2, FP=1, TN=4, FN=1, with one ambiguous case excluded. All bundled data is synthetic training data.

If you edited `website/src/data/resources.js`, regenerate the JSON mirror before checking:

```powershell
python scripts\sync_catalogue.py
python scripts\quality_checks.py
```

## 4. Verify GitHub Actions

Review the diff first:

```powershell
git status --short
git diff --stat
git diff -- data/resources.json
```

Commit and push only after local checks pass. The workflow `.github/workflows/quality.yml` runs on pushes and pull requests to `main`. A successful workflow validates the specific build/data checks it runs; it is not a security certification and does not replace browser or accessibility testing.
