import type { ConversionOptions } from '../types';

interface Props {
  options: ConversionOptions;
  onChange: (opts: ConversionOptions) => void;
  disabled?: boolean;
}

export default function ConversionOptions({ options, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
          Output format
        </label>
        <div className="flex gap-2">
          {(['json', 'markdown'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => onChange({ ...options, output_format: fmt })}
              disabled={disabled}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                options.output_format === fmt
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {fmt === 'json' ? 'JSON' : 'Markdown'}
            </button>
          ))}
        </div>
      </div>

      <div
        onClick={!disabled ? () => onChange({ ...options, llm_enhance: !options.llm_enhance }) : undefined}
        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
          options.llm_enhance ? 'border-violet-200 bg-violet-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div>
          <p className="text-sm font-medium text-zinc-800">LLM Enhance</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Strip boilerplate · fix headings · clean encoding artifacts
          </p>
        </div>
        <div className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${
          options.llm_enhance ? 'bg-violet-600' : 'bg-zinc-200'
        }`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
            options.llm_enhance ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
          }`} />
        </div>
      </div>
    </div>
  );
}
