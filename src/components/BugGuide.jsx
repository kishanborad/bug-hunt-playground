const categoryLabels = {
  visual: 'Visual',
  functional: 'Functional',
  accessibility: 'Accessibility',
};

const categoryIcons = {
  visual: '👁',
  functional: '⚙',
  accessibility: '♿',
};

export default function BugGuide({ scenario, onStart, isPanel }) {
  const hintsByCategory = {};
  for (const bug of scenario.bugs) {
    if (!hintsByCategory[bug.category]) {
      hintsByCategory[bug.category] = new Set();
    }
    hintsByCategory[bug.category].add(bug.guideHint);
  }

  const content = (
    <div className="flex flex-col gap-4">
      <p className="text-bh-secondary text-sm">{scenario.guideIntro}</p>
      {['visual', 'functional', 'accessibility'].map((cat) => {
        const hints = hintsByCategory[cat];
        if (!hints || hints.size === 0) return null;
        return (
          <div key={cat}>
            <h4 className="text-xs uppercase tracking-wide text-bh-muted mb-2">
              {categoryIcons[cat]} {categoryLabels[cat]}
            </h4>
            <ul className="space-y-1">
              {[...hints].map((hint, i) => (
                <li key={i} className="text-sm text-bh-text pl-3 border-l-2 border-bh-border">
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );

  if (isPanel) {
    return (
      <aside className="w-64 bg-bh-deep border-r border-bh-border p-4 overflow-y-auto flex flex-col">
        <h3 className="text-sm font-semibold text-bh-accent mb-3">Bug Guide</h3>
        {content}
      </aside>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bh-deep border border-bh-border rounded-xl p-6 max-w-md w-full mx-4 animate-fade-in">
        <h2 className="text-lg font-bold mb-1">{scenario.title}</h2>
        <p className="text-bh-muted text-xs mb-4">Here's what to look for</p>
        {content}
        <button
          type="button"
          onClick={onStart}
          className="mt-5 w-full py-2 bg-bh-accentDim text-white rounded-lg text-sm font-medium
            hover:bg-bh-accent transition-colors"
        >
          Start hunting
        </button>
      </div>
    </div>
  );
}
