"use client";

import { ColorSwatch } from "@/components/product/ColorSwatch";

interface ColorOption {
  name: string;
  hex: string;
}

interface ColorSwatchStackProps {
  colors: ColorOption[];
  selected: string;
  onSelect: (name: string, event: React.MouseEvent<HTMLButtonElement>) => void;
}

/** Overlapping color dots for compact premium product cards. */
export function ColorSwatchStack({ colors, selected, onSelect }: ColorSwatchStackProps) {
  if (colors.length === 0) return null;

  return (
    <div className="flex items-center">
      {colors.map((color, index) => (
        <ColorSwatch
          key={color.name}
          name={color.name}
          hex={color.hex}
          selected={selected === color.name}
          size="xs"
          stacked
          stackIndex={index}
          stackTotal={colors.length}
          className={index > 0 ? "-ml-1.5" : ""}
          onClick={(event) => onSelect(color.name, event)}
        />
      ))}
    </div>
  );
}
