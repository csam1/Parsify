import logging
import re
import fitz
import pdfplumber
from schemas import DocumentSchema, SectionSchema, TableSchema

logger = logging.getLogger(__name__)

_BOILERPLATE = re.compile(
    r"^\s*(page\s+\d+|\d+\s*/\s*\d+|confidential|all rights reserved|©|\bcopyright\b)",
    re.IGNORECASE,
)

_H1_RATIO = 1.4
_H2_RATIO = 1.2
_H3_RATIO = 1.1


def _is_boilerplate(text: str) -> bool:
    return bool(_BOILERPLATE.match(text.strip()))


def _doc_body_font_size(doc: fitz.Document) -> float:
    """Median font size across the whole document — more stable than per-page."""
    sizes: list[float] = []
    for page in doc:
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    if span["text"].strip():
                        sizes.append(span["size"])
    if not sizes:
        return 12.0
    sizes.sort()
    return sizes[len(sizes) // 2]


def _heading_level(span_size: float, body_size: float, is_bold: bool) -> int | None:
    ratio = span_size / body_size if body_size else 1

    if ratio >= _H1_RATIO:
        return 1
    if ratio >= _H2_RATIO:
        return 2
    if ratio >= _H3_RATIO:
        return 3
    # Same-size bold line with no trailing punctuation → treat as H3
    if is_bold and ratio >= 0.99 and span_size >= body_size * 0.99:
        return 3
    return None


def _extract_sections(doc: fitz.Document) -> list[SectionSchema]:
    sections: list[SectionSchema] = []
    current: SectionSchema | None = None
    body_size = _doc_body_font_size(doc)

    for page_num, page in enumerate(doc, 1):
        blocks = page.get_text("dict")["blocks"]
        logger.debug(
            "_extract_sections page %d: %d blocks, types=%s",
            page_num, len(blocks), [b.get("type") for b in blocks],
        )
        for block in blocks:
            for line in block.get("lines", []):
                spans = line.get("spans", [])
                line_text = "".join(s["text"] for s in spans).strip()
                if not line_text or _is_boilerplate(line_text):
                    continue

                active = [s for s in spans if s["text"].strip()]
                if not active:
                    continue

                max_size = max(s["size"] for s in active)
                # PyMuPDF bold flag is bit 4 (value 16) in the flags field
                is_bold = any(s.get("flags", 0) & 16 for s in active)
                level = _heading_level(max_size, body_size, is_bold)

                logger.debug(
                    "line: size=%.1f bold=%s level=%s boilerplate=%s text=%r",
                    max_size, is_bold, level, _is_boilerplate(line_text), line_text[:80],
                )

                if level is not None:
                    if current:
                        sections.append(current)
                    current = SectionSchema(level=level, title=line_text, content="")
                else:
                    if current is None:
                        current = SectionSchema(level=1, title="", content="")
                    current.content = (current.content + "\n" + line_text).strip()

    if current:
        sections.append(current)
    return sections


def _extract_tables(path: str) -> list[TableSchema]:
    tables: list[TableSchema] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            for raw in page.extract_tables():
                if not raw:
                    continue
                headers = [str(c or "").strip() for c in raw[0]]
                rows = [[str(cell or "").strip() for cell in row] for row in raw[1:]]
                tables.append(TableSchema(headers=headers, rows=rows))
    return tables


def _metadata(doc: fitz.Document, path: str) -> dict:
    meta = doc.metadata or {}
    return {
        "author": meta.get("author", ""),
        "title": meta.get("title", ""),
        "subject": meta.get("subject", ""),
        "page_count": doc.page_count,
        "file": path,
    }


def extract(path: str) -> DocumentSchema:
    doc = fitz.open(path)

    total_chars = sum(len(page.get_text()) for page in doc)
    if total_chars < 50:
        logger.warning("PDF appears to be scanned or has no usable text layer (%d chars): %s", total_chars, path)
        raise ValueError("This PDF appears to be scanned. Only native text-layer PDFs are supported.")
    logger.info("PDF has text layer — %d chars across %d pages: %s", total_chars, doc.page_count, path)

    for i, page in enumerate(doc):
        raw = page.get_text().strip()
        blocks = page.get_text("dict")["blocks"]
        text_blocks = [b for b in blocks if b.get("type") == 0]
        logger.debug(
            "Page %d: %d total blocks, %d text blocks, raw text: %r",
            i + 1, len(blocks), len(text_blocks), raw[:200],
        )
        for b in text_blocks:
            for line in b.get("lines", []):
                for span in line.get("spans", []):
                    logger.debug(
                        "  span: size=%.1f flags=%d bold=%s text=%r",
                        span["size"], span.get("flags", 0),
                        bool(span.get("flags", 0) & 16), span["text"][:80],
                    )

    sections = _extract_sections(doc)
    logger.info("Extracted %d sections", len(sections))
    tables = _extract_tables(path)
    meta = _metadata(doc, path)

    title = meta.get("title") or (sections[0].title if sections else "Untitled")

    return DocumentSchema(
        title=title,
        metadata=meta,
        sections=sections,
        tables=tables,
    )
