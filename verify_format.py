#!/usr/bin/env python

"""
Returns 0 on success, 1 otherwise
"""

import sys
import csv

QUIET = False

if len(sys.argv) < 2:
  print(f"Usage: {sys.argv[0]} [CSV file]")
  sys.exit(1)

if len(sys.argv) > 2 and sys.argv[2] in ["q", "-q", "quiet", "--quiet"]:
  QUIET = True

csv_filepath = sys.argv[1]
with open(csv_filepath, "rt", newline="") as csvfile:
  reader = csv.DictReader(csvfile, restkey="rest")
  for row in reader:
    if not QUIET:
      print(row)
    assert row["Console"] in ["ALL", "XOP", "XOS", "XOX", "XSS", "XSX"]
    assert row["Type"] in ["SMC", "SP", "CPU", "OS"]
    assert row["Code"].startswith("0x")
    assert "rest" not in row, "Row was parsed incorrectly, is the description quoted properly?"
