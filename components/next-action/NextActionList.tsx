'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Modal, TextArea } from '@/components/ui';
import { NextActionPriorityBadge } from './NextActionPriorityBadge';
import { NextActionStatusBadge } from './NextActionStatusBadge';
import {
  NEXT_ACTION_PRIORITY_LABELS,
  NEXT_ACTION_STATUS_LABELS,
  NEXT_ACTION_TYPE_LABELS,
  sortNextActionsByPriority,
  type NextActionPriority,
  type NextActionRecord,
  type NextActionStatus,
  type NextActionType,
} from './next-action-meta';

interface NextActionListProps {
  memberId: number;
}

type EditableNextAction = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  type: NextActionType;
  priority: NextActionPriority;
  status: NextActionStatus;
};

const TYPE_OPTIONS = Object.entries(NEXT_ACTION_TYPE_LABELS).map(([value, label]) => ({
  value: value as NextActionType,
  label,
}));

const PRIORITY_OPTIONS = Object.entries(NEXT_ACTION_PRIORITY_LABELS).map(
  ([value, label]) => ({
    value: value as NextActionPriority,
    label,
  })
);

const STATUS_OPTIONS = Object.entries(NEXT_ACTION_STATUS_LABELS).map(([value, label]) => ({
  value: value as NextActionStatus,
  label,
}));

