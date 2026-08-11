import { describe, expect, it } from 'vitest';
import { buildReport } from '../matcher';
import type { ManifestBug, ProbeResult } from '../../types';

const fakeBugs: ManifestBug[] = [
  {
    id: 'bug-a',
    page: 'p1',
    category: 'visual',
    severity: 'major',
    selector: '.img',
    check: 'visual:broken-image',
    title: 'Broken image',
    description: 'desc',
    remediation: 'fix',
  },
  {
    id: 'bug-b',
    page: 'p1',
    category: 'accessibility',
    severity: 'critical',
    selector: '.heading',
    check: 'axe:image-alt',
    title: 'Missing alt',
    description: 'desc',
    remediation: 'fix',
    wcag: '1.1.1',
    wcagUrl: 'https://example.com',
  },
];

describe('buildReport', () => {
  it('marks bugs found by both user and probe', () => {
    const pinMatches = new Map([['pin-1', 'bug-a']]);
    const probeResults: ProbeResult[] = [
      { bugId: 'bug-a', probe: 'visual', selector: '.img', details: 'broken' },
    ];
    const report = buildReport(fakeBugs, pinMatches, probeResults);
    const match = report.find((m) => m.bug.id === 'bug-a')!;
    expect(match.foundByUser).toBe(true);
    expect(match.foundByProbe).toBe(true);
  });

  it('marks bugs found only by probe', () => {
    const pinMatches = new Map<string, string>();
    const probeResults: ProbeResult[] = [
      { bugId: 'bug-b', probe: 'accessibility', selector: '.heading', details: 'no alt' },
    ];
    const report = buildReport(fakeBugs, pinMatches, probeResults);
    const match = report.find((m) => m.bug.id === 'bug-b')!;
    expect(match.foundByUser).toBe(false);
    expect(match.foundByProbe).toBe(true);
  });

  it('marks bugs found only by user', () => {
    const pinMatches = new Map([['pin-1', 'bug-a']]);
    const probeResults: ProbeResult[] = [];
    const report = buildReport(fakeBugs, pinMatches, probeResults);
    const match = report.find((m) => m.bug.id === 'bug-a')!;
    expect(match.foundByUser).toBe(true);
    expect(match.foundByProbe).toBe(false);
  });

  it('marks bugs found by neither', () => {
    const report = buildReport(fakeBugs, new Map(), []);
    for (const match of report) {
      expect(match.foundByUser).toBe(false);
      expect(match.foundByProbe).toBe(false);
    }
  });

  it('returns one entry per manifest bug', () => {
    const report = buildReport(fakeBugs, new Map(), []);
    expect(report).toHaveLength(fakeBugs.length);
  });
});
