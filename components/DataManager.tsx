'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-react';
import {
  reservations as seedReservations,
  Member,
  Reservation,
  ReservationStatus,
} from '@/lib/demo-data';

export function MembersManager() {
  const [items, setItems] = useState<Member[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input
            placeholder="이름, 전화번호, 관심 분야 검색"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={17} />
          회원 등록
        </button>
      </div>

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

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>회원명</th>
              <th>연락처</th>
              <th>생년월일</th>
              <th>방문</th>
              <th>관심 분야</th>
              <th>메모</th>
              <th>관리</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="empty">
                  회원 정보를 불러오는 중입니다.
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((member) => (
                <tr key={member.id}>
                  <td>
                    <b>{member.name}</b>
                  </td>
                  <td>{member.phone}</td>
                  <td>{member.birthday}</td>
                  <td>{member.visits}회</td>
                  <td>
                    <span className="badge">{member.interest || '미입력'}</span>
                  </td>
                  <td>{member.memo || '-'}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setEditing(member);
                          setOpen(true);
                        }}
                        title="수정"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="icon-btn danger"
                        onClick={() => void remove(member)}
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal
          title={editing ? '회원 정보 수정' : '신규 회원 등록'}
          close={() => {
            if (saving) return;
            setOpen(false);
            setEditing(null);
          }}
        >
          <form onSubmit={save} className="form">
            <label>
              이름
              <input
                className="field"
                name="name"
                defaultValue={editing?.name}
                required
              />
            </label>

            <label>
              연락처
              <input
                className="field"
                name="phone"
                defaultValue={editing?.phone}
                placeholder="010-0000-0000"
                required
              />
            </label>

            <label>
              생년월일
              <input
                className="field"
                name="birthday"
                type="date"
                defaultValue={editing?.birthday}
                required
              />
            </label>

            <label>
              관심 분야
              <input
                className="field"
                name="interest"
                defaultValue={editing?.interest}
                placeholder="예: 허리·관절"
              />
            </label>

            <label>
              메모
              <textarea
                className="field"
                name="memo"
                defaultValue={editing?.memo}
              />
            </label>

            <button className="btn btn-primary" disabled={saving}>
              {saving
                ? '저장 중...'
                : editing
                  ? '수정 내용 저장'
                  : '회원 등록'}
            </button>
          </form>
        </Modal>
      )}

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
        <span className="badge">
          오늘 예약 {items.filter((item) => item.date === '2026-07-23').length}건
        </span>

        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Plus size={17} />
          예약 등록
        </button>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>시간</th>
              <th>이름</th>
              <th>연락처</th>
              <th>상태</th>
              <th>내용</th>
              <th>상태 변경</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>
                  <b>{item.time}</b>
                </td>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>
                  <span className="badge">{item.status}</span>
                </td>
                <td>{item.memo}</td>
                <td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="예약 등록" close={() => setOpen(false)}>
          <form onSubmit={add} className="form">
            <input className="field" name="date" type="date" required />
            <input className="field" name="time" type="time" required />
            <input className="field" name="name" placeholder="이름" required />
            <input className="field" name="phone" placeholder="연락처" required />
            <textarea className="field" name="memo" placeholder="상담 내용" />
            <button className="btn btn-primary">예약 등록</button>
          </form>
        </Modal>
      )}

      <CommonStyle />
    </>
  );
}

function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overlay" onMouseDown={close}>
      <div
        className="card modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button onClick={close} type="button">
            <X />
          </button>
        </header>

        {children}
      </div>
    </div>
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

      .actions {
        display: flex;
        gap: 6px;
      }

      .icon-btn {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border: 1px solid var(--line);
        border-radius: 9px;
        background: #fff;
        cursor: pointer;
      }

      .icon-btn.danger {
        color: #b63737;
      }

      .empty {
        text-align: center;
        padding: 42px !important;
        color: var(--muted);
      }

      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 30, 22, 0.45);
        z-index: 50;
        display: grid;
        place-items: center;
        padding: 18px;
      }

      .modal {
        width: min(520px, 100%);
        padding: 24px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .modal header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
      }

      .modal header h2 {
        margin: 0;
      }

      .modal header button {
        background: none;
        border: 0;
        cursor: pointer;
      }

      .form {
        display: grid;
        gap: 12px;
      }

      .form label {
        display: grid;
        gap: 7px;
        font-weight: 700;
        font-size: 14px;
      }

      .form textarea {
        min-height: 100px;
        resize: vertical;
      }

      .form button:disabled {
        cursor: wait;
        opacity: 0.7;
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
