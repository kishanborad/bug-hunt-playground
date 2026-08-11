const SCAN_CLASS = 'bh-probe-highlight';
const JUMP_CLASS = 'bh-jump-highlight';
const STYLE_ID = 'bh-probe-styles';

export function injectProbeStyles(doc: Document): void {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${SCAN_CLASS} {
      outline: 3px dashed #ef4444 !important;
      outline-offset: 2px !important;
      animation: bh-scan-pulse 1.5s ease-in-out infinite !important;
    }
    .${JUMP_CLASS} {
      outline: 4px solid #ef4444 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.6) !important;
      animation: bh-highlight-glow 1s ease-in-out infinite !important;
    }
    @keyframes bh-scan-pulse {
      0%, 100% { outline-color: rgba(239, 68, 68, 0.4); }
      50% { outline-color: rgba(239, 68, 68, 1); }
    }
    @keyframes bh-highlight-glow {
      0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.3); }
      50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
    }
  `;
  doc.head.appendChild(style);
}

export function highlightBug(doc: Document, selector: string): void {
  injectProbeStyles(doc);
  const el = doc.querySelector(selector);
  if (el) el.classList.add(SCAN_CLASS);
}

export function highlightBugForJump(doc: Document, selector: string): void {
  clearJumpHighlight(doc);
  injectProbeStyles(doc);
  const el = doc.querySelector(selector);
  if (!el) return;
  el.classList.add(JUMP_CLASS);
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function clearJumpHighlight(doc: Document): void {
  const els = doc.querySelectorAll(`.${JUMP_CLASS}`);
  els.forEach((el) => el.classList.remove(JUMP_CLASS));
}
