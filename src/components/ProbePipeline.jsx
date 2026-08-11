const stages = ['visual', 'functional', 'accessibility'];
const stageLabels = {
  visual: 'Visual',
  functional: 'Functional',
  accessibility: 'Accessibility',
};

export default function ProbePipeline({ currentPhase, currentPage, totalPages }) {
  return (
    <div className="bg-bh-surface backdrop-blur-glass border border-bh-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {stages.map((stage, i) => {
          const stageIndex = stages.indexOf(stage);
          const currentIndex = currentPhase === 'done' ? 3 : stages.indexOf(currentPhase);
          const isDone = stageIndex < currentIndex || currentPhase === 'done';
          const isCurrent = stage === currentPhase;

          return (
            <div key={stage} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1.5 flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isDone ? 'bg-bh-found text-white' : isCurrent ? 'bg-bh-accent text-white animate-pulse' : 'bg-bh-muted/30 text-bh-muted'}`}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`text-xs ${isCurrent ? 'text-bh-accent font-medium' : isDone ? 'text-bh-found' : 'text-bh-muted'}`}>
                  {stageLabels[stage]}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div className={`h-px flex-1 ${isDone ? 'bg-bh-found' : 'bg-bh-border'}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-bh-secondary">
        Scanning: {currentPage} ({totalPages})
      </div>
    </div>
  );
}
