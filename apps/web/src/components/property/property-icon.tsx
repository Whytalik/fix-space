import { PropertyType } from "@nucleus/domain";
import { Calendar, CheckSquare, FileText, Hash, Link2, List, Sigma, Tag } from "lucide-react";

interface PropertyIconProps {
  type: PropertyType;
  size?: number;
}

const ICONS: Record<PropertyType, React.ElementType> = {
  [PropertyType.TEXT]: FileText,
  [PropertyType.NUMBER]: Hash,
  [PropertyType.DATE]: Calendar,
  [PropertyType.CHECKBOX]: CheckSquare,
  [PropertyType.SELECT]: Tag,
  [PropertyType.STATUS]: List,
  [PropertyType.RELATION]: Link2,
  [PropertyType.FORMULA]: Sigma,
};

export function PropertyIcon({ type, size = 13 }: PropertyIconProps) {
  const Icon = ICONS[type] ?? FileText;
  return <Icon size={size} />;
}
