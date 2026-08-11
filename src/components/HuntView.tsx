import { useCallback, useEffect, useRef, useState } from 'react';
import { getScenario } from '../scenarios';
import type { Pin, ScenarioPage } from '../types';
import { matchUserPins } from '../engine/matcher';
import BugPin from './BugPin';

interface Props {
  scenarioId: string;
  onSubmit: (pins: Pin[], pinMatches: Map<string, string>) => void;
  onBack: () => void;
}

export default function HuntView({ scenarioId, onSubmit, onBack }: Props) {
  const scenario = getScenario(scenarioId)!;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentPage, setCurrentPage] = useState<ScenarioPage>(scenario.pages[0]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [flagMode, setFlagMode] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const pagePins = pins.filter((p) => p.pageId === currentPage.id);
  const base = import.meta.env.BASE_URL;

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const path = iframe.contentWindow.location.pathname;
    const file = path.split('/').pop() ?? '';
    const page = scenario.pages.find((p) => p.file === file);
    if (page && page.id !== currentPage.id) {
      setCurrentPage(page);
    }

    if (flagMode) {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.addEventListener('click', (e: MouseEvent) => {
        if (!flagMode) return;
        e.preventDefault();
        e.stopPropagation();
        const newPin: Pin = {
          id: crypto.randomUUID(),
          pageId: currentPage.id,
          x: e.pageX,
          y: e.pageY,
          note: '',
        };
        setPins((prev) => [...prev, newPin]);
      });
    }
  }, [scenario.pages, currentPage.id, flagMode]);

  const removePin = (pinId: string) => {
    setPins((prev) => prev.filter((p) => p.id !== pinId));
  };

  const navigateToPage = (page: ScenarioPage) => {
    setCurrentPage(page);
    if (iframeRef.current) {
      iframeRef.current.src = `${base}scenarios/${scenario.id}/${page.file}`;
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
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
          <span className="text-bh-muted text-sm">Phase 1: Manual Hunt</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-bh-secondary text-sm font-mono">{formatTime(elapsed)}</span>
          <button
            type="button"
            onClick={() => setFlagMode(!flagMode)}
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
            onClick={() => {
              const doc = iframeRef.current?.contentDocument;
              const matches = doc
                ? matchUserPins(pins, scenario.bugs, doc)
                : new Map<string, string>();
              onSubmit(pins, matches);
            }}
            className="px-4 py-1.5 bg-bh-accentDim text-white rounded text-sm font-medium
              hover:bg-bh-accent transition-colors"
          >
            Submit findings ({pins.length})
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Page nav sidebar */}
        <aside className="w-48 bg-bh-deep border-r border-bh-border p-3 flex flex-col gap-1">
          <span className="text-xs text-bh-muted uppercase tracking-wide mb-2">Pages</span>
          {scenario.pages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => navigateToPage(page)}
              className={`text-left text-sm px-3 py-2 rounded transition-colors ${
                currentPage.id === page.id
                  ? 'bg-bh-accent/20 text-bh-accent'
                  : 'text-bh-secondary hover:bg-bh-surface'
              }`}
            >
              {page.title}
              {pins.filter((p) => p.pageId === page.id).length > 0 && (
                <span className="ml-2 text-xs text-bh-critical">
                  {pins.filter((p) => p.pageId === page.id).length}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Iframe area */}
        <main className="flex-1 relative bg-white">
          <iframe
            ref={iframeRef}
            src={`${base}scenarios/${scenario.id}/${currentPage.file}`}
            className="w-full h-full border-0"
            title={`${scenario.title} — ${currentPage.title}`}
            onLoad={handleIframeLoad}
          />
          {/* Render pins on overlay */}
          {flagMode && pagePins.map((pin, i) => (
            <BugPin
              key={pin.id}
              number={i + 1}
              x={pin.x}
              y={pin.y}
              onRemove={() => removePin(pin.id)}
            />
          ))}
        </main>

        {/* Flags sidebar */}
        <aside className="w-64 bg-bh-deep border-l border-bh-border p-3 overflow-y-auto">
          <span className="text-xs text-bh-muted uppercase tracking-wide">
            Your flags ({pins.length})
          </span>
          {pins.length === 0 && (
            <p className="text-bh-muted text-sm mt-4">
              Click on the page to flag suspected bugs.
            </p>
          )}
          <div className="mt-3 flex flex-col gap-2">
            {pins.map((pin, i) => (
              <div
                key={pin.id}
                className="flex items-center justify-between bg-bh-surface rounded px-3 py-2 text-sm"
              >
                <span>
                  <span className="text-bh-critical font-bold mr-2">#{i + 1}</span>
                  <span className="text-bh-secondary">{pin.pageId}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removePin(pin.id)}
                  className="text-bh-muted hover:text-bh-critical text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
