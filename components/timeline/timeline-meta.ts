import {
  CalendarCheck2,
  CalendarPlus2,
  CheckCircle2,
  ListTodo,
  UserRoundPlus,
} from 'lucide-react';

export type TimelineType =
  | 'MEMBER_CREATED'
  | 'RESERVATION_CREATED'
  | 'RESERVATION_COMPLETED'
  | 'NEXT_ACTION_CREATED'
  | 'NEXT_ACTION_COMPLETED';

export interface TimelineMemberSummary {
  id: number;
  name: string;
  phone: string;
}

export interface TimelineReservationSummary {
  id: number;
  date: string;
  time: string;
  status: string;
}

export interface TimelineEventRecord {
  id: number;
  memberId: number;
  reservationId: number | null;
  type: TimelineType;
  title: string;
  description: string;
  metadata: string;
  createdAt: string;
  member: TimelineMemberSummary;
  reservation: TimelineReservationSummary | null;
}

export const TIMELINE_TYPE_META = {
  MEMBER_CREATED: {
    label: '회원 등록',
    icon: UserRoundPlus,
    tone: 'member',
  },
  RESERVATION_CREATED: {
    label: '예약 등록',
    icon: CalendarPlus2,
    tone: 'reservation',
  },
  RESERVATION_COMPLETED: {
    label: '예약 완료',
    icon: CalendarCheck2,
    tone: 'completed',
  },
  NEXT_ACTION_CREATED: {
    label: '다음 액션 등록',
    icon: ListTodo,
    tone: 'action-created',
  },
  NEXT_ACTION_COMPLETED: {
    label: '다음 액션 완료',
    icon: CheckCircle2,
    tone: 'action-completed',
  },
} as const;

export function groupTimelineEventsByDate(events: TimelineEventRecord[]) {
  return events.reduce<Array<{ date: string; items: TimelineEventRecord[] }>>((groups, event) => {
    const date = event.createdAt.slice(0, 10);
    const existingGroup = groups.find((group) => group.date === date);

    if (existingGroup) {
      existingGroup.items.push(event);
      return groups;
    }

    groups.push({ date, items: [event] });
    return groups;
  }, []);
}

export function formatTimelineDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${Number(month)}월 ${Number(day)}일`;
}

export function formatTimelineDateTime(isoDateTime: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(isoDateTime));
}
