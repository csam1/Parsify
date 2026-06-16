# Parsify

Convert native PDFs into clean, token-optimized JSON or Markdown. Strips headers, footers, page numbers, and boilerplate before you send document content to an LLM — cutting token usage by 60–80% on average.

> Native text-layer PDFs only. No OCR.

---

## How it works

```
PDF upload → text + layout extraction → structure detection → (optional) LLM cleanup → JSON or Markdown output + token stats
```

- **Rule-based extractor** (PyMuPDF + pdfplumber) does the heavy lifting — font size, bold flags, whitespace analysis
- **LLM cleanup** is an optional pass that strips boilerplate, fixes heading hierarchy, and cleans encoding artifacts
- **Token stats** are returned on every response so you know exactly how much you saved

---

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI · Python 3.11+ |
| PDF extraction | PyMuPDF (`fitz`) · pdfplumber |
| Validation | Pydantic v2 |
| Token counting | tiktoken |
| LLM cleanup (optional) | LangChain + claude-haiku / gpt-4o-mini |
| Observability | LangFuse |
| Frontend | React 19 · Vite · Tailwind CSS v4 |

---

## API

```
POST /convert
Content-Type: multipart/form-data

file          PDF file (required)
output_format "json" | "markdown"  (required)
llm_enhance   true | false          (default: false)
```

**Response**

```json
{
  "format": "json",
  "token_count_before": 12400,
  "token_count_after": 2800,
  "savings_percent": 77.4,
  "content": {
    "title": "...",
    "metadata": {},
    "sections": [{ "level": 1, "title": "...", "content": "...", "subsections": [] }],
    "tables": [{ "headers": ["..."], "rows": [["..."]] }]
  }
}
```

---

## Project structure

```
Parsify/
├── Frontend/               React frontend
│   └── src/
│       ├── api/            convertPDF() API call
│       ├── components/     DropZone, DiffViewer, TokenStats, ConversionOptions, Navbar
│       ├── hooks/          useHistory (localStorage)
│       ├── pages/          Upload, Result, History, Settings
│       └── types/          Shared TypeScript types
└── Backend/                FastAPI backend (coming next)
```

---

## Running locally

### Frontend

```bash
cd Frontend
npm install
npm run dev        # http://localhost:5173
```

Proxies `/convert` to `http://localhost:8000` automatically.

### Backend

```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000
```

---

## Frontend pages

| Route | Description |
|---|---|
| `/` | Upload a PDF, pick format, toggle LLM enhance, convert |
| `/result/:id` | Side-by-side raw vs clean output + token savings stats |
| `/history` | All past conversions (stored in localStorage) |
| `/settings` | Backend URL, default format, default LLM enhance |
