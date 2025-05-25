#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["pydantic==2.11.5"]
# ///
import sys
import argparse
import hashlib
from datetime import datetime, UTC
from typing import List
from pathlib import Path
from meta_definition import (
    MetaDefinition,
    MetaEntry,
    MetaType,
    META_FORMAT_VERSION
)

def create_new(dt: datetime, meta_entries: List[MetaEntry]):
    return MetaDefinition(
        formatVersion=META_FORMAT_VERSION,
        updated=dt,
        items=meta_entries
    )

def hash_file(path: str) -> bytes:
        with open(path, "rb") as f:
            csv_data = f.read()
        return hashlib.sha256(csv_data).digest()

def create_meta_entry(filename: str, mtype: MetaType):
    return MetaEntry(
        metaType=mtype,
        path=filename,
        hash=hash_file(filename)
    )

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("destination_file", type=Path, help="Where to output meta.json")
    parser.add_argument("--postcodes", action="append", help="Filename of postcode csv (has to be in current dir)", required=False)
    parser.add_argument("--errormasks", action="append", help="Filename of errormasks csv (has to be in current dir)", required=False)
    parser.add_argument("--oserrors", action="append", help="Filename of OSErrors csv (has to be in current dir)", required=False)
    args = parser.parse_args()

    dt = datetime.now(UTC)
    entries = []
    if args.postcodes:
        for pc_file in args.postcodes:
            entries.append(create_meta_entry(pc_file, MetaType.PostCodes))
    if args.errormasks:
        for em_file in args.errormasks:
            entries.append(create_meta_entry(em_file, MetaType.ErrorMasks))
    if args.oserrors:
        for oe_file in args.oserrors:
            entries.append(create_meta_entry(oe_file, MetaType.OSErrors))

    if len(entries) == 0:
        print("! No meta files (postcodes, errormasks, oserrors) enumerated.\nCheck '--help' to see script usage")
        sys.exit(1)

    metaObj = create_new(dt, entries)
    with open(args.destination_file, "wt") as f:
        res = metaObj.model_dump_json(indent=2)
        f.write(res)

if __name__ == "__main__":
    main()