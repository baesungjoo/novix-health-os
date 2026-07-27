'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { NextActionPriorityBadge } from './NextActionPriorityBadge';
import { NextActionStatusBadge } from './NextActionStatusBadge';
import {
  NEXT_ACTION_PRIORITY_LABELS,
  NEXT_ACTION_TYPE_LABELS,
  sortNextActionsByPriority,
  type NextActionRecord,
} from './next-action-meta';

export function NextActionTodayWidget() {
  const [items, setItems] = useState<NextActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadItems = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/next-actions/today', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('오늘 Next Action을 불러오지 못했습니다.');
      }

      const data: NextActionRecord[] = await response.json();
      setItems(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : '오늘 Next Action을 불러오지 못했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort(sortNextActionsByPriority);
  }, [items]);

  return (
    <Card className="today-next-action-card">
      <div className="header-row">
        <div>
          <p className="eyebrow">TODAY NEXT ACTION</p>
          <h2>오늘 해야 할 일</h2>
          <p className="description">
            우선순위({Object.values(NEXT_ACTION_PRIORITY_LABELS).join(' > ')}) 순으로 정렬됩니다.
          </p>
        </div>

        <div className="header-actions">
          <Button
            type="button"
            variant="default"
            size="sm"
            icon={<RefreshCcw size={15} />}
            onClick={() => void loadItems()}
            disabled={loading}
          >
            새로고침
          </Button>

          <Link className="manage-link" href="/admin/members">
            회원 상세에서 관리
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="state-box">오늘 할 일을 불러오는 중입니다...</div>
      ) : error ? (
        <div className="state-box error">{error}</div>
      ) : sortedItems.length === 0 ? (
        <div className="state-box">오늘 할 일이 없습니다.</div>
      ) : (
        <div className="action-list">
          {sortedItems.map((item) => (
            <article key={item.id} className="action-item">
              <div className="action-main">
                <strong>{item.title}</strong>
                <p>{item.description || '설명 없음'}</p>
                <div className="meta-row">
                  <span>{item.member.name}</span>
                  <span>{item.member.phone}</span>
                  <span>{NEXT_ACTION_TYPE_LABELS[item.type]}</span>
                </div>
              </div>

              <div className="tag-col">
                <NextActionPriorityBadge priority={item.priority} />
                <NextActionStatusBadge status={item.status} />
              </div>
            </article>
          ))}
        </div>
      )}

      <style jsx>{`
        .today-next-action-card {
          display: grid;
          gap: 16px;
          padding: 22px;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .eyebrow {
          margin: 0;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--green);
        }

        h2 {
          margin: 6px 0 0;
          font-size: 22px;
        }

        .description {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
        }

        .header-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .manage-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--green);
          font-size: 13px;
          font-weight: 800;
        }

        .state-box {
          padding: 16px;
          border: 1px dashed var(--line);
          border-radius: 14px;
          text-align: center;
          color: var(--muted);
          font-size: 14px;
        }

        .state-box.error {
          border-color: #efc8c8;
          background: #fff3f3;
          color: #9c2f2f;
        }

        .action-list {
          display: grid;
          gap: 10px;
        }

        .action-item {
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 14px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          background: #fff;
        }

        .action-main {
          display: grid;
          gap: 6px;
        }

        .action-main strong {
          font-size: 15px;
          color: var(--ink);
        }

        .action-main p {
          margin: 0;
          font-size: 13px;
          color: #3e4542;
        }

        .meta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 12px;
          color: var(--muted);
        }

        .tag-col {
          display: grid;
          gap: 6px;
          justify-items: end;
        }

        @media (max-width: 720px) {
          .header-row {
            flex-direction: column;
          }

          .header-actions {
            align-items: flex-start;
          }

          .action-item {
            flex-direction: column;
          }

          .tag-col {
            justify-items: start;
            grid-auto-flow: column;
            grid-auto-columns: max-content;
          }
        }
      `}</style>
    </Card>
  );
}
