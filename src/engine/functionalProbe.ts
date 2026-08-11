import type { ManifestBug, ProbeResult } from '../types';

export function runFunctionalProbe(
  doc: Document,
  bugs: ManifestBug[],
): ProbeResult[] {
  const results: ProbeResult[] = [];
  const functionalBugs = bugs.filter((b) => b.category === 'functional');

  for (const bug of functionalBugs) {
    const el = doc.querySelector(bug.selector);
    if (!el) continue;

    if (bug.check === 'functional:dead-link' && el instanceof HTMLAnchorElement) {
      const href = el.getAttribute('href') ?? '';
      if (href === '#' || href === '#broken' || href === '') {
        results.push({
          bugId: bug.id,
          probe: 'functional',
          selector: bug.selector,
          details: `Link href is "${href}" — does not navigate to a valid page`,
        });
      }
    }

    if (bug.check === 'functional:dead-button') {
      if (
        (el instanceof HTMLButtonElement && el.disabled) ||
        (el instanceof HTMLSelectElement && el.disabled)
      ) {
        results.push({
          bugId: bug.id,
          probe: 'functional',
          selector: bug.selector,
          details: `Element is disabled`,
        });
      }
    }

    if (bug.check === 'functional:wrong-value' && bug.expected) {
      const actual = (el.textContent ?? '').trim();
      if (!actual.includes(bug.expected)) {
        results.push({
          bugId: bug.id,
          probe: 'functional',
          selector: bug.selector,
          details: `Expected "${bug.expected}" but found "${actual}"`,
        });
      }
    }

    if (bug.check === 'functional:missing-required' && el instanceof HTMLInputElement) {
      if (!el.required && el.getAttribute('aria-required') !== 'true') {
        results.push({
          bugId: bug.id,
          probe: 'functional',
          selector: bug.selector,
          details: `Field has no required attribute or aria-required`,
        });
      }
    }
  }

  return results;
}
