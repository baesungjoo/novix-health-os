'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarRange, Filter, Plus, Search, Users } from 'lucide-react';
import { Badge, BadgeStyles, Button, ButtonStyles, Card, CardStyles, Input, InputStyles, ModalStyles } from '@/components/ui';
import { ReservationCalendar } from './ReservationCalendar';
import { ReservationDayList } from './ReservationDayList';
import { ReservationForm } from './ReservationForm';
import { ReservationHistory } from './ReservationHistory';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import { ReservationTypeBadge } from './ReservationTypeBadge';
import {
  RESERVATION_RANGE_LABELS,
  RESERVATION_STATUS_OPTIONS,
  RESERVATION_TYPE_OPTIONS,
  formatDateLabel,
  getMonthAnchor,
  getKoreaTodayIsoDate,
  isDateInRange,
  resolveReservationType,
  sortReservationsByDateTime,
  type ReservationMemberSummary,
  type ReservationRange,
  type ReservationRecord,
  type ReservationStatus,
  type ReservationType,
} from './reservation-meta';

type ReservationViewRecord = ReservationRecord & {
  type: ReservationType;
};

type StatusFilter = 'ALL' | ReservationStatus;
type TypeFilter = 'ALL' | ReservationType;

interface ReservationManagerProps {
  initialDate?: string;
  initialReservationId?: number | null;
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getWeekStartIso(referenceDate: Date = new Date()) {
  const weekStart = new Date(referenceDate);
  weekStart.setDate(referenceDate.getDate() - ((referenceDate.getDay() + 6) % 7));
  return getKoreaTodayIsoDate(weekStart);
}

export function ReservationManager({
  initialDate,
  initialReservationId = null,
}: ReservationManagerProps) {
  const resolvedInitialDate = isIsoDate(initialDate ?? '') ? initialDate! : getKoreaTodayIsoDate();
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [members, setMembers] = useState<ReservationMemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [rangeFilter, setRangeFilter] = useState<ReservationRange>('MONTH');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [calendarMonth, setCalendarMonth] = useState(() => getMonthAnchor(new Date(`${resolvedInitialDate}T00:00:00`)));
  const [selectedDate, setSelectedDate] = useState(() => resolvedInitialDate);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(initialReservationId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<ReservationRecord | null>(null);
  const didMountRef = useRef(false);

  const initialTargetReservation = useMemo(() => {
    if (!initialReservationId) {
      return null;
    }

    return reservations.find((reservation) => reservation.id === initialReservationId) ?? null;
  }, [initialReservationId, reservations]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [reservationResponse, memberResponse] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/members'),
      ]);

      if (!reservationResponse.ok || !memberResponse.ok) {
        throw new Error('데이터를 불러오지 못했습니다.');
      }

      const [reservationData, memberData] = await Promise.all([
        reservationResponse.json(),
        memberResponse.json(),
      ]);

      setReservations(reservationData);
      setMembers(memberData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (rangeFilter === 'TODAY') {
      const today = new Date();
      setCalendarMonth(getMonthAnchor(today));
      setSelectedDate(getKoreaTodayIsoDate(today));
      return;
    }

    if (rangeFilter === 'WEEK') {
      const weekStartIso = getWeekStartIso();
      const weekStartDate = new Date(`${weekStartIso}T00:00:00`);
      setCalendarMonth(getMonthAnchor(weekStartDate));
      setSelectedDate(weekStartIso);
      return;
    }

    const today = new Date();
    const calendarMonthKey = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}`;
    const todayMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    setSelectedDate(calendarMonthKey === todayMonthKey ? getKoreaTodayIsoDate(today) : getKoreaTodayIsoDate(calendarMonth));
  }, [rangeFilter]);

  const reservationsWithType = useMemo<ReservationViewRecord[]>(() => {
    return reservations.map((reservation) => ({
      ...reservation,
      type: resolveReservationType(reservation),
    }));
  }, [reservations]);

  const visibleReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reservationsWithType.filter((reservation) => {
      const rangeReferenceDate = rangeFilter === 'MONTH' ? calendarMonth : new Date();
      const matchesRange = isDateInRange(reservation.date, rangeFilter, rangeReferenceDate);
      const matchesStatus = statusFilter === 'ALL' || reservation.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || reservation.type === typeFilter;
      const matchesQuery =
        !query ||
        [
          reservation.date,
          reservation.time,
          reservation.status,
          reservation.type,
          reservation.memo,
          reservation.member.name,
          reservation.member.phone,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchesRange && matchesStatus && matchesType && matchesQuery;
    });
  }, [calendarMonth, rangeFilter, reservationsWithType, search, statusFilter, typeFilter]);

  const countsByDate = useMemo(() => {
    return visibleReservations.reduce<Record<string, number>>((accumulator, reservation) => {
      accumulator[reservation.date] = (accumulator[reservation.date] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [visibleReservations]);

  const statusCounts = useMemo(() => {
    return visibleReservations.reduce(
      (accumulator, reservation) => {
        accumulator[reservation.status] += 1;
        return accumulator;
      },
      {
        PENDING: 0,
        CONFIRMED: 0,
        COMPLETED: 0,
        CANCELLED: 0,
        NO_SHOW: 0,
      }
    );
  }, [visibleReservations]);

  const dayReservations = useMemo(() => {
    return visibleReservations
      .filter((reservation) => reservation.date === selectedDate)
      .sort(sortReservationsByDateTime);
  }, [selectedDate, visibleReservations]);

  const selectedReservation =
    dayReservations.find((reservation) => reservation.id === selectedReservationId) ??
    dayReservations[0] ??
    null;

  useEffect(() => {
    if (!initialTargetReservation) {
      return;
    }

    setSelectedDate(initialTargetReservation.date);
    setCalendarMonth(getMonthAnchor(new Date(`${initialTargetReservation.date}T00:00:00`)));
    setSelectedReservationId(initialTargetReservation.id);
  }, [initialTargetReservation]);

  useEffect(() => {
    if (initialReservationId && initialTargetReservation) {
      return;
    }

    if (dayReservations.length === 0) {
      if (!initialReservationId) {
        setSelectedReservationId(null);
      }

      return;
    }

    if (!dayReservations.some((reservation) => reservation.id === selectedReservationId)) {
      setSelectedReservationId(dayReservations[0].id);
    }
  }, [dayReservations, initialReservationId, initialTargetReservation, selectedReservationId]);

  useEffect(() => {
    if (!selectedReservationId) return;

    const element = document.getElementById(`reservation-row-${selectedReservationId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedReservationId, dayReservations]);

