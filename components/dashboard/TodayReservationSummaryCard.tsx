'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock, RefreshCcw } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import {
  formatDateLabel,
  getKoreaTodayRange,
  isIsoDateInKoreaRange,
  isUpcomingScheduledReservation,
  resolveReservationType,
  sortReservationsByDateTime,
  type ReservationRecord,
} from '@/components/reservation/reservation-meta';
import { ReservationStatusBadge } from '@/components/reservation/ReservationStatusBadge';
import { ReservationTypeBadge } from '@/components/reservation/ReservationTypeBadge';

type ReservationWithDerivedType = ReservationRecord & {
  type: ReturnType<typeof resolveReservationType>;
};

export function TodayReservationSummaryCard() {
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReservations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reservations', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('예약 데이터를 불러오지 못했습니다.');
      }

      const data: ReservationRecord[] = await response.json();
      setReservations(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '예약 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReservations();
  }, []);

  const todayRange = useMemo(() => getKoreaTodayRange(), []);
  const todayIsoDate = todayRange.isoDate;

  const todayReservations = useMemo(() => {
    return reservations.filter((reservation) => isIsoDateInKoreaRange(reservation.date, todayRange));
  }, [reservations, todayRange]);

  const todayCounts = useMemo(() => {
    return todayReservations.reduce(
      (accumulator, reservation) => {
        accumulator.total += 1;

        if (reservation.status === 'NO_SHOW') {
          accumulator.noShow += 1;
          return accumulator;
        }

        if (reservation.status === 'COMPLETED') {
          accumulator.completed += 1;
          return accumulator;
        }

        if (reservation.status === 'CANCELLED') {
          accumulator.cancelled += 1;
          return accumulator;
        }

        accumulator.scheduled += 1;
        return accumulator;
      },
      {
        total: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
      }
    );
  }, [todayReservations]);

  const upcomingReservations = useMemo(() => {
    return reservations
      .filter((reservation) => isUpcomingScheduledReservation(reservation))
      .sort(sortReservationsByDateTime)
      .slice(0, 5)
      .map((reservation) => ({
        ...reservation,
        type: resolveReservationType(reservation),
      })) as ReservationWithDerivedType[];
  }, [reservations]);

  const todayReservationCount = todayReservations.length;

  return (
    <Card className="today-reservations-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">TODAY RESERVATIONS</p>
          <h2>{formatDateLabel(todayIsoDate)}</h2>
          <p className="description">오늘의 운영 현황과 다음 일정 5건을 실시간으로 보여줍니다.</p>
        </div>

        <div className="header-actions">
          <Button
            type="button"
            variant="default"
            size="sm"
            icon={<RefreshCcw size={15} />}
            onClick={() => void loadReservations()}
            disabled={loading}
          >
            새로고침
          </Button>

          <Link className="manage-link" href={`/admin/reservations?date=${todayIsoDate}`}>
            예약 관리
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="state-box">오늘 예약 데이터를 불러오는 중입니다...</div>
      ) : error ? (
        <div className="state-box error">
          <span>{error}</span>
          <Button type="button" variant="soft" size="sm" onClick={() => void loadReservations()}>
            다시 시도
          </Button>
        </div>
      ) : (
        <>
          <div className="count-grid">
            <article className="count-card emphasis">
              <span>오늘 예약</span>
              <strong>{todayCounts.total}</strong>
            </article>
            <article className="count-card">
              <span>예정</span>
              <strong>{todayCounts.scheduled}</strong>
            </article>
            <article className="count-card">
              <span>완료</span>
              <strong>{todayCounts.completed}</strong>
            </article>
            <article className="count-card">
              <span>취소</span>
              <strong>{todayCounts.cancelled}</strong>
            </article>
            <article className="count-card">
              <span>노쇼</span>
              <strong>{todayCounts.noShow}</strong>
            </article>
          </div>

          <div className="divider" />

          <div className="section-head">
            <div>
              <h3>다음 5건</h3>
              <p>시간순으로 정렬된 예정 예약입니다.</p>
            </div>
            <Badge>{todayReservationCount}건 오늘</Badge>
          </div>

          <div className="upcoming-list">
            {upcomingReservations.length === 0 ? (
              <div className="empty-box">다가오는 예약이 없습니다.</div>
            ) : (
              upcomingReservations.map((reservation) => {
                const href = `/admin/reservations?date=${reservation.date}&reservationId=${reservation.id}`;

                return (
                  <Link className="upcoming-item" key={reservation.id} href={href}>
                    <div className="time-col">
                      <Clock size={16} />
                      <span>{reservation.time}</span>
                    </div>

                    <div className="content-col">
                      <div className="name-row">
                        <strong>{reservation.member.name}</strong>
                        <div className="tag-row">
                          <ReservationStatusBadge status={reservation.status} />
                          <ReservationTypeBadge type={reservation.type} />
                        </div>
                      </div>
                      <div className="meta-row">
                        <span>{reservation.date}</span>
                        <span>{reservation.member.phone}</span>
                        <span>{reservation.memo || '메모 없음'}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="state-foot">
            <CalendarDays size={15} />
            <span>예약 관리 페이지에서 날짜별 상세 내역과 회원 이력을 확인할 수 있습니다.</span>
          </div>
        </>
      )}

      <style jsx>{`
        .today-reservations-card {
          display: grid;
          gap: 18px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(18, 63, 48, 0.02), rgba(255, 255, 255, 0.98));
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
        }

        .eyebrow {
          margin: 0 0 6px;
          color: var(--green);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        h2 {
          margin: 0;
          font-size: 24px;
        }

        .description,
        .section-head p {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .manage-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--green);
          font-weight: 800;
        }

        .count-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .count-card {
          display: grid;
          gap: 8px;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: #fff;
        }

        .count-card.emphasis {
          background: var(--mint);
          border-color: rgba(31, 122, 89, 0.16);
        }

        .count-card span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
        }

        .count-card strong {
          font-size: 24px;
          font-weight: 800;
          color: var(--ink);
        }

        .divider {
          height: 1px;
          background: var(--line);
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .section-head h3 {
          margin: 0;
          font-size: 18px;
        }

        .upcoming-list {
          display: grid;
          gap: 10px;
        }

        .upcoming-item {
          display: grid;
          grid-template-columns: 84px minmax(0, 1fr);
          gap: 14px;
          align-items: center;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: #fff;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }

        .upcoming-item:hover {
          transform: translateY(-1px);
          border-color: rgba(31, 122, 89, 0.24);
          box-shadow: 0 10px 18px rgba(18, 63, 48, 0.08);
        }

        .time-col {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--green);
          font-size: 14px;
          font-weight: 800;
          white-space: nowrap;
        }

        .content-col {
          display: grid;
          gap: 8px;
        }

        .name-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .name-row strong {
          font-size: 15px;
        }

        .tag-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: flex-end;
        }

        .meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          color: var(--muted);
          font-size: 12px;
        }

        .meta-row span {
          position: relative;
        }

        .meta-row span:not(:last-child)::after {
          content: '·';
          margin-left: 10px;
        }

        .state-box,
        .empty-box {
          min-height: 180px;
          display: grid;
          place-items: center;
          text-align: center;
          color: var(--muted);
          border: 1px dashed var(--line);
          border-radius: 18px;
          padding: 18px;
        }

        .state-box.error {
          gap: 12px;
          color: #9c2f2f;
          background: #fff3f3;
          border-color: #efc8c8;
        }

        .state-foot {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 12px;
        }

        @media (max-width: 960px) {
          .count-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .upcoming-item {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .card-header,
          .section-head {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            justify-content: flex-start;
          }

          .count-grid {
            grid-template-columns: 1fr 1fr;
          }

          .name-row {
            flex-direction: column;
          }

          .tag-row {
            justify-content: flex-start;
          }
        }
      `}</style>
    </Card>
  );
}
