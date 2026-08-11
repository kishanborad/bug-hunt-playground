interface Props {
  number: number;
  x: number;
  y: number;
  onRemove: () => void;
}

export default function BugPin({ number, x, y, onRemove }: Props) {
  return (
    <div
      style={{ left: x - 12, top: y - 12 }}
      className="absolute w-6 h-6 bg-bh-critical rounded-full flex items-center
        justify-center text-[11px] font-bold text-white shadow-md z-[10000]
        cursor-pointer hover:scale-110 transition-transform"
      title={`Bug #${number} — click to remove`}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      {number}
    </div>
  );
}
