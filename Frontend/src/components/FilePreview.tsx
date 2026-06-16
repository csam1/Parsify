import FileIcon from '../assets/FileIcon';
import CloseIcon from '../assets/CloseIcon';

interface FilePreviewProps {
  file: File;
  disabled: boolean;
  onRemove: () => void;
}

export default function FilePreview({ file, disabled, onRemove }: FilePreviewProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200">
      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
        <FileIcon className="text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-800 truncate">{file.name}</p>
        <p className="text-xs text-zinc-400">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <button
        onClick={onRemove}
        className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
        disabled={disabled}
      >
        <CloseIcon />
      </button>
    </div>
  );
}
