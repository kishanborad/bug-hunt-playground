import { useState } from 'react';
import type { AppView, Pin, ProbeResult } from './types';
import ScenarioPicker from './components/ScenarioPicker';
import PlaygroundView from './components/PlaygroundView';
import ReportCard from './components/ReportCard';

export default function App() {
  const [view, setView] = useState<AppView>({ kind: 'picker' });

  switch (view.kind) {
    case 'picker':
      return (
        <ScenarioPicker
          onSelect={(scenarioId: string) => setView({ kind: 'playground', scenarioId })}
        />
      );

    case 'playground':
      return (
        <PlaygroundView
          scenarioId={view.scenarioId}
          onFinish={(pins: Pin[], pinMatches: Map<string, string>, probeResults: ProbeResult[]) =>
            setView({
              kind: 'report',
              scenarioId: view.scenarioId,
              pins,
              pinMatches,
              probeResults,
            })
          }
          onBack={() => setView({ kind: 'picker' })}
        />
      );

    case 'report':
      return (
        <ReportCard
          scenarioId={view.scenarioId}
          pins={view.pins}
          pinMatches={view.pinMatches}
          probeResults={view.probeResults}
          onTryAnother={() => setView({ kind: 'picker' })}
          onReplay={() => setView({ kind: 'playground', scenarioId: view.scenarioId })}
        />
      );
  }
}
