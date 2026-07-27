'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Modal, TextArea } from '@/components/ui';
import {
  RESERVATION_STATUS_OPTIONS,
  type ReservationMemberSummary,
  type ReservationRecord,
  type ReservationStatus,
} from './reservation-meta';

type ReservationDraft = {
  memberId: string;
  date: string;
  time: string;
  status: ReservationStatus;
  memo: string;
};

interface ReservationFormProps {
  isOpen: boolean;
  members: ReservationMemberSummary[];
  reservation: ReservationRecord | null;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    memberId: number;
    date: string;
    time: string;
    status: ReservationStatus;
    memo: string;
  }) => void;
}

const EMPTY_FORM: ReservationDraft = {
  memberId: '',
  date: '',
  time: '',
  status: 'PENDING',
  memo: '',
};

export function ReservationForm({
  isOpen,
  members,
  reservation,
  isSaving = false,
  onClose,
  onSubmit,
}: ReservationFormProps) {
  const [form, setForm] = useState<ReservationDraft>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      memberId: reservation ? String(reservation.memberId) : members[0]?.id ? String(members[0].id) : '',
      date: reservation?.date ?? '',
      time: reservation?.time ?? '',
      status: reservation?.status ?? 'PENDING',
      memo: reservation?.memo ?? '',
    });
  }, [isOpen, reservation, members]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const memberId = Number(form.memberId);
    if (!memberId || !form.date || !form.time) {
      return;
    }

    onSubmit({
      memberId,
      date: form.date,
      time: form.time,
      status: form.status,
      memo: form.memo,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={reservation ? '예약 수정' : '예약 등록'}>
      <form className="form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" htmlFor="reservation-member">
            회원
          </label>
          <select
            id="reservation-member"
            className="field"
            value={form.memberId}
            onChange={(event) => setForm((current) => ({ ...current, memberId: event.target.value }))}
          >
            <option value="">회원 선택</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} · {member.phone}
              </option>
            ))}
          </select>
        </div>

        <Input
          type="date"
          label="예약일"
          value={form.date}
          onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
        />

        <Input
          type="time"
          label="예약 시간"
          value={form.time}
          onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
        />

        <div className="input-group">
          <label className="input-label" htmlFor="reservation-status">
            상태
          </label>
          <select
            id="reservation-status"
            className="field"
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ReservationStatus }))}
          >
            {RESERVATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <TextArea
          label="메모"
          value={form.memo}
          onChange={(event) => setForm((current) => ({ ...current, memo: event.target.value }))}
          placeholder="예약 상담 메모를 입력하세요"
        />

        <div className="actions">
          <Button type="button" variant="default" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {reservation ? '수정하기' : '등록하기'}
          </Button>
        </div>
      </form>

      <style jsx>{`
        .form {
          display: grid;
          gap: 14px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 4px;
        }
      `}</style>
    </Modal>
  );
}
