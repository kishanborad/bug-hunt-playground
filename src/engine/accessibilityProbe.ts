import axe from 'axe-core';
import type { ManifestBug, ProbeResult } from '../types';

export async function runAccessibilityProbe(
  doc: Document,
  bugs: ManifestBug[],
): Promise<ProbeResult[]> {
  const results: ProbeResult[] = [];
  const a11yBugs = bugs.filter((b) => b.category === 'accessibility');
  if (a11yBugs.length === 0) return results;

  const axeResults = await axe.run(doc.documentElement, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'best-practice'] },
  });

  for (const bug of a11yBugs) {
    const ruleId = bug.check.replace('axe:', '');
    const violation = axeResults.violations.find((v) => v.id === ruleId);
    if (!violation) continue;

    const matchingNode = violation.nodes.find((node) =>
      node.target.some((sel) => {
        try {
          const bugEl = doc.querySelector(bug.selector);
          const nodeEl = doc.querySelector(sel as string);
          return bugEl && nodeEl && (bugEl === nodeEl || bugEl.contains(nodeEl) || nodeEl.contains(bugEl));
        } catch {
          return false;
        }
      }),
    );

    if (matchingNode) {
      results.push({
        bugId: bug.id,
        probe: 'accessibility',
        selector: bug.selector,
        details: violation.help,
      });
    }
  }

  return results;
}
