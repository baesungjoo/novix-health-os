import { Badge } from "@/components/ui";
import {
  NEXT_ACTION_PRIORITY_LABELS,
  NEXT_ACTION_PRIORITY_VARIANTS,
  type NextActionPriority,
} from "./next-action-meta";

interface NextActionPriorityBadgeProps {
  priority: NextActionPriority;
}

export function NextActionPriorityBadge({
  priority,
}: NextActionPriorityBadgeProps) {
  return (
    <Badge variant={NEXT_ACTION_PRIORITY_VARIANTS[priority]}>
      {NEXT_ACTION_PRIORITY_LABELS[priority]}
    </Badge>
  );
}
