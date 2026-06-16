import { UploadStatus } from '../types';

interface ProgressBarProps {
  status: UploadStatus.Uploading | UploadStatus.Processing;
  progress: number;
}

export default function ProgressBar({ status, progress }: ProgressBarProps) {
  const width = status === UploadStatus.Processing ? '100%' : `${progress}%`;
  const label = status === UploadStatus.Uploading ? `Uploading… ${progress}%` : 'Processing document…';

  return (
    <div className="space-y-1.5">
      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-300"
          style={{ width }}
        />
      </div>
      <p className="text-xs text-zinc-400 text-center">{label}</p>
    </div>
  );
}
