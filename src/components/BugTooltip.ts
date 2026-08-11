import type { ManifestBug } from '../types';

const TOOLTIP_ID = 'bh-bug-tooltip';
const TOOLTIP_STYLE_ID = 'bh-tooltip-styles';

function injectTooltipStyles(doc: Document): void {
  if (doc.getElementById(TOOLTIP_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = TOOLTIP_STYLE_ID;
  style.textContent = `
    #${TOOLTIP_ID} {
      position: absolute;
      z-index: 99999;
      max-width: 280px;
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      padding: 12px;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      color: #f4f4f6;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      animation: bh-tooltip-fade 0.2s ease-out;
    }
    #${TOOLTIP_ID} .bh-tt-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    #${TOOLTIP_ID} .bh-tt-desc {
      color: #aaa6c3;
      margin-bottom: 6px;
      line-height: 1.4;
    }
    #${TOOLTIP_ID} .bh-tt-severity {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    #${TOOLTIP_ID} .bh-tt-severity.critical { background: rgba(239,68,68,0.2); color: #ef4444; }
    #${TOOLTIP_ID} .bh-tt-severity.major { background: rgba(245,158,11,0.2); color: #f59e0b; }
    #${TOOLTIP_ID} .bh-tt-severity.minor { background: rgba(234,179,8,0.2); color: #eab308; }
    #${TOOLTIP_ID} .bh-tt-fix {
      color: #22c55e;
      font-size: 12px;
    }
    @keyframes bh-tooltip-fade {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  doc.head.appendChild(style);
}

export function showTooltip(doc: Document, selector: string, bug: ManifestBug): void {
  hideTooltip(doc);
  injectTooltipStyles(doc);

  const el = doc.querySelector(selector);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const scrollX = doc.defaultView?.scrollX ?? 0;
  const scrollY = doc.defaultView?.scrollY ?? 0;

  const tooltip = doc.createElement('div');
  tooltip.id = TOOLTIP_ID;
  tooltip.innerHTML = `
    <div class="bh-tt-severity ${bug.severity}">${bug.severity}</div>
    <div class="bh-tt-title">${bug.title}</div>
    <div class="bh-tt-desc">${bug.description}</div>
    <div class="bh-tt-fix"><strong>Fix:</strong> ${bug.remediation}</div>
  `;

  tooltip.style.left = `${rect.left + scrollX}px`;
  tooltip.style.top = `${rect.bottom + scrollY + 8}px`;

  doc.body.appendChild(tooltip);

  // Dismiss on click elsewhere
  const dismiss = (e: Event) => {
    if (!(e.target as HTMLElement)?.closest?.(`#${TOOLTIP_ID}`)) {
      hideTooltip(doc);
      doc.removeEventListener('click', dismiss);
    }
  };
  setTimeout(() => doc.addEventListener('click', dismiss), 0);

  // Auto-dismiss after 8 seconds
  setTimeout(() => hideTooltip(doc), 8000);
}

export function hideTooltip(doc: Document): void {
  doc.getElementById(TOOLTIP_ID)?.remove();
}
