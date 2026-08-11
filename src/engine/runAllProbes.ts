import type { ManifestBug, ProbeResult } from '../types';
import { runVisualProbe } from './visualProbe';
import { runFunctionalProbe } from './functionalProbe';
import { runAccessibilityProbe } from './accessibilityProbe';

export interface ProbeProgress {
  phase: 'visual' | 'functional' | 'accessibility' | 'done';
  results: ProbeResult[];
}

export async function runAllProbes(
  doc: Document,
  pageBugs: ManifestBug[],
  onProgress: (progress: ProbeProgress) => void,
): Promise<ProbeResult[]> {
  const allResults: ProbeResult[] = [];

  const visualResults = runVisualProbe(doc, pageBugs);
  allResults.push(...visualResults);
  onProgress({ phase: 'visual', results: [...allResults] });
  await delay(600);

  const functionalResults = runFunctionalProbe(doc, pageBugs);
  allResults.push(...functionalResults);
  onProgress({ phase: 'functional', results: [...allResults] });
  await delay(600);

  const a11yResults = await runAccessibilityProbe(doc, pageBugs);
  allResults.push(...a11yResults);
  onProgress({ phase: 'accessibility', results: [...allResults] });
  await delay(400);

  onProgress({ phase: 'done', results: [...allResults] });
  return allResults;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
