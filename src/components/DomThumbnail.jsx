import { useEffect, useRef } from 'react';

export default function DomThumbnail({ iframeRef, selector }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const el = iframe.contentDocument.querySelector(selector);
    if (!el) return;

    // Clear previous
    container.innerHTML = '';

    // Clone element and 1-2 siblings for context
    const parent = el.parentElement;
    const wrapper = document.createElement('div');

    if (parent) {
      const children = Array.from(parent.children);
      const idx = children.indexOf(el);
      const start = Math.max(0, idx - 1);
      const end = Math.min(children.length, idx + 2);

      for (let i = start; i < end; i++) {
        const clone = children[i].cloneNode(true);
        if (clone instanceof HTMLElement) {
          // Copy computed styles inline
          const computed = iframe.contentWindow.getComputedStyle(children[i]);
          const important = ['color', 'background', 'background-color', 'font-size',
            'font-weight', 'border', 'padding', 'margin', 'display', 'text-decoration',
            'opacity', 'width', 'height', 'max-width'];
          for (const prop of important) {
            clone.style.setProperty(prop, computed.getPropertyValue(prop));
          }
          // Highlight the target element's clone
          if (i === idx) {
            clone.style.outline = '2px solid #ef4444';
            clone.style.outlineOffset = '1px';
          }
        }
        wrapper.appendChild(clone);
      }
    } else {
      const clone = el.cloneNode(true);
      wrapper.appendChild(clone);
    }

    wrapper.style.transformOrigin = 'top left';
    wrapper.style.transform = 'scale(0.3)';
    wrapper.style.width = `${120 / 0.3}px`;
    wrapper.style.pointerEvents = 'none';
    container.appendChild(wrapper);
  }, [iframeRef, selector]);

  return (
    <div
      ref={containerRef}
      className="w-[120px] h-[80px] overflow-hidden rounded border border-bh-border bg-white"
    />
  );
}
