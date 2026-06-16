import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DropZone from '../components/DropZone';
import ConversionOptions from '../components/ConversionOptions';
import FilePreview from '../components/FilePreview';
import ProgressBar from '../components/ProgressBar';
import { convertPDF } from '../api/convert';
import { useHistory } from '../hooks/useHistory';
import type { ConversionOptions as IConversionOptions } from '../types';
import { UploadStatus } from '../types';

export default function Upload() {
  const navigate = useNavigate();
  const { addEntry } = useHistory();

  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<IConversionOptions>({
    output_format: 'json',
    llm_enhance: false,
  });
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.Idle);
  const [progress, setProgress] = useState(0);

  const busy = status === UploadStatus.Uploading || status === UploadStatus.Processing;

  function handleFile(f: File) {
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.');
      return;
    }
    setFile(f);
    setStatus(UploadStatus.Idle);
  }

  async function handleConvert() {
    if (!file) return;
    setStatus(UploadStatus.Uploading);
    setProgress(0);

    try {
      const result = await convertPDF(file, options, (pct) => {
        setProgress(pct);
        if (pct === 100) setStatus(UploadStatus.Processing);
      });

      const entry = addEntry({
        filename: file.name,
        format: options.output_format,
        llm_enhance: options.llm_enhance,
        token_count_before: result.token_count_before,
        token_count_after: result.token_count_after,
        savings_percent: result.savings_percent,
        result,
      });

      navigate(`/result/${entry.id}`);
    } catch (err: unknown) {
      setStatus(UploadStatus.Error);
      const msg = err instanceof Error ? err.message : 'Conversion failed. Is the backend running?';
      toast.error(msg);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 w-full">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          Native PDF only · No OCR
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
          PDF → Clean JSON or Markdown
        </h1>
        <p className="text-zinc-500 mt-3 text-base">
          Strip headers, footers, and boilerplate. Cut LLM token usage by up to 80%.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 flex flex-col gap-7">
        <DropZone onFile={handleFile} disabled={busy} />

        {file && (
          <FilePreview
            file={file}
            disabled={busy}
            onRemove={() => { setFile(null); setStatus(UploadStatus.Idle); }}
          />
        )}

        <div className="border-t border-zinc-100 pt-2">
          <ConversionOptions options={options} onChange={setOptions} disabled={busy} />
        </div>

        {busy && (
          <ProgressBar
            status={status as UploadStatus.Uploading | UploadStatus.Processing}
            progress={progress}
          />
        )}

        <button
          onClick={handleConvert}
          disabled={!file || busy}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
            !file || busy
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              : 'bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.99] shadow-sm cursor-pointer'
          }`}
        >
          {busy ? 'Converting…' : 'Convert PDF'}
        </button>
      </div>
    </div>
  );
}
