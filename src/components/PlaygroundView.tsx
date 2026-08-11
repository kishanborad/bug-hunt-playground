import { useCallback, useEffect, useRef, useState } from 'react';
import { getScenario } from '../scenarios';
import type { ManifestBug, Pin, ProbeResult, ScenarioPage } from '../types';
import type { ProbeProgress } from '../engine/runAllProbes';
import { matchUserPins } from '../engine/matcher';
import { runAllProbes } from '../engine/runAllProbes';
import { highlightBug, highlightBugForJump, clearJumpHighlight } from './ProbeOverlay';
import { showTooltip } from './BugTooltip';
import PlaygroundHeader from './PlaygroundHeader';
import BugGuide from './BugGuide';
import PageNav from './PageNav';
import ProbePipeline from './ProbePipeline';
import BugList from './BugList';
import BugPin from './BugPin';

interface Props {
  scenarioId: string;
  onFinish: (pins: Pin[], pinMatches: Map<string, string>, probeResults: ProbeResult[]) => void;
  onBack: () => void;
}

type Mode = 'guide' | 'hunt' | 'probe';

export default function PlaygroundView({ scenarioId, onFinish, onBack }: Props) {
  const scenario = getScenario(scenarioId)!;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const flagModeRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const [mode, setMode] = useState<Mode>('guide');
  const [flagMode, setFlagMode] = useState(true);
  const [showGuidePanel, setShowGuidePanel] = useState(false);
  const [currentPage, setCurrentPage] = useState<ScenarioPage>(scenario.pages[0]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [elapsed, setElapsed] = useState(0);

  // Probe state
  const [probePhase, setProbePhase] = useState<ProbeProgress['phase']>('visual');
  const [probeResults, setProbeResults] = useState<ProbeResult[]>([]);
  const [probePageIndex, setProbePageIndex] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [pinMatches, setPinMatches] = useState<Map<string, string>>(new Map());

  const base = import.meta.env.BASE_URL;

  // Timer
  useEffect(() => {
    if (mode !== 'hunt') return;
    const id = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [mode]);

  // Keep ref in sync with state
  useEffect(() => {
    flagModeRef.current = flagMode;
  }, [flagMode]);

  // Iframe load handler
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return;

    // Sync current page from iframe location
    const path = iframe.contentWindow.location.pathname;
    const file = path.split('/').pop() ?? '';
    const page = scenario.pages.find((p) => p.file === file);
    if (page && page.id !== currentPage.id) {
      setCurrentPage(page);
    }

    if (mode === 'hunt') {
      // Abort previous listener
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      iframe.contentDocument.addEventListener(
        'click',
        (e: MouseEvent) => {
          if (!flagModeRef.current) return;
          e.preventDefault();
          e.stopPropagation();
          const pageId = page?.id ?? currentPage.id;
          const newPin: Pin = {
            id: crypto.randomUUID(),
            pageId,
            x: e.pageX,
            y: e.pageY,
            note: '',
          };
          setPins((prev) => [...prev, newPin]);
        },
        { signal: controller.signal },
      );
    }
  }, [scenario.pages, currentPage.id, mode]);

  // Navigate to page
  const navigateToPage = useCallback(
    (page: ScenarioPage) => {
      setCurrentPage(page);
      if (iframeRef.current) {
        iframeRef.current.src = `${base}scenarios/${scenario.id}/${page.file}`;
      }
    },
    [base, scenario.id],
  );

  // Submit findings — transition to probe mode
  const handleSubmit = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    const matches = doc ? matchUserPins(pins, scenario.bugs, doc) : new Map<string, string>();
    setPinMatches(matches);
    setMode('probe');
    setProbePageIndex(0);
    setProbeResults([]);
    setScanComplete(false);
    setProbePhase('visual');
    // Navigate to first page for probing
    const firstPage = scenario.pages[0];
    setCurrentPage(firstPage);
    if (iframeRef.current) {
      iframeRef.current.src = `${base}scenarios/${scenario.id}/${firstPage.file}`;
    }
  }, [pins, scenario, base]);

  // Run probes when in probe mode and iframe loads
  const runProbesForCurrentPage = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || mode !== 'probe') return;

    const pageBugs = scenario.bugs.filter((b) => b.page === currentPage.id);
    const pageResults = await runAllProbes(iframe.contentDocument, pageBugs, (progress) => {
      setProbePhase(progress.phase);
      // Highlight each new result as it arrives
      for (const r of progress.results) {
        highlightBug(iframe.contentDocument!, r.selector);
      }
    });

    setProbeResults((prev) => {
      const updated = [...prev, ...pageResults];
      const nextIndex = probePageIndex + 1;
      if (nextIndex < scenario.pages.length) {
        setProbePageIndex(nextIndex);
        const nextPage = scenario.pages[nextIndex];
        setCurrentPage(nextPage);
        if (iframeRef.current) {
          iframeRef.current.src = `${base}scenarios/${scenario.id}/${nextPage.file}`;
        }
      } else {
        setScanComplete(true);
        setProbePhase('done');
      }
      return updated;
    });
  }, [mode, scenario, currentPage.id, probePageIndex, base]);

  // Trigger probes on iframe load during probe mode
  const handleIframeLoadForProbe = useCallback(() => {
    if (mode === 'probe') {
      runProbesForCurrentPage();
    }
  }, [mode, runProbesForCurrentPage]);

  // Combined iframe load handler
  const onIframeLoad = useCallback(() => {
    handleIframeLoad();
    handleIframeLoadForProbe();
  }, [handleIframeLoad, handleIframeLoadForProbe]);

  // Click-to-jump handler
  const handleBugClick = useCallback(
    (bug: ManifestBug, _result: ProbeResult) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentDocument) return;

      // If bug is on a different page, navigate first
      if (bug.page !== currentPage.id) {
        const targetPage = scenario.pages.find((p) => p.id === bug.page);
        if (targetPage) {
          // Navigate and let the onLoad handler do the rest
          // We set a pending jump that will execute after navigation
          navigateToPage(targetPage);
          // Wait for iframe to load, then highlight
          const onLoad = () => {
            iframe.removeEventListener('load', onLoad);
            const doc = iframe.contentDocument;
            if (!doc) return;
            clearJumpHighlight(doc);
            highlightBugForJump(doc, bug.selector);
            showTooltip(doc, bug.selector, bug);
          };
          iframe.addEventListener('load', onLoad);
          return;
        }
      }

      clearJumpHighlight(iframe.contentDocument);
      highlightBugForJump(iframe.contentDocument, bug.selector);
      showTooltip(iframe.contentDocument, bug.selector, bug);
    },
    [currentPage.id, scenario.pages, navigateToPage],
  );

  // Pin helpers
  const removePin = (pinId: string) => {
    setPins((prev) => prev.filter((p) => p.id !== pinId));
  };

  const pagePins = pins.filter((p) => p.pageId === currentPage.id);
  const pinCounts: Record<string, number> = {};
  for (const pin of pins) {
    pinCounts[pin.pageId] = (pinCounts[pin.pageId] || 0) + 1;
  }

  return (
    <div className="h-screen flex flex-col">
      <PlaygroundHeader
        scenario={scenario}
        mode={mode === 'guide' ? 'hunt' : mode}
        elapsed={elapsed}
        flagMode={flagMode}
        pinCount={pins.length}
        onToggleFlag={() => setFlagMode(!flagMode)}
        onSubmit={handleSubmit}
        onBack={onBack}
        onToggleGuide={() => setShowGuidePanel(!showGuidePanel)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — page nav */}
        <PageNav
          pages={scenario.pages}
          currentPageId={currentPage.id}
          pinCounts={pinCounts}
          onSelect={navigateToPage}
        />

        {/* Guide panel (during hunt) */}
        {mode === 'hunt' && showGuidePanel && (
          <BugGuide scenario={scenario} onStart={() => {}} isPanel={true} />
        )}

        {/* Main iframe area */}
        <main className="flex-1 relative bg-white">
          {/* Guide interstitial overlay */}
          {mode === 'guide' && (
            <BugGuide
              scenario={scenario}
              onStart={() => setMode('hunt')}
              isPanel={false}
            />
          )}

          <iframe
            ref={iframeRef}
            src={`${base}scenarios/${scenario.id}/${currentPage.file}`}
            className="w-full h-full border-0"
            title={`${scenario.title} — ${currentPage.title}`}
            onLoad={onIframeLoad}
          />

          {/* Render pins on overlay (hunt mode only) */}
          {mode === 'hunt' &&
            flagMode &&
            pagePins.map((pin, i) => (
              <BugPin
                key={pin.id}
                number={i + 1}
                x={pin.x}
                y={pin.y}
                onRemove={() => removePin(pin.id)}
              />
            ))}
        </main>

        {/* Right sidebar */}
        {mode === 'hunt' && (
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
        )}

        {mode === 'probe' && (
          <aside className="w-72 bg-bh-deep border-l border-bh-border p-4 overflow-y-auto flex flex-col gap-4">
            <ProbePipeline
              currentPhase={probePhase}
              currentPage={currentPage.title}
              totalPages={`${probePageIndex + 1}/${scenario.pages.length}`}
            />
            <BugList
              results={probeResults}
              scenario={scenario}
              iframeRef={iframeRef}
              onBugClick={handleBugClick}
              scanComplete={scanComplete}
            />
            {scanComplete && (
              <button
                type="button"
                onClick={() => onFinish(pins, pinMatches, probeResults)}
                className="mt-2 w-full py-2.5 bg-bh-accentDim text-white rounded-lg text-sm
                  font-medium hover:bg-bh-accent transition-colors"
              >
                Continue to Report →
              </button>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
