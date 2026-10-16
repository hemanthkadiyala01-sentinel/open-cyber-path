#!/usr/bin/env python3
"""Evaluate a narrow sample PowerShell rule against labelled training CSV cases."""
import csv
import re
import sys
from pathlib import Path


def detect(row: dict[str, str]) -> bool:
    """Sample rule: powershell.exe with -enc or -encodedcommand argument."""
    process = row["process"].strip().replace("/", "\\").rsplit("\\", 1)[-1].casefold()
    command = row["command_line"].casefold()
    encoded_argument = re.search(r"(?:^|\s)-(?:enc|encodedcommand)(?:\s|$)", command) is not None
    return process == "powershell.exe" and encoded_argument


def main(csv_path: str) -> int:
    with Path(csv_path).open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    required = {"case_id", "activity_label", "process", "command_line", "rationale"}
    if not rows or not required.issubset(rows[0]):
        print("CSV is empty or missing required columns: " + ", ".join(sorted(required)))
        return 2
    counts = {"TP": 0, "FP": 0, "TN": 0, "FN": 0, "AMBIGUOUS": 0}
    for row in rows:
        label = row["activity_label"].strip().casefold()
        predicted_alert = detect(row)
        print(f"{row['case_id']}: predicted_alert={predicted_alert} | label={label}")
        if label == "ambiguous":
            counts["AMBIGUOUS"] += 1
            continue
        if label not in {"benign", "suspicious"}:
            print(f"Unsupported activity_label in {row['case_id']}: {label}")
            return 2
        is_suspicious = label == "suspicious"
        if is_suspicious and predicted_alert:
            counts["TP"] += 1
        elif is_suspicious:
            counts["FN"] += 1
        elif predicted_alert:
            counts["FP"] += 1
        else:
            counts["TN"] += 1
    tp, fp, tn, fn = (counts[key] for key in ("TP", "FP", "TN", "FN"))
    def div(numerator: int, denominator: int) -> float:
        return numerator / denominator if denominator else 0.0
    precision = div(tp, tp + fp)
    recall = div(tp, tp + fn)
    total = tp + fp + tn + fn
    specificity = div(tn, tn + fp)
    f1 = div(2 * precision * recall, precision + recall)
    print(f"\nScored cases: {total}; ambiguous excluded: {counts['AMBIGUOUS']}")
    print(f"TP={tp} FP={fp} TN={tn} FN={fn}")
    print(f"Accuracy: {div(tp + tn, total):.3f}; Precision: {precision:.3f}; Recall: {recall:.3f}; Specificity: {specificity:.3f}; F1: {f1:.3f}")
    print("Synthetic teaching data only; these metrics are not real-world performance estimates.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python evaluate-detection-cases.py detection-evaluation-cases.csv")
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1]))
