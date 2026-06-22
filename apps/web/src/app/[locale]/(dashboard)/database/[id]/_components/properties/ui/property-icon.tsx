import { PropertyType } from "@fixspace/domain";
import { Calendar, CheckSquare, Clock, FileText, Hash, Link2, List, Sigma, Star, Tag, TrendingUp } from "lucide-react";

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
  [PropertyType.DURATION]: Clock,
  [PropertyType.SELECT]: Tag,
  [PropertyType.STATUS]: List,
  [PropertyType.RELATION]: Link2,
  [PropertyType.FORMULA]: Sigma,
  [PropertyType.RATING]: Star,
  [PropertyType.PROGRESS]: TrendingUp,
};

export function PropertyIcon({ type, size = 13, className }: PropertyIconProps) {
  const Icon = ICONS[type] ?? FileText;
  return <Icon size={size} className={className} />;
}
