import { useState } from 'react';
import type { AppView, Pin } from './types';
import ScenarioPicker from './components/ScenarioPicker';
import HuntView from './components/HuntView';
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
        <HuntView
          scenarioId={view.scenarioId}
          onSubmit={(pins: Pin[], pinMatches: Map<string, string>) =>
            setView({
              kind: 'report',
              scenarioId: view.scenarioId,
              pins,
              pinMatches,
              probeResults: [],
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
