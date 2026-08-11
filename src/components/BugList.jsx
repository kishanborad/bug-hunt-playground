import DomThumbnail from './DomThumbnail';

const severityStyle = {
  critical: 'bg-bh-critical/20 text-bh-critical',
  major: 'bg-bh-major/20 text-bh-major',
  minor: 'bg-bh-minor/20 text-bh-minor',
};

const probeLabel = {
  visual: 'Visual',
  functional: 'Functional',
  accessibility: 'A11y',
};

export default function BugList({ results, scenario, iframeRef, onBugClick, scanComplete }) {
  const getBug = (bugId) => scenario.bugs.find((b) => b.id === bugId);

  return (
    <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
      {scanComplete && (
        <div className="bg-bh-found/10 border border-bh-found/30 rounded-lg px-3 py-2 text-sm text-bh-found font-medium animate-banner-slide">
          Scan complete — {results.length} bug{results.length !== 1 ? 's' : ''} detected
        </div>
      )}

      {results.length === 0 && !scanComplete && (
        <p className="text-bh-muted text-sm mt-2">Waiting for probe results...</p>
      )}

      {results.map((result) => {
        const bug = getBug(result.bugId);
        if (!bug) return null;

        return (
          <button
            key={result.bugId}
            type="button"
            onClick={() => onBugClick(bug, result)}
            className="text-left bg-bh-surface border border-bh-border rounded-lg p-3
              hover:border-bh-borderHover transition-colors animate-slide-up cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${severityStyle[bug.severity]}`}>
                {bug.severity}
              </span>
              <span className="text-sm text-bh-text font-medium flex-1 truncate">{bug.title}</span>
              <span className="text-[10px] text-bh-muted">{probeLabel[result.probe]}</span>
            </div>
            <DomThumbnail iframeRef={iframeRef} selector={bug.selector} />
          </button>
        );
      })}

      {scanComplete && (
        <div className="mt-auto pt-3">
          {/* The Continue to Report button is rendered by PlaygroundView, not here */}
        </div>
      )}
    </div>
  );
}
