import {
  Calendar,
  CheckSquare,
  FileText,
  Hash,
  Link2,
  List,
  Sigma,
  Tag,
} from "lucide-react";

interface PropertyIconProps {
  type: string;
  size?: number;
}

const ICONS: Record<string, React.ElementType> = {
  TEXT: FileText,
  NUMBER: Hash,
  DATE: Calendar,
  CHECKBOX: CheckSquare,
  SELECT: Tag,
  STATUS: List,
  RELATION: Link2,
  FORMULA: Sigma,
};

export function PropertyIcon({ type, size = 13 }: PropertyIconProps) {
  const Icon = ICONS[type] ?? FileText;
  return <Icon size={size} />;
}
