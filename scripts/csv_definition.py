from dataclasses import dataclass
from typing import List

ALL_CONSOLE_TYPES = ["ALL", "XOP", "XOS", "XOX", "XSS", "XSX"]
ALL_CODE_TYPES = ["SMC", "SP", "CPU", "OS"]

def split_console_column(column: str) -> List[str] | str:
    res = None
    if "," in column:
        consoles = column.split(",")
        res = [c.strip() for c in consoles]
    else:
        res = column
    return res

def verify_console(console: List[str] | str) -> bool:
    if isinstance(console, list):
        assert len(console) == len(set(console))
        assert set(console).issubset(ALL_CONSOLE_TYPES)
    elif isinstance(console, str):
        assert console in ALL_CONSOLE_TYPES
    else:
        raise Exception(f"Invalid console column: {console=} {type(console)=}")
    return True

@dataclass
class PostCodeDefinition:
    Console: List[str] | str
    Type: str
    Code: int
    Bitmask: int | None
    IsError: bool
    Name: str
    Description: str

    @classmethod
    def validate(cls, row: dict):
        console = split_console_column(row["Console"])
        assert verify_console(console)
        assert row["Type"] in ALL_CODE_TYPES
        assert row["Code"].startswith("0x")
        assert row["IsError"] in ["0","1"]
        assert int(row["Code"], 16) is not None
        assert "Bitmask" in row
        assert "Name" in row
        assert "Description" in row
        assert "rest" not in row, "Row was parsed incorrectly, is the description quoted properly?"
        return cls(
            Console=console,
            Type=row["Type"],
            Code=int(row["Code"], 16),
            Bitmask=(int(row["Bitmask"], 16) if row["Bitmask"] else None),
            IsError=True if row["IsError"] == "1" else False,
            Name=row["Name"],
            Description=row["Description"] 
        )

@dataclass
class ErrorMaskDefinition:
    Console: List[str] | str
    Type: str
    Bitmask: int
    Code: int
    Name: str
    Description: str

    @classmethod
    def validate(cls, row: dict):
        console = split_console_column(row["Console"])
        assert verify_console(console)
        assert row["Type"] in ALL_CODE_TYPES
        assert row["Bitmask"].startswith("0x")
        assert int(row["Bitmask"], 16) is not None
        assert int(row["Code"], 16) is not None
        assert "Name" in row
        assert "Description" in row
        assert "rest" not in row, "Row was parsed incorrectly, is the description quoted properly?"
        return cls(
            Console=console,
            Type=row["Type"],
            Bitmask=int(row["Bitmask"], 16),
            Code=int(row["Code"], 16),
            Name=row["Name"],
            Description=row["Description"] 
        )


@dataclass
class OSErrorDefinition:
    Console: List[str] | str
    Type: str
    Code: int
    Name: str
    Description: str

    @classmethod
    def validate(cls, row: dict):
        console = split_console_column(row["Console"])
        assert verify_console(console)
        assert row["Type"] in ALL_CODE_TYPES
        assert row["Code"].startswith("0x")
        assert int(row["Code"], 16) is not None
        assert "Name" in row
        assert "Description" in row
        assert "rest" not in row, "Row was parsed incorrectly, is the description quoted properly?"
        return cls(
            Console=console,
            Type=row["Type"],
            Code=int(row["Code"], 16),
            Name=row["Name"],
            Description=row["Description"] 
        )
