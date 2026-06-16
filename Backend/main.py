import logging
import os
import tempfile
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logging.getLogger("extractor").setLevel(logging.DEBUG)

from schemas import ConversionResult, DocumentSchema, SectionSchema
from extractor import extract
from token_counter import count_tokens, savings_percent
# import cleaner

app = FastAPI(title="Parsify")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


def _document_to_text(doc: DocumentSchema) -> str:
    parts: list[str] = [doc.title]
    for section in doc.sections:
        parts.append(section.title)
        parts.append(section.content)
    for table in doc.tables:
        parts.append(" ".join(table.headers))
        for row in table.rows:
            parts.append(" ".join(row))
    return "\n".join(parts)


def _markdown_from_document(doc: DocumentSchema) -> str:
    lines: list[str] = [f"# {doc.title}", ""]
    for section in doc.sections:
        prefix = "#" * min(section.level + 1, 6)
        if section.title:
            lines.append(f"{prefix} {section.title}")
        if section.content:
            lines.append(section.content)
        lines.append("")
    for i, table in enumerate(doc.tables, 1):
        lines.append(f"**Table {i}**")
        lines.append("| " + " | ".join(table.headers) + " |")
        lines.append("| " + " | ".join(["---"] * len(table.headers)) + " |")
        for row in table.rows:
            lines.append("| " + " | ".join(row) + " |")
        lines.append("")
    return "\n".join(lines)


# def _apply_llm_cleanup(doc: DocumentSchema) -> DocumentSchema:
#     raw_text = _document_to_text(doc)
#     cleaned_md = cleaner.clean(raw_text)

#     cleaned_section = SectionSchema(level=1, title="", content=cleaned_md)
#     return DocumentSchema(
#         title=doc.title,
#         metadata=doc.metadata,
#         sections=[cleaned_section],
#         tables=doc.tables,
#     )


@app.post("/convert", response_model=ConversionResult)
async def convert(
    file: UploadFile = File(...),
    output_format: str = Form(...),
    llm_enhance: str = Form("false"),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    if output_format not in ("json", "markdown"):
        raise HTTPException(status_code=400, detail="output_format must be 'json' or 'markdown'.")

    enhance = llm_enhance.lower() == "true"

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        try:
            doc = extract(tmp_path)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        # raw_text = _document_to_text(doc)
        # token_before = count_tokens(raw_text)
        token_before = 0

        # if enhance:
        #     doc = _apply_llm_cleanup(doc)

        clean_text = _document_to_text(doc) if output_format == "json" else _markdown_from_document(doc)
        # token_after = count_tokens(clean_text)
        token_after = 0

        return ConversionResult(
            format=output_format,
            token_count_before=token_before,
            token_count_after=token_after,
            savings_percent=savings_percent(token_before, token_after),
            content=doc,
        )
    finally:
        os.unlink(tmp_path)
