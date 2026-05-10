export function BrandWordmark({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className={compact ? "inline-flex items-end gap-0.5" : "inline-flex items-end gap-1"}>
      <span
        className={
          compact
            ? "text-[2.15rem] font-semibold leading-none tracking-[-0.06em] text-[var(--ink-900)]"
            : "text-[2.6rem] font-semibold leading-none tracking-[-0.065em] text-[var(--ink-900)] sm:text-[3.2rem]"
        }
      >
        Invo
      </span>
      <span
        className={
          compact
            ? "bg-[linear-gradient(135deg,var(--brand-600),var(--violet-500))] bg-clip-text text-[2.25rem] font-bold leading-none tracking-[-0.08em] text-transparent"
            : "bg-[linear-gradient(135deg,var(--brand-600),var(--violet-500))] bg-clip-text text-[2.8rem] font-bold leading-none tracking-[-0.08em] text-transparent sm:text-[3.45rem]"
        }
      >
        X
      </span>
    </div>
  );
}
