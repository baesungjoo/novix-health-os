import { Badge } from "@/components/ui";
import {
  NEXT_ACTION_STATUS_LABELS,
  NEXT_ACTION_STATUS_VARIANTS,
  type NextActionStatus,
} from "./next-action-meta";

interface NextActionStatusBadgeProps {
  status: NextActionStatus;
}

export function NextActionStatusBadge({ status }: NextActionStatusBadgeProps) {
  return (
    <Badge variant={NEXT_ACTION_STATUS_VARIANTS[status]}>
      {NEXT_ACTION_STATUS_LABELS[status]}
    </Badge>
  );
}
