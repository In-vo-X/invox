export function MiniBarChart({ values, accent }: { values: number[]; accent: string }) {
  return (
    <div className="flex h-16 items-end gap-2">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex h-full w-4 items-end rounded-full bg-[rgba(122,133,159,0.12)]">
          <div className="w-full rounded-full shadow-[0_10px_20px_rgba(114,135,255,0.18)]" style={{ height: `${Math.max(20, value)}%`, background: accent }} />
        </div>
      ))}
    </div>
  );
}
