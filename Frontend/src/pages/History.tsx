import { Link } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';

export default function History() {
  const { history, clearHistory, removeEntry } = useHistory();

  if (!history.length) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-zinc-400">
            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <p className="text-zinc-500 text-sm mb-4">No conversions yet.</p>
        <Link to="/" className="text-violet-600 text-sm font-medium hover:underline">
          Convert your first PDF →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">History</h1>
          <p className="text-sm text-zinc-500 mt-1">{history.length} conversion{history.length !== 1 ? 's' : ''} · stored locally</p>
        </div>
        <button
          onClick={clearHistory}
          className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-600 border border-zinc-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-4 bg-white rounded-2xl border border-zinc-200 px-5 py-4 hover:border-zinc-300 transition-all group"
          >
            {/* File icon */}
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-violet-600">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-800 truncate">{entry.filename}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{new Date(entry.timestamp).toLocaleString()}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-xs font-semibold uppercase tracking-wider">
                {entry.format}
              </span>
              {entry.llm_enhance && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-semibold">
                  LLM
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-semibold">
                −{entry.savings_percent.toFixed(0)}%
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                to={`/result/${entry.id}`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600 hover:bg-violet-50 transition-colors no-underline"
              >
                View
              </Link>
              <button
                onClick={() => removeEntry(entry.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