  const openCreateForm = () => {
    setEditingReservation(null);
    setIsFormOpen(true);
  };

  const openEditForm = (reservation: ReservationRecord) => {
    setEditingReservation(reservation);
    setIsFormOpen(true);
  };

  const removeReservation = async (reservation: ReservationRecord) => {
    const confirmed = window.confirm('예약을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('예약 삭제에 실패했습니다.');
      }

      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '예약 삭제에 실패했습니다.');
    }
  };

  const submitReservation = async (values: {
    memberId: number;
    date: string;
    time: string;
    status: ReservationStatus;
    memo: string;
  }) => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(
        editingReservation ? `/api/reservations/${editingReservation.id}` : '/api/reservations',
        {
          method: editingReservation ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error(editingReservation ? '예약 수정에 실패했습니다.' : '예약 등록에 실패했습니다.');
      }

      setIsFormOpen(false);
      setEditingReservation(null);
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '예약 처리에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);

    if (date.slice(0, 7) !== `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}`) {
      setCalendarMonth(new Date(`${date}T00:00:00`));
    }
  };

  const handlePreviousMonth = () => {
    setCalendarMonth((current) => {
      const nextMonth = new Date(current.getFullYear(), current.getMonth() - 1, 1);

      if (rangeFilter === 'MONTH') {
        setSelectedDate(getKoreaTodayIsoDate(nextMonth));
      }

      return nextMonth;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth((current) => {
      const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);

      if (rangeFilter === 'MONTH') {
        setSelectedDate(getKoreaTodayIsoDate(nextMonth));
      }

      return nextMonth;
    });
  };

  const handleOpenMember = (reservation: ReservationRecord) => {
    setSelectedReservationId(reservation.id);
  };

  const selectedMember = selectedReservation?.member ?? null;
  const selectedType = selectedReservation ? resolveReservationType(selectedReservation) : null;
  const selectedDateCount = dayReservations.length;

  return (
    <>
      <div className="reservation-manager">
        <div className="hero card">
          <div className="hero-copy">
            <div className="eyebrow">
              <CalendarRange size={16} />
              <span>Reservation Calendar</span>
            </div>
            <h2>월간 캘린더로 예약 흐름을 한눈에 관리합니다.</h2>
            <p>
              날짜별 예약 수를 확인하고, 일간 리스트와 회원 이력까지 바로 연결해 관리할 수 있습니다.
            </p>
          </div>

          <div className="hero-actions">
            <Badge>{`선택 날짜 ${formatDateLabel(selectedDate)}`}</Badge>
            <Button variant="primary" icon={<Plus size={16} />} onClick={openCreateForm}>
              예약 등록
            </Button>
          </div>
        </div>

        <div className="stats-grid">
          <Card>
            <div className="stat-label">전체 예약</div>
            <div className="stat-value">{visibleReservations.length}</div>
          </Card>
          <Card>
            <div className="stat-label">대기</div>
            <div className="stat-value">{statusCounts.PENDING}</div>
          </Card>
          <Card>
            <div className="stat-label">확정</div>
            <div className="stat-value">{statusCounts.CONFIRMED}</div>
          </Card>
          <Card>
            <div className="stat-label">완료</div>
            <div className="stat-value">{statusCounts.COMPLETED}</div>
          </Card>
        </div>

        <Card className="filter-card">
          <div className="filter-grid">
            <div className="filter-section">
              <div className="filter-label">
                <Filter size={16} />
                <span>기간</span>
              </div>
              <div className="quick-filters">
                {(Object.keys(RESERVATION_RANGE_LABELS) as ReservationRange[]).map((range) => (
                  <Button
                    key={range}
                    type="button"
                    size="sm"
                    variant={rangeFilter === range ? 'primary' : 'soft'}
                    onClick={() => setRangeFilter(range)}
                  >
                    {RESERVATION_RANGE_LABELS[range]}
                  </Button>
                ))}
              </div>
            </div>

            <label className="search">
              <Search size={16} />
              <Input
                placeholder="회원명, 전화번호, 날짜, 메모 검색"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="filter-grid secondary">
            <div className="select-group">
              <label htmlFor="status-filter">상태</label>
              <select
                id="status-filter"
                className="field"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value="ALL">전체</option>
                {RESERVATION_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-group">
              <label htmlFor="type-filter">예약 유형</label>
              <select
                id="type-filter"
                className="field"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
              >
                {RESERVATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="summary-chip">
              <Users size={16} />
              <span>{selectedDateCount}건 선택됨</span>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}
        </Card>

        <div className="content-grid">
          <div className="main-column">
            <ReservationCalendar
              month={calendarMonth}
              selectedDate={selectedDate}
              countsByDate={countsByDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              onSelectDate={handleSelectDate}
            />

            <ReservationDayList
              date={selectedDate}
              reservations={dayReservations}
              selectedReservationId={selectedReservationId}
              onSelectReservation={handleOpenMember}
              onEdit={openEditForm}
              onDelete={removeReservation}
              onOpenMember={handleOpenMember}
            />
          </div>

          <div className="side-column">
            <Card className="member-panel">
              <div className="member-panel-header">
                <div>
                  <p className="eyebrow">RELATED MEMBER</p>
                  <h3>연결 회원</h3>
                </div>
                <Link href="/admin/members" className="member-link">
                  회원관리 열기
                </Link>
              </div>

              {selectedReservation && selectedMember ? (
                <div className="member-stack">
                  <div className="member-summary">
                    <div>
                      <div className="member-name">{selectedMember.name}</div>
                      <div className="member-phone">{selectedMember.phone}</div>
                    </div>

                    <div className="member-badges">
                      <ReservationStatusBadge status={selectedReservation.status} />
                      {selectedType && <ReservationTypeBadge type={selectedType} />}
                    </div>
                  </div>

                  <div className="member-details">
                    <div className="detail-row">
                      <span>예약일</span>
                      <b>{selectedReservation.date}</b>
                    </div>
                    <div className="detail-row">
                      <span>시간</span>
                      <b>{selectedReservation.time}</b>
                    </div>
                    <div className="detail-row">
                      <span>메모</span>
                      <b>{selectedReservation.memo || '-'}</b>
                    </div>
                  </div>

                  <ReservationHistory memberId={selectedMember.id} memberName={selectedMember.name} />
                </div>
              ) : (
                <div className="member-empty">
                  <CalendarRange size={30} />
                  <p>날짜의 예약을 선택하면 회원 정보와 이력이 표시됩니다.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <ReservationForm
        isOpen={isFormOpen}
        members={members}
        reservation={editingReservation}
        isSaving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitReservation}
      />

      <ButtonStyles />
      <BadgeStyles />
      <CardStyles />
      <InputStyles />
      <ModalStyles />

      <style jsx>{`
        .reservation-manager {
          display: grid;
          gap: 16px;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          background: linear-gradient(135deg, rgba(31, 122, 89, 0.08), rgba(255, 255, 255, 0.92));
          border-radius: 24px;
          padding: 24px;
        }

        .hero-copy {
          display: grid;
          gap: 10px;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--green);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero h2 {
          margin: 0;
          font-size: 26px;
          line-height: 1.2;
        }

        .hero p {
          margin: 0;
          color: var(--muted);
          max-width: 640px;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--muted);
          font-weight: 700;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--ink);
        }

        .filter-card {
          display: grid;
          gap: 16px;
          padding: 20px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 14px;
          align-items: end;
        }

        .filter-grid.secondary {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: center;
        }

        .filter-section {
          display: grid;
          gap: 10px;
        }

        .filter-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
        }

        .quick-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .search {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: #fff;
          min-height: 48px;
        }

        .search :global(.input-group) {
          flex: 1;
        }

        .search :global(.field) {
          border: 0;
          padding-left: 0;
        }

        .select-group {
          display: grid;
          gap: 7px;
        }

        .select-group label {
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
        }

        .summary-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 14px;
          background: var(--mint);
          color: var(--green);
          font-size: 14px;
          font-weight: 800;
        }

        .error-banner {
          padding: 12px 14px;
          border-radius: 12px;
          background: #fff3f3;
          color: #9c2f2f;
          font-size: 14px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
          gap: 16px;
          align-items: start;
        }

        .main-column,
        .side-column {
          display: grid;
          gap: 16px;
        }

        .member-panel {
          display: grid;
          gap: 16px;
          padding: 20px;
          position: sticky;
          top: 80px;
        }

        .member-panel-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .member-panel-header h3 {
          margin: 0;
          font-size: 20px;
        }

        .member-link {
          font-size: 13px;
          font-weight: 800;
          color: var(--green);
        }

        .member-stack {
          display: grid;
          gap: 14px;
        }

        .member-summary {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          padding: 14px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(31, 122, 89, 0.06), rgba(255, 255, 255, 0.96));
        }

        .member-name {
          font-size: 18px;
          font-weight: 800;
        }

        .member-phone {
          margin-top: 4px;
          color: var(--muted);
          font-size: 13px;
        }

        .member-badges {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
        }

        .member-details {
          display: grid;
          gap: 10px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--line);
        }

        .detail-row span {
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
        }

        .detail-row b {
          text-align: right;
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
        }

        .member-empty {
          min-height: 320px;
          display: grid;
          place-items: center;
          text-align: center;
          color: var(--muted);
          gap: 12px;
          padding: 20px 12px;
        }

        .member-empty p {
          margin: 0;
          max-width: 240px;
        }

        @media (max-width: 1120px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .member-panel {
            position: relative;
            top: 0;
          }
        }

        @media (max-width: 920px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .filter-grid,
          .filter-grid.secondary {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .hero {
            flex-direction: column;
          }

          .hero-actions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 560px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </>
  );
}
