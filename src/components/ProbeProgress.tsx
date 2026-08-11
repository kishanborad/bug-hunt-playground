interface Props {
  phase: 'visual' | 'functional' | 'accessibility' | 'done';
  foundCount: number;
}

const phases = ['visual', 'functional', 'accessibility'] as const;
const phaseLabels: Record<string, string> = {
  visual: 'Visual checks',
  functional: 'Functional checks',
  accessibility: 'Accessibility scan (axe-core)',
  done: 'Complete',
};

export default function ProbeProgress({ phase, foundCount }: Props) {
  return (
    <div className="bg-bh-surface backdrop-blur-glass border border-bh-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-bh-secondary mb-4 uppercase tracking-wide">
        Automated Probes
      </h3>
      <div className="flex flex-col gap-3">
        {phases.map((p) => {
          const isDone = phase === 'done' || phases.indexOf(p) < phases.indexOf(phase as typeof phases[number]);
          const isCurrent = p === phase;
          return (
            <div key={p} className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  isDone
                    ? 'bg-bh-found'
                    : isCurrent
                      ? 'bg-bh-accent animate-pulse-glow'
                      : 'bg-bh-muted/30'
                }`}
              />
              <span
                className={`text-sm ${
                  isCurrent ? 'text-bh-accent font-medium' : isDone ? 'text-bh-found' : 'text-bh-muted'
                }`}
              >
                {phaseLabels[p]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-bh-border text-sm text-bh-secondary">
        Bugs detected: <span className="text-bh-accent font-semibold">{foundCount}</span>
      </div>
    </div>
  );
}
