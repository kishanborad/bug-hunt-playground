export interface ScenarioPage {
  id: string;
  file: string;
  title: string;
}

export interface ManifestBug {
  id: string;
  page: string;
  category: 'visual' | 'functional' | 'accessibility';
  severity: 'critical' | 'major' | 'minor';
  selector: string;
  check: string;
  title: string;
  description: string;
  remediation: string;
  expected?: string;
  targetSelector?: string;
  wcag?: string;
  wcagUrl?: string;
}

export interface Scenario {
  id: string;
  title: string;
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pages: ScenarioPage[];
  bugs: ManifestBug[];
}

export interface Pin {
  id: string;
  pageId: string;
  x: number;
  y: number;
  note: string;
}

export interface ProbeResult {
  bugId: string;
  probe: 'visual' | 'functional' | 'accessibility';
  selector: string;
  details: string;
}

export interface BugMatch {
  bug: ManifestBug;
  foundByUser: boolean;
  foundByProbe: boolean;
  pinId?: string;
  probeResult?: ProbeResult;
}

export type AppView =
  | { kind: 'picker' }
  | { kind: 'hunt'; scenarioId: string }
  | { kind: 'probing'; scenarioId: string; pins: Pin[]; pinMatches: Map<string, string> }
  | { kind: 'report'; scenarioId: string; pins: Pin[]; pinMatches: Map<string, string>; probeResults: ProbeResult[] };
