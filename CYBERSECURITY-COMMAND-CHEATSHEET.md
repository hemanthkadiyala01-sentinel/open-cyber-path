# Cybersecurity Command Cheatsheet

Quick reference for learning on your own device, supplied sample data, and local training apps.

## Windows PowerShell

```powershell
# List CPU-heavy processes on your own device
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name,Id,CPU

# Read recent successful/failed logon events (may require permissions)
Get-WinEvent -FilterHashtable @{LogName="Security"; Id=4624,4625} -MaxEvents 20

# Read a local sample JSON file
$data = Get-Content .\sample.json -Raw | ConvertFrom-Json

# Search a local sample file
Select-String -Path .\sample.csv -Pattern "suspicious"
```

## Linux

```bash
ip addr                         # interfaces/addresses on your device
ss -tulpn                       # local listening sockets
journalctl -p warning -n 50     # recent journal warnings
grep -in "failed" sample.log   # find matching lines in a local sample
cut -d, -f1 sample.csv | sort | uniq -c  # count first-column values in simple CSV
```

## Networking and local web labs

```text
nslookup example.com                  # basic DNS lookup
curl -I http://127.0.0.1:3000         # headers from a local training app only
```

## Investigation loop

1. Define a question and time range.
2. Filter relevant sample records.
3. Group by account, host, source, and outcome.
4. Compare with a baseline and consider benign explanations.
5. Record observed facts separately from assumptions.

## Bug bounty reminder

Review written scope and rules before testing; use official training labs or a local intentionally vulnerable app; avoid destructive tests and real-user data; stop when scope is unclear; submit a concise, reproducible report with secrets and personal data redacted.

## Detection metrics

- Precision = TP / (TP + FP)
- Recall = TP / (TP + FN)
- Specificity = TN / (TN + FP)
- F1 = 2 × Precision × Recall / (Precision + Recall)

> These examples are for your own system, sample files, and authorised training environments. Do not test systems without explicit permission.
