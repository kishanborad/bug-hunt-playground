function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function PlaygroundHeader({
  scenario,
  mode,
  elapsed,
  flagMode,
  pinCount,
  onToggleFlag,
  onSubmit,
  onBack,
  onToggleGuide,
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-bh-deep border-b border-bh-border">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-bh-secondary hover:text-bh-text text-sm"
        >
          &larr; Back
        </button>
        <span className="text-bh-accent font-semibold">{scenario.title}</span>
        <span className="text-bh-muted text-sm">
          {mode === 'hunt' ? 'Phase 1: Manual Hunt' : 'Phase 2: Automated Probes'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {mode === 'hunt' && (
          <>
            <span className="text-bh-secondary text-sm font-mono">{formatTime(elapsed)}</span>
            <button
              type="button"
              onClick={onToggleGuide}
              className="w-7 h-7 rounded-full bg-bh-surface border border-bh-border
                text-bh-accent text-sm font-bold hover:border-bh-borderHover transition-colors"
              title="Toggle bug guide"
            >
              ?
            </button>
            <button
              type="button"
              onClick={onToggleFlag}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                flagMode
                  ? 'bg-bh-critical/20 text-bh-critical border border-bh-critical/30'
                  : 'bg-bh-accent/20 text-bh-accent border border-bh-accent/30'
              }`}
            >
              {flagMode ? '📌 Flag mode' : '🔗 Navigate mode'}
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="px-4 py-1.5 bg-bh-accentDim text-white rounded text-sm font-medium
                hover:bg-bh-accent transition-colors"
            >
              Submit findings ({pinCount})
            </button>
          </>
        )}
      </div>
    </header>
  );
}
