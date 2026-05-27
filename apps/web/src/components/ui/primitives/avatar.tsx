import Image from "next/image";

interface AvatarProps {
  initial: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  image?: string | null;
}

const SIZE_CLASSES = {
  sm: "w-7.5 h-7.5 text-xs",
  md: "w-14 h-14 text-xl",
  lg: "w-20 h-20 text-3xl",
};

const SIZE_PX = { sm: 30, md: 56, lg: 80 };

export function Avatar({ initial, size = "md", className = "", image }: AvatarProps) {
  if (image) {
    return (
      <Image
        src={image}
        alt={initial}
        width={SIZE_PX[size]}
        height={SIZE_PX[size]}
        unoptimized
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
