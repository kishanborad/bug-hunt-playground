export default function PageNav({ pages, currentPageId, pinCounts, onSelect }) {
  return (
    <aside className="w-48 bg-bh-deep border-r border-bh-border p-3 flex flex-col gap-1">
      <span className="text-xs text-bh-muted uppercase tracking-wide mb-2">Pages</span>
      {pages.map((page) => (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelect(page)}
          className={`text-left text-sm px-3 py-2 rounded transition-colors ${
            currentPageId === page.id
              ? 'bg-bh-accent/20 text-bh-accent'
              : 'text-bh-secondary hover:bg-bh-surface'
          }`}
        >
          {page.title}
          {(pinCounts[page.id] || 0) > 0 && (
            <span className="ml-2 text-xs text-bh-critical">
              {pinCounts[page.id]}
            </span>
          )}
        </button>
      ))}
    </aside>
  );
}
