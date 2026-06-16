from typing import Optional
from pydantic import BaseModel


class TableSchema(BaseModel):
    headers: list[str]
    rows: list[list[str]]


class SectionSchema(BaseModel):
    level: int
    title: str
    content: str
    subsections: Optional[list["SectionSchema"]] = []


class DocumentSchema(BaseModel):
    title: str
    metadata: dict
    sections: list[SectionSchema]
    tables: list[TableSchema]


class ConversionResult(BaseModel):
    format: str
    token_count_before: int
    token_count_after: int
    savings_percent: float
    content: DocumentSchema
