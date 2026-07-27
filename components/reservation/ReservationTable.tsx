'use client';

import { IconButton, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@/components/ui';
import { Edit2, Trash2 } from 'lucide-react';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import type { ReservationRecord } from './reservation-meta';

interface ReservationTableProps {
  reservations: ReservationRecord[];
  isLoading?: boolean;
  onEdit: (reservation: ReservationRecord) => void;
  onDelete: (reservation: ReservationRecord) => void;
}

export function ReservationTable({
  reservations,
  isLoading = false,
  onEdit,
  onDelete,
}: ReservationTableProps) {
  return (
    <div className="table-wrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>예약일</TableHeaderCell>
            <TableHeaderCell>시간</TableHeaderCell>
            <TableHeaderCell>회원</TableHeaderCell>
            <TableHeaderCell>연락처</TableHeaderCell>
            <TableHeaderCell>상태</TableHeaderCell>
            <TableHeaderCell>메모</TableHeaderCell>
            <TableHeaderCell>관리</TableHeaderCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="empty-state">예약을 불러오는 중입니다...</TableCell>
            </TableRow>
          )}

          {!isLoading && reservations.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="empty-state">등록된 예약이 없습니다.</TableCell>
            </TableRow>
          )}

          {!isLoading && reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.date}</TableCell>
              <TableCell>{reservation.time}</TableCell>
              <TableCell>{reservation.member.name}</TableCell>
              <TableCell>{reservation.member.phone}</TableCell>
              <TableCell>
                <ReservationStatusBadge status={reservation.status} />
              </TableCell>
              <TableCell className="memo">{reservation.memo || '-'}</TableCell>
              <TableCell>
                <div className="actions">
                  <IconButton
                    icon={<Edit2 size={16} />}
                    title="예약 수정"
                    aria-label="예약 수정"
                    onClick={() => onEdit(reservation)}
                  />
                  <IconButton
                    icon={<Trash2 size={16} />}
                    title="예약 삭제"
                    aria-label="예약 삭제"
                    variant="danger"
                    onClick={() => onDelete(reservation)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 34px 12px !important;
          color: var(--muted);
        }

        .memo {
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .actions {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
