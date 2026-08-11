import { useCallback, useEffect, useRef, useState } from 'react';
import { getScenario } from '../scenarios';
import type { Pin, ProbeResult, ScenarioPage } from '../types';
import { runAllProbes } from '../engine/runAllProbes';
import type { ProbeProgress as ProgressType } from '../engine/runAllProbes';
import ProbeProgress from './ProbeProgress';

interface Props {
  scenarioId: string;
  pins: Pin[];
  onComplete: (results: ProbeResult[]) => void;
  onBack: () => void;
}

export default function ProbeView({ scenarioId, pins: _pins, onComplete, onBack }: Props) {
  const scenario = getScenario(scenarioId)!;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentPage, setCurrentPage] = useState<ScenarioPage>(scenario.pages[0]);
  const [phase, setPhase] = useState<ProgressType['phase']>('visual');
  const [pageIndex, setPageIndex] = useState(0);
  const [allResults, setAllResults] = useState<ProbeResult[]>([]);
  const base = import.meta.env.BASE_URL;

  const runProbesForPage = useCallback(async (page: ScenarioPage, index: number) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const pageBugs = scenario.bugs.filter((b) => b.page === page.id);
    const pageResults = await runAllProbes(
      iframe.contentDocument,
      pageBugs,
      (progress) => {
        setPhase(progress.phase);
      },
    );

    setAllResults((prev) => {
      const updated = [...prev, ...pageResults];
      const nextIndex = index + 1;
      if (nextIndex < scenario.pages.length) {
        setPageIndex(nextIndex);
        setCurrentPage(scenario.pages[nextIndex]);
      } else {
        onComplete(updated);
      }
      return updated;
    });
  }, [scenario, onComplete]);

  const handleIframeLoad = useCallback(() => {
    runProbesForPage(currentPage, pageIndex);
  }, [runProbesForPage, currentPage, pageIndex]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = `${base}scenarios/${scenario.id}/${currentPage.file}`;
    }
  }, [currentPage, base, scenario.id]);

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-bh-deep border-b border-bh-border">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-bh-secondary hover:text-bh-text text-sm">
            &larr; Back
          </button>
          <span className="text-bh-accent font-semibold">{scenario.title}</span>
          <span className="text-bh-muted text-sm">Phase 2: Automated Probes</span>
        </div>
        <span className="text-bh-secondary text-sm">
          Scanning: {currentPage.title} ({pageIndex + 1}/{scenario.pages.length})
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 relative bg-white">
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title={`Probing ${currentPage.title}`}
            onLoad={handleIframeLoad}
          />
        </main>

        <aside className="w-72 bg-bh-deep border-l border-bh-border p-4 overflow-y-auto flex flex-col gap-4">
          <ProbeProgress phase={phase} foundCount={allResults.length} />
          <div>
            <h3 className="text-xs text-bh-muted uppercase tracking-wide mb-2">Findings</h3>
            {allResults.map((r) => (
              <div
                key={r.bugId}
                className="bg-bh-surface rounded px-3 py-2 mb-2 text-sm animate-slide-up"
              >
                <span className="text-bh-accent font-medium">{r.probe}</span>
                <p className="text-bh-secondary text-xs mt-1">{r.details}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
