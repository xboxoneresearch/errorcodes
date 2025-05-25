#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["pydantic==2.11.5"]
# ///
"""
Returns 0 on success, 1 otherwise
"""

import sys
import csv
from meta_definition import MetaDefinition, MetaType, validate_definition
from csv_definition import PostCodeDefinition, ErrorMaskDefinition, OSErrorDefinition

VALIDATORS = {
  MetaType.PostCodes: PostCodeDefinition.validate,
  MetaType.ErrorMasks: ErrorMaskDefinition.validate,
  MetaType.OSErrors: OSErrorDefinition.validate,
}

if len(sys.argv) < 2:
  print(f"Usage: {sys.argv[0]} [meta.json]")
  sys.exit(1)

meta_json_filepath = sys.argv[1]
with open(meta_json_filepath, "rt") as f:
  data = f.read()
  meta = MetaDefinition.model_validate_json(data)

print(f"Validating {meta_json_filepath}...")
try:
  validate_definition(meta)
except Exception as exc:
  print(f"Failed to validate basic structure of MetaDefitinion, error: {exc}")
  sys.exit(1)

for entry in meta.items:
  print(f"Checking file {entry.path=}, {entry.metaType=}")

  validator = VALIDATORS.get(entry.metaType)
  if not validator:
    print(f"No validator found for {entry.metaType}")
    sys.exit(1)

  with open(entry.path, "rt", newline="") as f:
    reader = csv.DictReader(f, restkey="rest")
    for row in reader:
      res = validator(row)
      print(res)