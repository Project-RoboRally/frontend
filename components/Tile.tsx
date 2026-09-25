import Image from "next/image";

interface TileProps {
  x: number;
  y: number;
  hasRobot: boolean;
  onClick: () => void;
}

export default function Tile({
                               x,
                               y,
                               hasRobot,
                               onClick,
                             }: TileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Tile ${x}, ${y}`}
      className="relative flex h-full w-full items-center justify-center border border-slate-700 bg-slate-950 text-xs text-slate-400 transition-colors hover:bg-pink-800"
    >
      {hasRobot && (
        <div className="relative z-10 flex h-4/5 w-4/5 items-center justify-center">
          <Image
            src="/orangeRobot1.png"
            alt="Orange Robot"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      )}
    </button>
  );
}