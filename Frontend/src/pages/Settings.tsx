import { useState } from 'react';

const STORAGE_KEY = 'parsify_settings';

interface AppSettings {
  apiBase: string;
  defaultFormat: 'json' | 'markdown';
  defaultLLMEnhance: boolean;
}

function loadSettings(): AppSettings {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {} as AppSettings;
  }
}

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    apiBase: 'http://localhost:8000',
    defaultFormat: 'json',
    defaultLLMEnhance: false,
    ...loadSettings(),
  });

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Preferences are stored in your browser.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
        {/* API base */}
        <div className="p-5">
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Backend URL
          </label>
          <p className="text-xs text-zinc-500 mb-3">
            Where your FastAPI backend is running.
          </p>
          <input
            type="text"
            value={settings.apiBase}
            onChange={(e) => setSettings({ ...settings, apiBase: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono text-zinc-800 bg-zinc-50 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors"
            placeholder="http://localhost:8000"
          />
        </div>

        {/* Default format */}
        <div className="p-5">
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Default output format
          </label>
          <div className="flex gap-2">
            {(['json', 'markdown'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSettings({ ...settings, defaultFormat: fmt })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                  settings.defaultFormat === fmt
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {fmt === 'json' ? 'JSON' : 'Markdown'}
              </button>
            ))}
          </div>
        </div>

        {/* Default LLM enhance */}
        <div
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
          onClick={() => setSettings({ ...settings, defaultLLMEnhance: !settings.defaultLLMEnhance })}
        >
          <div>
            <p className="text-sm font-semibold text-zinc-700">LLM Enhance by default</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Auto-enable the cleanup pass for every new conversion.
            </p>
          </div>
          <div className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${
            settings.defaultLLMEnhance ? 'bg-violet-600' : 'bg-zinc-200'
          }`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
              settings.defaultLLMEnhance ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
            }`} />
          </div>
        </div>
      </div>

      <button
        onClick={save}
        className={`mt-5 w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm ${
          saved
            ? 'bg-emerald-600 text-white'
            : 'bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.99]'
        }`}
      >
        {saved ? '✓ Saved' : 'Save Settings'}
      </button>
    </div>
  );
}
