import { Badge } from '@/components/ui';
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_VARIANTS,
  type ReservationStatus,
} from './reservation-meta';

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  return (
    <Badge variant={RESERVATION_STATUS_VARIANTS[status]}>
      {RESERVATION_STATUS_LABELS[status]}
    </Badge>
  );
}
