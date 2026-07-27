export const RESERVATION_STATUS_LABELS = {
  PENDING: '대기',
  CONFIRMED: '확정',
  COMPLETED: '완료',
  CANCELLED: '취소',
  NO_SHOW: '노쇼',
} as const;

export const RESERVATION_STATUS_VARIANTS = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  COMPLETED: 'default',
  CANCELLED: 'danger',
  NO_SHOW: 'danger',
} as const;

export const RESERVATION_STATUS_OPTIONS = [
  { value: 'PENDING', label: RESERVATION_STATUS_LABELS.PENDING },
  { value: 'CONFIRMED', label: RESERVATION_STATUS_LABELS.CONFIRMED },
  { value: 'COMPLETED', label: RESERVATION_STATUS_LABELS.COMPLETED },
  { value: 'CANCELLED', label: RESERVATION_STATUS_LABELS.CANCELLED },
] as const;

export const RESERVATION_RANGE_LABELS = {
  TODAY: '오늘',
  WEEK: '이번 주',
  MONTH: '이번 달',
} as const;

export const RESERVATION_TYPE_LABELS = {
  CONSULTATION: '상담',
  TRIAL: '체험',
  VISIT: '방문',
  OTHER: '기타',
} as const;

export const RESERVATION_TYPE_VARIANTS = {
  CONSULTATION: 'success',
  TRIAL: 'warning',
  VISIT: 'default',
  OTHER: 'danger',
} as const;

export const RESERVATION_TYPE_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'CONSULTATION', label: RESERVATION_TYPE_LABELS.CONSULTATION },
  { value: 'TRIAL', label: RESERVATION_TYPE_LABELS.TRIAL },
  { value: 'VISIT', label: RESERVATION_TYPE_LABELS.VISIT },
  { value: 'OTHER', label: RESERVATION_TYPE_LABELS.OTHER },
] as const;

export type ReservationStatus = keyof typeof RESERVATION_STATUS_LABELS;
export type ReservationRange = keyof typeof RESERVATION_RANGE_LABELS;
export type ReservationType = keyof typeof RESERVATION_TYPE_LABELS;

export interface ReservationMemberSummary {
  id: number;
  name: string;
  phone: string;
}

export interface ReservationRecord {
  id: number;
  memberId: number;
  date: string;
  time: string;
  status: ReservationStatus;
  memo: string;
  createdAt: string;
  updatedAt: string;
  member: ReservationMemberSummary;
}

export function getTodayIsoDate(referenceDate: Date = new Date()) {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0');
  const day = String(referenceDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getKoreaDateParts(referenceDate: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(referenceDate);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

export function getKoreaTodayIsoDate(referenceDate: Date = new Date()) {
  const { year, month, day } = getKoreaDateParts(referenceDate);

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getKoreaTodayRange(referenceDate: Date = new Date()) {
  const { year, month, day } = getKoreaDateParts(referenceDate);
  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    start: new Date(`${isoDate}T00:00:00+09:00`),
    end: new Date(`${isoDate}T23:59:59.999+09:00`),
    isoDate,
  };
}

export function isIsoDateInKoreaRange(
  isoDate: string,
  range: { start: Date; end: Date }
) {
  const candidate = new Date(`${isoDate}T00:00:00+09:00`);

  return candidate >= range.start && candidate <= range.end;
}

export function getMonthAnchor(referenceDate: Date = new Date()) {
  return new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
}

export function getMonthTitle(referenceDate: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
  }).format(referenceDate);
}

export function getMonthMatrix(referenceDate: Date) {
  const monthStart = getMonthAnchor(referenceDate);
  const weekStartOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - weekStartOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);

    return getTodayIsoDate(day);
  });
}

export function formatDateLabel(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  return `${Number(month)}월 ${Number(day)}일`;
}

export function isSameIsoDate(left: string, right: string) {
  return left === right;
}

export function isDateInRange(
  isoDate: string,
  range: ReservationRange,
  referenceDate: Date = new Date()
) {
  const current = new Date(referenceDate);
  const candidate = new Date(`${isoDate}T00:00:00`);

  if (range === 'TODAY') {
    return isoDate === getTodayIsoDate(referenceDate);
  }

  if (range === 'WEEK') {
    const weekStart = new Date(current);
    weekStart.setDate(current.getDate() - ((current.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return candidate >= weekStart && candidate <= weekEnd;
  }

  return (
    candidate.getFullYear() === current.getFullYear() &&
    candidate.getMonth() === current.getMonth()
  );
}

export function resolveReservationType(reservation: Pick<ReservationRecord, 'memo' | 'date' | 'time'>): ReservationType {
  const memo = reservation.memo.toLowerCase();

  if (memo.includes('상담') || memo.includes('문의')) {
    return 'CONSULTATION';
  }

  if (memo.includes('체험') || memo.includes('무료') || memo.includes('시연')) {
    return 'TRIAL';
  }

  if (memo.includes('방문') || memo.includes('재방문') || memo.includes('내원')) {
    return 'VISIT';
  }

  return 'OTHER';
}

export function getReservationDateTimeValue(reservation: Pick<ReservationRecord, 'date' | 'time'>) {
  return new Date(`${reservation.date}T${reservation.time}:00`);
}

export function sortReservationsByDateTime(
  left: Pick<ReservationRecord, 'date' | 'time'>,
  right: Pick<ReservationRecord, 'date' | 'time'>
) {
  return getReservationDateTimeValue(left).getTime() - getReservationDateTimeValue(right).getTime();
}

export function isReservationNoShow(reservation: Pick<ReservationRecord, 'status'>) {
  return reservation.status === 'NO_SHOW';
}

export function isUpcomingScheduledReservation(
  reservation: Pick<ReservationRecord, 'date' | 'status'>,
  referenceDate: Date = new Date()
) {
  const todayIsoDate = getKoreaTodayIsoDate(referenceDate);

  return (
    reservation.date >= todayIsoDate &&
    (reservation.status === 'PENDING' || reservation.status === 'CONFIRMED')
  );
}
