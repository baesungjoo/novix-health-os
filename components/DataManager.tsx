'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  reservations as seedReservations,
  Member,
  Reservation,
  ReservationStatus,
} from '@/lib/demo-data';
import { MemberDetailPanel } from './MemberDetailPanel';
import { MemberForm } from './member/MemberForm';
import { MemberTable } from './member/MemberTable';
import { MemberToolbar } from './member/MemberToolbar';
import {
  Button,
  Badge,
  Modal,
  Card,
  ButtonStyles,
  BadgeStyles,
  ModalStyles,
  TableStyles,
  CardStyles,
  InputStyles,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  Input,
  TextArea,
} from './ui';

type DetailTab = 'info' | 'reservations' | 'next-action' | 'counseling' | 'purchases' | 'notes';

export function MembersManager() {
  const [items, setItems] = useState<Member[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('info');

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/members', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('회원 목록을 불러오지 못했습니다.');
      }

      const members: Member[] = await response.json();
      setItems(members);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter((member) =>
      [member.name, member.phone, member.interest, member.memo]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [items, q]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim(),
      birthday: String(form.get('birthday') ?? ''),
      visits: editing?.visits ?? 0,
      interest: String(form.get('interest') ?? '').trim(),
      memo: String(form.get('memo') ?? '').trim(),
    };

    try {
      setSaving(true);
      setError('');

      const response = await fetch(
        editing ? `/api/members/${editing.id}` : '/api/members',
        {
          method: editing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? '회원 저장에 실패했습니다.');
      }

      const savedMember: Member = await response.json();

      setItems((current) =>
        editing
          ? current.map((member) =>
              member.id === savedMember.id ? savedMember : member,
            )
          : [savedMember, ...current],
      );

      setEditing(null);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (member: Member) => {
    if (!window.confirm(`${member.name} 회원을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setError('');

      const response = await fetch(`/api/members/${member.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? '회원 삭제에 실패했습니다.');
      }

      setItems((current) => current.filter((item) => item.id !== member.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <MemberToolbar
        query={q}
        onQueryChange={setQ}
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
      />

      {error && (
        <div className="api-error">
          <span>{error}</span>
          <button type="button" onClick={() => void loadMembers()}>
            다시 시도
          </button>
        </div>
      )}

      <p className="summary">
        전체 회원 <b>{items.length}명</b>
        {q && (
          <>
            {' '}
            · 검색 결과 <b>{filtered.length}명</b>
          </>
        )}
      </p>

      <div className="members-container">
        <MemberTable
          members={filtered}
          loading={loading}
          selectedMemberId={selectedMember?.id ?? null}
          onSelect={setSelectedMember}
          onEdit={(member) => {
            setEditing(member);
            setOpen(true);
          }}
          onDelete={(member) => void remove(member)}
        />

        {selectedMember && (
          <MemberDetailPanel
            member={selectedMember}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as DetailTab)}
            onClose={() => {
              setSelectedMember(null);
              setActiveTab('info');
            }}
          />
        )}
      </div>

      <MemberForm
        isOpen={open}
        editing={editing}
        saving={saving}
        onClose={() => {
          if (saving) return;
          setOpen(false);
          setEditing(null);
        }}
        onSubmit={save}
      />

      <ButtonStyles />
      <BadgeStyles />
      <ModalStyles />
      <TableStyles />
      <CommonStyle />
    </>
  );
}

export function ReservationsManager() {
  const [items, setItems] = useState<Reservation[]>(seedReservations);
  const [open, setOpen] = useState(false);
  const statuses: ReservationStatus[] = ['대기', '확정', '완료', '취소'];

  const add = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setItems((current) => [
      {
        id: Date.now(),
        date: String(form.get('date')),
        time: String(form.get('time')),
        name: String(form.get('name')),
        phone: String(form.get('phone')),
        status: '대기',
        memo: String(form.get('memo')),
      },
      ...current,
    ]);

    setOpen(false);
  };

  return (
    <>
      <div className="toolbar">
        <Badge>
          오늘 예약 {items.filter((item) => item.date === '2026-07-23').length}건
        </Badge>

        <Button variant="primary" icon={<Plus size={17} />} onClick={() => setOpen(true)}>
          예약 등록
        </Button>
      </div>

      <Card className="table-wrap" style={{ padding: 0 }}>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>날짜</TableHeaderCell>
              <TableHeaderCell>시간</TableHeaderCell>
              <TableHeaderCell>이름</TableHeaderCell>
              <TableHeaderCell>연락처</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>내용</TableHeaderCell>
              <TableHeaderCell>상태 변경</TableHeaderCell>
            </tr>
          </TableHeader>

          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date}</TableCell>
                <TableCell>
                  <b>{item.time}</b>
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>
                  <Badge>{item.status}</Badge>
                </TableCell>
                <TableCell>{item.memo}</TableCell>
                <TableCell>
                  <select
                    className="field"
                    value={item.status}
                    onChange={(event) =>
                      setItems((current) =>
                        current.map((reservation) =>
                          reservation.id === item.id
                            ? {
                                ...reservation,
                                status: event.target.value as ReservationStatus,
                              }
                            : reservation,
                        ),
                      )
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={open}
        title="예약 등록"
        onClose={() => setOpen(false)}
      >
        <form onSubmit={add} className="form">
          <Input name="date" type="date" required />
          <Input name="time" type="time" required />
          <Input name="name" placeholder="이름" required />
          <Input name="phone" placeholder="연락처" required />
          <TextArea name="memo" placeholder="상담 내용" />
          <Button variant="primary" type="submit">예약 등록</Button>
        </form>
      </Modal>

      <CommonStyle />
    </>
  );
}

function CommonStyle() {
  return (
    <style jsx global>{`
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin: 18px 0 12px;
      }

      .search {
        width: min(520px, 100%);
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 0 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .search input {
        border: 0;
        outline: 0;
        padding: 12px 0;
        width: 100%;
        background: transparent;
      }

      .summary {
        margin: 0 0 12px;
        color: var(--muted);
        font-size: 14px;
      }

      .summary b {
        color: var(--green);
      }

      .api-error {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        padding: 12px 14px;
        border: 1px solid #efc8c8;
        border-radius: 12px;
        background: #fff3f3;
        color: #9c2f2f;
        font-size: 14px;
      }

      .api-error button {
        border: 1px solid #d7a9a9;
        border-radius: 8px;
        background: #fff;
        padding: 7px 10px;
        cursor: pointer;
        white-space: nowrap;
      }

      .members-container {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 16px;
        align-items: start;
      }

      .table-wrap {
        overflow-x: auto;
      }

      .member-row {
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .member-row:hover {
        background-color: #f9f9f9;
      }

      .member-row.selected {
        background-color: #f0f8f5;
      }

      .actions {
        display: flex;
        gap: 6px;
      }

      .empty {
        text-align: center;
        padding: 42px !important;
        color: var(--muted);
      }

      .form {
        display: grid;
        gap: 12px;
      }

      @media (max-width: 1024px) {
        .members-container {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 700px) {
        .toolbar {
          align-items: stretch;
        }

        .search {
          min-width: 0;
          flex: 1;
        }

        .table-wrap {
          overflow-x: auto;
        }

        .table {
          min-width: 760px;
        }
      }
    `}</style>
  );
}
