export function runVisualProbe(doc, bugs) {
  const results = [];
  const visualBugs = bugs.filter((b) => b.category === 'visual');

  for (const bug of visualBugs) {
    const el = doc.querySelector(bug.selector);
    if (!el) continue;

    if (bug.check === 'visual:broken-image' && el instanceof HTMLImageElement) {
      if (el.complete && el.naturalWidth === 0) {
        results.push({
          bugId: bug.id,
          probe: 'visual',
          selector: bug.selector,
          details: `Image src "${el.src}" failed to load`,
        });
      }
    }

    if (bug.check === 'visual:overlap' && bug.targetSelector) {
      const target = doc.querySelector(bug.targetSelector);
      if (target && rectsOverlap(el.getBoundingClientRect(), target.getBoundingClientRect())) {
        results.push({
          bugId: bug.id,
          probe: 'visual',
          selector: bug.selector,
          details: `"${bug.selector}" overlaps "${bug.targetSelector}"`,
        });
      }
    }

    if (bug.check === 'visual:truncated' && el instanceof HTMLElement) {
      if (el.scrollWidth > el.clientWidth) {
        results.push({
          bugId: bug.id,
          probe: 'visual',
          selector: bug.selector,
          details: `Text clipped: scrollWidth ${el.scrollWidth}px > clientWidth ${el.clientWidth}px`,
        });
      }
    }
  }

  return results;
}

function rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
