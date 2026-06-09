"use client";

import type { RatingPropertyConfig } from "@fixspace/domain";
import { Star, StarHalf } from "lucide-react";
import { useState } from "react";

type RatingPropertyProps = {
  value: number | null;
  readOnly?: boolean;
  config?: RatingPropertyConfig | null;
  onChange?: (value: number | null) => void;
  maxStars?: number;
  className?: string;
};

export function RatingProperty({ value, readOnly, config, onChange, maxStars = 5, className = "" }: RatingPropertyProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const maxStarsValue = config?.maxStars ?? maxStars;
  const allowHalf = config?.allowHalf ?? true;

  const currentRating = hoverValue !== null ? hoverValue : typeof value === "number" ? value : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    if (readOnly) return;
    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isLeftHalf = e.clientX - rect.left < rect.width / 2;
      setHoverValue(index + (isLeftHalf ? 0.5 : 1));
    } else {
      setHoverValue(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    if (readOnly) return;

    let newValue = index + 1;
    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isLeftHalf = e.clientX - rect.left < rect.width / 2;
      newValue = index + (isLeftHalf ? 0.5 : 1);
    }

    if (value === newValue) {
      onChange?.(null);
    } else {
      onChange?.(newValue);
    }
  };

  return (
    <span className={`flex items-center gap-0.5 ${!readOnly ? "cursor-pointer" : ""} ${className}`} onMouseLeave={handleMouseLeave}>
      {[...Array(maxStarsValue).keys()].map((i) => {
        const isFull = currentRating >= i + 1;
        const isHalf = allowHalf && !isFull && currentRating >= i + 0.5;

        return (
          <span
            key={i}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={(e) => handleClick(e, i)}
            className="flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          >
            {isHalf ? (
              <StarHalf size={14} className="text-accent fill-accent" />
            ) : (
              <Star size={14} className={isFull ? "text-accent fill-accent" : "text-stroke"} />
            )}
          </span>
        );
      })}
    </span>
  );
}
