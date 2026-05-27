import { PropertyType } from "@fixspace/domain/enums";
import {
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  Hash,
  Link2,
  List,
  MousePointer,
  Percent,
  Sigma,
  Star,
  Tag,
} from "lucide-react";

interface PropertyIconProps {
  type: PropertyType;
  size?: number;
  className?: string;
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
  [PropertyType.DURATION]: Clock,
  [PropertyType.RATING]: Star,
  [PropertyType.PROGRESS]: Percent,
  [PropertyType.BUTTON]: MousePointer,
};

export function PropertyIcon({ type, size = 13, className }: PropertyIconProps) {
  const Icon = ICONS[type] ?? FileText;
  return <Icon size={size} className={className} />;
}
