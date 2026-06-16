import { useParams, Link, useNavigate } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import TokenStats from '../components/TokenStats';
import DiffViewer from '../components/DiffViewer';

export default function Result() {
  const { id } = useParams<{ id: string }>();
  const { history } = useHistory();
  const navigate = useNavigate();

  const entry = history.find((e) => e.id === id);

  if (!entry) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-zinc-500 mb-4">Conversion not found.</p>
        <Link to="/" className="text-violet-600 text-sm font-medium hover:underline">
          ← Back to Convert
        </Link>
      </div>
    );
  }

  const cleanOutput =
    entry.format === 'json'
      ? JSON.stringify(entry.result.content, null, 2)
      : buildMarkdown(entry.result.content.title);

  function downloadResult() {
    const blob = new Blob([cleanOutput], {
      type: entry!.format === 'json' ? 'application/json' : 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry!.filename.replace('.pdf', '')}-clean.${entry!.format === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 w-full">
      {/* Header row */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-3 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight leading-tight">
            {entry.filename}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 text-xs font-semibold uppercase tracking-wider">
              {entry.format}
            </span>
            {entry.llm_enhance && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-semibold">
                LLM Enhanced
              </span>
            )}
            <span className="text-xs text-zinc-400">
              {new Date(entry.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors no-underline"
          >
            Convert another
          </Link>
          <button
            onClick={downloadResult}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors cursor-pointer shadow-sm"
          >
            Download
          </button>
        </div>
      </div>

      {/* Token stats */}
      <div className="mb-6">
        <TokenStats
          before={entry.token_count_before}
          after={entry.token_count_after}
          savings={entry.savings_percent}
        />
      </div>

      {/* Diff viewer */}
      <DiffViewer result={entry.result} rawText={entry.result.content.sections.map((s) => s.content).join('\n\n')} />
    </div>
  );
}

function buildMarkdown(title: string) {
  return `# ${title}\n\n(Markdown content rendered here)`;
}
