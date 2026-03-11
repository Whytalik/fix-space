interface ColorSwatchProps {
  value: string;
}

export function ColorSwatch({ value }: ColorSwatchProps) {
  if (!value) return null;
  return <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: value }} />;
}
