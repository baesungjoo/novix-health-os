import { ArrowRight, CalendarDays } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import { ReservationTypeBadge } from './ReservationTypeBadge';
import { formatDateLabel, resolveReservationType, type ReservationRecord } from './reservation-meta';

interface ReservationDayListProps {
  date: string;
  reservations: ReservationRecord[];
  selectedReservationId: number | null;
  onSelectReservation: (reservation: ReservationRecord) => void;
  onEdit: (reservation: ReservationRecord) => void;
  onDelete: (reservation: ReservationRecord) => void;
  onOpenMember: (reservation: ReservationRecord) => void;
}

export function ReservationDayList({
  date,
  reservations,
  selectedReservationId,
  onSelectReservation,
  onEdit,
  onDelete,
  onOpenMember,
}: ReservationDayListProps) {
  return (
    <Card className="day-list-card">
      <div className="day-list-header">
        <div>
          <p className="eyebrow">DAY VIEW</p>
          <h3>
            <CalendarDays size={18} />
            {formatDateLabel(date)}
          </h3>
        </div>

        <div className="total">{reservations.length}건</div>
      </div>

      <div className="stack">
        {reservations.length === 0 ? (
          <div className="empty">선택한 날짜에 예약이 없습니다.</div>
        ) : (
          reservations.map((reservation) => {
            const reservationType = resolveReservationType(reservation);

            return (
              <div
                key={reservation.id}
                id={`reservation-row-${reservation.id}`}
                className={`reservation-row${selectedReservationId === reservation.id ? ' selected' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelectReservation(reservation)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectReservation(reservation);
                  }
                }}
              >
                <div className="row-head">
                  <div>
                    <div className="time">{reservation.time}</div>
                    <div className="member">
                      {reservation.member.name}
                      <span>{reservation.member.phone}</span>
                    </div>
                  </div>

                  <ArrowRight size={16} className="arrow" />
                </div>

                <div className="badges">
                  <ReservationStatusBadge status={reservation.status} />
                  <ReservationTypeBadge type={reservationType} />
                </div>

                <div className="memo">{reservation.memo || '메모 없음'}</div>

                <div className="row-actions">
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenMember(reservation);
                    }}
                  >
                    회원 보기
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="soft"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(reservation);
                    }}
                  >
                    수정
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(reservation);
                    }}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .day-list-card {
          display: grid;
          gap: 14px;
          padding: 20px;
        }

        .day-list-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .eyebrow {
          margin: 0 0 6px;
          color: var(--green);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        h3 {
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
        }

        .total {
          padding: 7px 10px;
          border-radius: 999px;
          background: var(--mint);
          color: var(--green);
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .stack {
          display: grid;
          gap: 10px;
        }

        .reservation-row {
          display: grid;
          gap: 10px;
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: #fff;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          outline: none;
        }

        .reservation-row:focus-visible {
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(31, 122, 89, 0.12);
        }

        .reservation-row:hover {
          transform: translateY(-1px);
          border-color: rgba(31, 122, 89, 0.28);
          box-shadow: 0 10px 18px rgba(18, 63, 48, 0.08);
        }

        .reservation-row.selected {
          border-color: var(--green);
          background: rgba(31, 122, 89, 0.06);
        }

        .row-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .time {
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .member {
          display: grid;
          gap: 3px;
          color: var(--ink);
          font-size: 14px;
          font-weight: 700;
        }

        .member span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 600;
        }

        .arrow {
          color: var(--muted);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .memo {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.45;
        }

        .row-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .empty {
          padding: 18px;
          border: 1px dashed var(--line);
          border-radius: 16px;
          color: var(--muted);
          font-size: 14px;
          text-align: center;
        }
      `}</style>
    </Card>
  );
}
