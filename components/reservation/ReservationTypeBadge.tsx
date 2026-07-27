import { Badge } from '@/components/ui';
import {
  RESERVATION_TYPE_LABELS,
  RESERVATION_TYPE_VARIANTS,
  type ReservationType,
} from './reservation-meta';

interface ReservationTypeBadgeProps {
  type: ReservationType;
}

export function ReservationTypeBadge({ type }: ReservationTypeBadgeProps) {
  return (
    <Badge variant={RESERVATION_TYPE_VARIANTS[type]}>
      {RESERVATION_TYPE_LABELS[type]}
    </Badge>
  );
}
