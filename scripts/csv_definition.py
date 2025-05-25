from dataclasses import dataclass

@dataclass
class PostCodeDefinition:
    Console: str
    Type: str
    Code: int
    IsError: bool
    Name: str
    Description: str

    @classmethod
    def validate(cls, row: dict):
        assert row["Console"] in ["ALL", "XOP", "XOS", "XOX", "XSS", "XSX"]
        assert row["Type"] in ["SMC", "SP", "CPU", "OS"]
        assert row["Code"].startswith("0x")
        assert row["IsError"] in ["0","1"]
        assert int(row["Code"], 16) is not None
        assert "Name" in row
        assert "Description" in row
        assert "rest" not in row, "Row was parsed incorrectly, is the description quoted properly?"
        return cls(
            Console=row["Console"],
            Type=row["Type"],
            Code=int(row["Code"], 16),
            IsError=True if row["IsError"] == "1" else False,
            Name=row["Name"],
            Description=row["Description"] 
        )

@dataclass
class ErrorMaskDefinition:
    Console: str
    Type: str
    Bitmask: int
    Name: str
    Description: str

    @classmethod
    def validate(cls, row: dict):
        assert row["Console"] in ["ALL", "XOP", "XOS", "XOX", "XSS", "XSX"]
        assert row["Type"] in ["SMC", "SP", "CPU", "OS"]
        assert row["Bitmask"].startswith("0x")
        assert int(row["Bitmask"], 16) is not None
        assert "Name" in row
        assert "Description" in row
        assert "rest" not in row, "Row was parsed incorrectly, is the description quoted properly?"
        return cls(
            Console=row["Console"],
            Type=row["Type"],
            Bitmask=int(row["Bitmask"], 16),
            Name=row["Name"],
            Description=row["Description"] 
        )


@dataclass
class OSErrorDefinition:
    Console: str
    Type: str
    Code: int
    Name: str
    Description: str

    @classmethod
    def validate(cls, row: dict):
        assert row["Console"] in ["ALL", "XOP", "XOS", "XOX", "XSS", "XSX"]
        assert row["Type"] in ["SMC", "SP", "CPU", "OS"]
        assert row["Code"].startswith("0x")
        assert int(row["Code"], 16) is not None
        assert "Name" in row
        assert "Description" in row
        assert "rest" not in row, "Row was parsed incorrectly, is the description quoted properly?"
        return cls(
            Console=row["Console"],
            Type=row["Type"],
            Code=int(row["Code"], 16),
            Name=row["Name"],
            Description=row["Description"] 
        )
