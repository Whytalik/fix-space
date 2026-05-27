interface AvatarProps {
  initial: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-7.5 h-7.5 text-xs",
  md: "w-14 h-14 text-xl",
  lg: "w-20 h-20 text-3xl",
};

export function Avatar({ initial, image, size = "md", className = "" }: AvatarProps) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={initial}
        className={`rounded-full object-cover shrink-0 ${SIZE_CLASSES[size]} ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-accent-muted border border-accent font-bold text-accent shrink-0 ${SIZE_CLASSES[size]} ${className}`}
    >
      {initial.toUpperCase()}
    </div>
  );
}
