#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["pydantic==2.11.5"]
# ///
import sys
from enum import StrEnum
from datetime import datetime
from pydantic import BaseModel, field_serializer
from typing import List

META_FORMAT_VERSION = 1


class MetaType(StrEnum):
    PostCodes = "PostCodes"
    OSErrors = "OSErrors"
    ErrorMasks = "ErrorMasks"

class MetaEntry(BaseModel, ser_json_bytes="base64", val_json_bytes='base64'):
    metaType: MetaType
    path: str
    hash: bytes

class MetaDefinition(BaseModel):
    formatVersion: int
    updated: datetime
    items: List[MetaEntry]

    @field_serializer('updated', when_used='json')
    def serialize_datetime(self, updated: datetime):
        return updated.isoformat()

def validate_definition(definition: MetaDefinition):
    # Pydantic does validate it partially for us.. but let's be extra sure :P
    assert definition is not None
    assert definition.formatVersion == META_FORMAT_VERSION, (
        "Invalid formatVerison, expected: {META_FORMAT_VERSION}, got {definition.formatVersion}"
    )
    assert isinstance(definition.updated, datetime)
    assert len(definition.items) > 0, (
        "Invalid items, expected at least one entry"
    )
    for e in definition.items:
        assert isinstance(e.metaType, MetaType)
        assert len(e.path) > 0
        assert len(e.hash) == 32
        assert isinstance(e.hash, bytes)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} [meta.json]")
        sys.exit(1)
    
    filepath = sys.argv[1]
    with open(filepath, "rt") as f:
        data = f.read()
        res = MetaDefinition.model_validate_json(data)


    