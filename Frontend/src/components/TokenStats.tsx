interface Props {
  before: number;
  after: number;
  savings: number;
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function TokenStats({ before, after, savings }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard label="Before" value={fmt(before)} sub="tokens" dim />
      <StatCard label="After" value={fmt(after)} sub="tokens" />
      <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Saved</span>
        <span className="text-4xl font-bold text-emerald-600 leading-none">
          {savings.toFixed(0)}%
        </span>
        <span className="text-xs text-emerald-600/70 mt-1">
          {fmt(before - after)} tokens freed
        </span>
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, dim,
}: {
  label: string; value: string; sub: string; dim?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border p-5 text-center ${dim ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-200'}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">{label}</span>
      <span className={`text-4xl font-bold leading-none ${dim ? 'text-zinc-400' : 'text-zinc-900'}`}>{value}</span>
      <span className="text-xs text-zinc-400 mt-1">{sub}</span>
    </div>
  );
}
