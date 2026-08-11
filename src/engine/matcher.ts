import type { ManifestBug, Pin, ProbeResult, BugMatch } from '../types';

const PIN_PROXIMITY_PX = 30;

export function matchUserPins(
  pins: Pin[],
  bugs: ManifestBug[],
  doc: Document,
): Map<string, string> {
  const matches = new Map<string, string>();

  for (const pin of pins) {
    const pageBugs = bugs.filter((b) => b.page === pin.pageId);
    let closestBugId: string | null = null;
    let closestDist = Infinity;

    for (const bug of pageBugs) {
      const el = doc.querySelector(bug.selector);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const dist = distToRect(pin.x, pin.y, rect);
      if (dist < closestDist && dist <= PIN_PROXIMITY_PX) {
        closestDist = dist;
        closestBugId = bug.id;
      }
    }

    if (closestBugId && ![...matches.values()].includes(closestBugId)) {
      matches.set(pin.id, closestBugId);
    }
  }

  return matches;
}

function distToRect(px: number, py: number, rect: DOMRect): number {
  const cx = Math.max(rect.left, Math.min(px, rect.right));
  const cy = Math.max(rect.top, Math.min(py, rect.bottom));
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
}

export function buildReport(
  bugs: ManifestBug[],
  pinMatches: Map<string, string>,
  probeResults: ProbeResult[],
): BugMatch[] {
  const matchedByUser = new Set(pinMatches.values());
  const matchedByProbe = new Map<string, ProbeResult>();
  for (const r of probeResults) {
    matchedByProbe.set(r.bugId, r);
  }

  return bugs.map((bug) => {
    const foundByUser = matchedByUser.has(bug.id);
    const probeResult = matchedByProbe.get(bug.id);
    const userPinId = [...pinMatches.entries()].find(
      ([, bId]) => bId === bug.id,
    )?.[0];

    return {
      bug,
      foundByUser,
      foundByProbe: !!probeResult,
      pinId: userPinId,
      probeResult,
    };
  });
}
