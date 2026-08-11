import { describe, expect, it } from 'vitest';
import { allScenarios } from '../index';

describe('scenario manifests', () => {
  it('has exactly 4 scenarios', () => {
    expect(allScenarios).toHaveLength(4);
  });

  it('each scenario has a unique id', () => {
    const ids = allScenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each scenario has 3 pages', () => {
    for (const s of allScenarios) {
      expect(s.pages).toHaveLength(3);
    }
  });

  it('each scenario has 7 bugs', () => {
    for (const s of allScenarios) {
      expect(s.bugs).toHaveLength(7);
    }
  });

  it('every bug references a valid page id', () => {
    for (const s of allScenarios) {
      const pageIds = new Set(s.pages.map((p) => p.id));
      for (const bug of s.bugs) {
        expect(pageIds.has(bug.page)).toBe(true);
      }
    }
  });

  it('every bug has a non-empty selector and check', () => {
    for (const s of allScenarios) {
      for (const bug of s.bugs) {
        expect(bug.selector.length).toBeGreaterThan(0);
        expect(bug.check.length).toBeGreaterThan(0);
      }
    }
  });

  it('accessibility bugs have wcag and wcagUrl', () => {
    for (const s of allScenarios) {
      for (const bug of s.bugs.filter((b) => b.category === 'accessibility')) {
        expect(bug.wcag).toBeDefined();
        expect(bug.wcagUrl).toBeDefined();
      }
    }
  });
});
