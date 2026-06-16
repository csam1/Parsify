import { useState } from 'react';
import type { ConversionResult } from '../types';

interface Props {
  result: ConversionResult;
  rawText: string;
}

export default function DiffViewer({ result, rawText }: Props) {
  const [copied, setCopied] = useState(false);

  const cleanOutput =
    result.format === 'json'
      ? JSON.stringify(result.content, null, 2)
      : sectionsToMarkdown(result);

  function copy() {
    navigator.clipboard.writeText(cleanOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-[560px]">
      {/* Raw panel */}
      <div className="flex flex-col rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Raw PDF text</span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">{countTokensEstimate(rawText).toLocaleString()} tok</span>
        </div>
        <pre className="flex-1 overflow-auto p-4 text-xs text-zinc-500 font-mono leading-relaxed whitespace-pre-wrap break-words bg-white">
          {rawText || '(no raw preview available)'}
        </pre>
      </div>

      {/* Clean panel */}
      <div className="flex flex-col rounded-2xl border border-violet-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-200 bg-violet-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">
              Clean · {result.format.toUpperCase()}
            </span>
          </div>
          <button
            onClick={copy}
            className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors cursor-pointer"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre className="flex-1 overflow-auto p-4 text-xs text-zinc-800 font-mono leading-relaxed whitespace-pre-wrap break-words bg-white">
          {cleanOutput}
        </pre>
      </div>
    </div>
  );
}

function sectionsToMarkdown(result: ConversionResult): string {
  const { content } = result;
  const lines: string[] = [`# ${content.title}`, ''];

  if (Object.keys(content.metadata).length) {
    for (const [k, v] of Object.entries(content.metadata)) {
      lines.push(`**${k}:** ${v}`);
    }
    lines.push('');
  }

  function renderSection(s: typeof content.sections[number], depth = 0): void {
    const prefix = '#'.repeat(Math.min(s.level + 1, 6));
    lines.push(`${prefix} ${s.title}`, '');
    if (s.content) lines.push(s.content, '');
    s.subsections?.forEach((sub) => renderSection(sub, depth + 1));
  }

  content.sections.forEach((s) => renderSection(s));

  if (content.tables.length) {
    lines.push('## Tables', '');
    for (const t of content.tables) {
      lines.push(`| ${t.headers.join(' | ')} |`);
      lines.push(`| ${t.headers.map(() => '---').join(' | ')} |`);
      for (const row of t.rows) {
        lines.push(`| ${row.join(' | ')} |`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function countTokensEstimate(text: string): number {
  return Math.round(text.length / 4);
}
