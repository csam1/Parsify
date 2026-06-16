import { useCallback, useRef, useState } from 'react';

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function DropZone({ onFile, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') onFile(file);
    },
    [onFile, disabled]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4
        rounded-2xl border-2 border-dashed p-16 cursor-pointer
        transition-all duration-200 select-none
        ${dragging
          ? 'border-violet-500 bg-violet-50 scale-[1.01]'
          : 'border-zinc-200 bg-zinc-50 hover:border-violet-400 hover:bg-violet-50/40'
        }
        ${disabled ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
        dragging ? 'bg-violet-100' : 'bg-white border border-zinc-200'
      }`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={dragging ? 'text-violet-600' : 'text-zinc-400'}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-zinc-700">
          {dragging ? 'Drop your PDF here' : 'Drop a PDF here, or click to browse'}
        </p>
        <p className="text-xs text-zinc-400 mt-1">Native text-layer PDFs only · No OCR</p>
      </div>
    </div>
  );
}