export function NextActionList({ memberId }: NextActionListProps) {
  const [items, setItems] = useState<NextActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditableNextAction | null>(null);

  const loadItems = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/next-actions?memberId=${memberId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Next Action 목록을 불러오지 못했습니다.');
      }

      const data: NextActionRecord[] = await response.json();
      setItems(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Next Action 목록을 불러오지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, [memberId]);

  const sortedItems = useMemo(() => {
    return [...items].sort(sortNextActionsByPriority);
  }, [items]);

  const openCreateModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (item: NextActionRecord) => {
    setEditing({
      id: item.id,
      title: item.title,
      description: item.description,
      dueDate: item.dueDate,
      type: item.type,
      priority: item.priority,
      status: item.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const payload = {
      memberId,
      title: String(form.get('title') ?? '').trim(),
      description: String(form.get('description') ?? '').trim(),
      dueDate: String(form.get('dueDate') ?? ''),
      type: String(form.get('type') ?? 'FOLLOW_UP'),
      priority: String(form.get('priority') ?? 'MEDIUM'),
      status: String(form.get('status') ?? 'TODO'),
    };

    try {
      setSaving(true);
      setError('');

      const response = await fetch(
        editing ? `/api/next-actions/${editing.id}` : '/api/next-actions',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? 'Next Action 저장에 실패했습니다.');
      }

      setModalOpen(false);
      setEditing(null);
      await loadItems();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Next Action 저장에 실패했습니다.'
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (item: NextActionRecord) => {
    if (!window.confirm(`${item.title} 작업을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setError('');

      const response = await fetch(`/api/next-actions/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? 'Next Action 삭제에 실패했습니다.');
      }

      await loadItems();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Next Action 삭제에 실패했습니다.'
      );
    }
  };

  const onComplete = async (item: NextActionRecord) => {
    try {
      setError('');

      const response = await fetch(`/api/next-actions/${item.id}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? 'Next Action 완료 처리에 실패했습니다.');
      }

      await loadItems();
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : 'Next Action 완료 처리에 실패했습니다.'
      );
    }
  };

  return (
    <Card className="next-action-list-card">
      <div className="head-row">
        <div>
          <h4>Next Action</h4>
          <p>회원별 후속 작업을 생성하고 완료까지 관리합니다.</p>
        </div>

        <Button type="button" variant="primary" size="sm" icon={<Plus size={16} />} onClick={openCreateModal}>
          새 작업
        </Button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="state-box">작업 목록을 불러오는 중입니다...</div>
      ) : sortedItems.length === 0 ? (
        <div className="state-box">등록된 작업이 없습니다.</div>
      ) : (
        <div className="list-wrap">
          {sortedItems.map((item) => (
            <article key={item.id} className="list-item">
              <div className="content-col">
                <div className="title-row">
                  <strong>{item.title}</strong>
                  <div className="badge-row">
                    <NextActionPriorityBadge priority={item.priority} />
                    <NextActionStatusBadge status={item.status} />
                  </div>
                </div>

                <p>{item.description || '설명 없음'}</p>

                <div className="meta-row">
                  <span>{item.dueDate}</span>
                  <span>{NEXT_ACTION_TYPE_LABELS[item.type]}</span>
                </div>
              </div>

              <div className="action-col">
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  icon={<Pencil size={14} />}
                  onClick={() => openEditModal(item)}
                >
                  수정
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={() => void onDelete(item)}
                >
                  삭제
                </Button>
                {item.status !== 'COMPLETED' && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={<Check size={14} />}
                    onClick={() => void onComplete(item)}
                  >
                    완료
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={editing ? 'Next Action 수정' : 'Next Action 생성'}
        onClose={() => {
          if (saving) return;
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <form className="form-grid" onSubmit={(event) => void onSubmit(event)}>
          <Input
            name="title"
            label="작업명"
            defaultValue={editing?.title ?? ''}
            required
            placeholder="예: 예약 확인 전화"
          />

          <TextArea
            name="description"
            label="설명"
            defaultValue={editing?.description ?? ''}
            placeholder="상세 메모를 입력하세요"
          />

          <Input
            name="dueDate"
            type="date"
            label="기한"
            defaultValue={editing?.dueDate ?? ''}
            required
          />

          <div className="input-group">
            <label className="input-label" htmlFor="nextActionType">유형</label>
            <select
              id="nextActionType"
              name="type"
              className="field"
              defaultValue={editing?.type ?? 'FOLLOW_UP'}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="nextActionPriority">우선순위</label>
            <select
              id="nextActionPriority"
              name="priority"
              className="field"
              defaultValue={editing?.priority ?? 'MEDIUM'}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="nextActionStatus">상태</label>
            <select
              id="nextActionStatus"
              name="status"
              className="field"
              defaultValue={editing?.status ?? 'TODO'}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary" isLoading={saving}>
            {editing ? '수정 저장' : '작업 생성'}
          </Button>
        </form>
      </Modal>

      <style jsx>{`
        .next-action-list-card {
          display: grid;
          gap: 14px;
          padding: 16px;
        }

        .head-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        h4 {
          margin: 0;
          font-size: 17px;
        }

        .head-row p {
          margin: 4px 0 0;
          font-size: 13px;
          color: var(--muted);
        }

        .error-box {
          padding: 10px 12px;
          border: 1px solid #efc8c8;
          border-radius: 12px;
          background: #fff3f3;
          color: #9c2f2f;
          font-size: 13px;
        }

        .state-box {
          border: 1px dashed var(--line);
          border-radius: 14px;
          color: var(--muted);
          font-size: 13px;
          text-align: center;
          padding: 14px;
        }

        .list-wrap {
          display: grid;
          gap: 10px;
        }

        .list-item {
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .content-col {
          display: grid;
          gap: 6px;
        }

        .title-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .title-row strong {
          font-size: 15px;
          color: var(--ink);
        }

        .badge-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .content-col p {
          margin: 0;
          font-size: 13px;
          color: #3e4542;
          line-height: 1.45;
          white-space: pre-wrap;
        }

        .meta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          color: var(--muted);
          font-size: 12px;
        }

        .action-col {
          display: grid;
          gap: 6px;
          align-content: start;
        }

        .form-grid {
          display: grid;
          gap: 12px;
        }

        @media (max-width: 720px) {
          .list-item {
            flex-direction: column;
          }

          .action-col {
            grid-auto-flow: column;
            justify-content: start;
          }
        }
      `}</style>
    </Card>
  );
}
