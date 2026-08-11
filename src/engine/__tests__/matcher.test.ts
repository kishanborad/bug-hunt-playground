import { describe, expect, it } from 'vitest';
import { buildReport, matchUserPins } from '../matcher';
import type { ManifestBug, Pin, ProbeResult } from '../../types';

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
    guideHint: 'Check images',
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
    guideHint: 'Check images',
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

describe('matchUserPins', () => {
  it('prevents two pins from claiming the same bug', () => {
    // Create a mock document with one element
    const mockEl = { getBoundingClientRect: () => ({ left: 100, right: 200, top: 100, bottom: 200 }) };
    const doc = {
      querySelector: (sel: string) => sel === '.img' ? mockEl : null,
    } as unknown as Document;

    const bugs: ManifestBug[] = [
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
        guideHint: 'Check images',
      },
    ];

    const pins: Pin[] = [
      { id: 'pin-1', pageId: 'p1', x: 150, y: 150, note: '' },
      { id: 'pin-2', pageId: 'p1', x: 151, y: 151, note: '' },
    ];

    const matches = matchUserPins(pins, bugs, doc);
    // Only one pin should claim bug-a
    const bugValues = [...matches.values()];
    const uniqueBugs = new Set(bugValues);
    expect(uniqueBugs.size).toBe(bugValues.length);
  });
});
