import { allScenarios } from '../scenarios';
import type { Scenario } from '../types';

interface Props {
  onSelect: (scenarioId: string) => void;
}

const difficultyColor: Record<string, string> = {
  easy: 'text-bh-found',
  medium: 'text-bh-major',
  hard: 'text-bh-critical',
};

export default function ScenarioPicker({ onSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-2">Bug Hunt</h1>
      <p className="text-bh-secondary mb-8 text-center max-w-lg">
        Pick a scenario, hunt for bugs by hand, then release automated probes
        and see what you missed.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        {allScenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  onSelect,
}: {
  scenario: Scenario;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(scenario.id)}
      className="text-left bg-bh-surface backdrop-blur-glass border border-bh-border
        rounded-xl p-5 transition-all duration-200 hover:border-bh-borderHover
        hover:shadow-glow hover:scale-[1.02] focus:outline-none focus:ring-2
        focus:ring-bh-accent/50"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{scenario.title}</h2>
        <span
          className={`text-xs font-medium uppercase tracking-wide ${difficultyColor[scenario.difficulty]}`}
        >
          {scenario.difficulty}
        </span>
      </div>
      <p className="text-bh-secondary text-sm mb-3">{scenario.theme}</p>
      <div className="flex items-center gap-3 text-xs text-bh-muted">
        <span>{scenario.pages.length} pages</span>
        <span>&middot;</span>
        <span>{scenario.bugs.length} bugs to find</span>
      </div>
    </button>
  );
}
