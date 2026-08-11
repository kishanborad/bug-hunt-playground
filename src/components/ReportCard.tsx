import { useMemo, useState } from 'react';
import { getScenario } from '../scenarios';
import type { BugMatch, Pin, ProbeResult } from '../types';
import { buildReport } from '../engine/matcher';

interface Props {
  scenarioId: string;
  pins: Pin[];
  pinMatches: Map<string, string>;
  probeResults: ProbeResult[];
  onTryAnother: () => void;
  onReplay: () => void;
}

const severityStyle: Record<string, string> = {
  critical: 'bg-bh-critical/20 text-bh-critical',
  major: 'bg-bh-major/20 text-bh-major',
  minor: 'bg-bh-minor/20 text-bh-minor',
};

const categoryLabel: Record<string, string> = {
  visual: 'Visual',
  functional: 'Functional',
  accessibility: 'Accessibility',
};

export default function ReportCard({ scenarioId, pins: _pins, pinMatches, probeResults, onTryAnother, onReplay }: Props) {
  const scenario = getScenario(scenarioId)!;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const report = useMemo(
    () => buildReport(scenario.bugs, pinMatches, probeResults),
    [scenario, pinMatches, probeResults],
  );

  const userCount = report.filter((m) => m.foundByUser).length;
  const probeCount = report.filter((m) => m.foundByProbe).length;
  const bothCount = report.filter((m) => m.foundByUser && m.foundByProbe).length;
  const totalBugs = report.length;

  const toggleExpand = (bugId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(bugId)) next.delete(bugId);
      else next.add(bugId);
      return next;
    });
  };

  const categories = ['visual', 'functional', 'accessibility'] as const;

  return (
    <div className="min-h-screen bg-bh-bg p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Report Card</h1>
        <p className="text-bh-secondary mb-6">{scenario.title} — {scenario.theme}</p>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="You found" value={userCount} total={totalBugs} color="text-bh-critical" />
          <StatCard label="Probes found" value={probeCount} total={totalBugs} color="text-bh-accent" />
          <StatCard label="Both caught" value={bothCount} total={totalBugs} color="text-bh-found" />
        </div>

        {/* Venn summary */}
        <div className="bg-bh-surface backdrop-blur-glass border border-bh-border rounded-xl p-4 mb-8 flex gap-6 text-sm">
          <span className="text-bh-critical">Only you: {userCount - bothCount}</span>
          <span className="text-bh-accent">Only probes: {probeCount - bothCount}</span>
          <span className="text-bh-found">Both: {bothCount}</span>
          <span className="text-bh-muted">Missed: {totalBugs - new Set([...report.filter(m => m.foundByUser || m.foundByProbe).map(m => m.bug.id)]).size}</span>
        </div>

        {/* Per-category tables */}
        {categories.map((cat) => {
          const catBugs = report.filter((m) => m.bug.category === cat);
          if (catBugs.length === 0) return null;
          return (
            <section key={cat} className="mb-8">
              <h2 className="text-lg font-semibold mb-3">{categoryLabel[cat]} Bugs</h2>
              <div className="bg-bh-surface backdrop-blur-glass border border-bh-border rounded-xl overflow-hidden">
                {catBugs.map((match) => (
                  <BugRow
                    key={match.bug.id}
                    match={match}
                    isExpanded={expanded.has(match.bug.id)}
                    onToggle={() => toggleExpand(match.bug.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Actions */}
        <div className="flex gap-3 justify-center pt-4">
          <button
            type="button"
            onClick={onTryAnother}
            className="px-5 py-2 bg-bh-accentDim text-white rounded-lg text-sm font-medium hover:bg-bh-accent transition-colors"
          >
            Try another scenario
          </button>
          <button
            type="button"
            onClick={onReplay}
            className="px-5 py-2 bg-bh-surface border border-bh-border text-bh-text rounded-lg text-sm font-medium hover:border-bh-borderHover transition-colors"
          >
            Replay this scenario
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div className="bg-bh-surface backdrop-blur-glass border border-bh-border rounded-xl p-4 text-center">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-bh-secondary mt-1">{label}</div>
      <div className="text-xs text-bh-muted">of {total}</div>
    </div>
  );
}

function BugRow({ match, isExpanded, onToggle }: { match: BugMatch; isExpanded: boolean; onToggle: () => void }) {
  const { bug, foundByUser, foundByProbe } = match;
  return (
    <div className="border-b border-bh-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bh-bg/30 transition-colors"
      >
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${severityStyle[bug.severity]}`}>
          {bug.severity}
        </span>
        <span className="flex-1 text-sm">{bug.title}</span>
        <span className="text-sm">{foundByUser ? '📌' : '—'}</span>
        <span className="text-sm">{foundByProbe ? '🤖' : '—'}</span>
        <span className="text-bh-muted text-xs">{isExpanded ? '▲' : '▼'}</span>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 text-sm animate-fade-in">
          <p className="text-bh-secondary mb-2">{bug.description}</p>
          <p className="text-bh-found mb-2">
            <strong>Fix:</strong> {bug.remediation}
          </p>
          {bug.wcag && (
            <a
              href={bug.wcagUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bh-accent hover:underline text-xs"
            >
              WCAG {bug.wcag} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
