'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import type { ReservationRecord } from './reservation-meta';

interface ReservationHistoryProps {
  memberId: number;
  memberName: string;
}

export function ReservationHistory({ memberId, memberName }: ReservationHistoryProps) {
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadReservations = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/reservations?memberId=${memberId}`);
        if (!response.ok) {
          throw new Error('예약 내역을 불러오지 못했습니다.');
        }

        const data = await response.json();
        if (mounted) {
          setReservations(data);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : '예약 내역을 불러오지 못했습니다.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadReservations();

    return () => {
      mounted = false;
    };
  }, [memberId]);

  return (
    <div className="history">
      <div className="history-header">
        <div>
          <h4>{memberName}의 예약</h4>
          <p>회원과 연결된 예약 흐름을 최근 순으로 확인합니다.</p>
        </div>
        <div className="count">{reservations.length}건</div>
      </div>

      {loading && <div className="empty">예약 정보를 불러오는 중입니다...</div>}
      {!loading && error && <div className="empty error">{error}</div>}
      {!loading && !error && reservations.length === 0 && (
        <div className="empty">등록된 예약이 없습니다.</div>
      )}

      <div className="stack">
        {reservations.map((reservation) => (
          <Card key={reservation.id} padding="sm">
            <div className="row">
              <div>
                <div className="date">{reservation.date} · {reservation.time}</div>
                <div className="memo">{reservation.memo || '메모 없음'}</div>
              </div>
              <ReservationStatusBadge status={reservation.status} />
            </div>
          </Card>
        ))}
      </div>

      <style jsx>{`
        .history {
          display: grid;
          gap: 14px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .history-header h4 {
          margin: 0 0 4px;
          font-size: 16px;
        }

        .history-header p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
        }

        .count {
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

        .row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .date {
          font-size: 14px;
          font-weight: 700;
        }

        .memo {
          margin-top: 6px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.45;
        }

        .empty {
          padding: 18px;
          border: 1px dashed var(--line);
          border-radius: 16px;
          color: var(--muted);
          font-size: 14px;
          text-align: center;
        }

        .error {
          color: #9c2f2f;
          background: #fff3f3;
          border-color: #efc8c8;
        }
      `}</style>
    </div>
  );
}
