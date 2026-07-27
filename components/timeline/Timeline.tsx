'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import {
  TIMELINE_TYPE_META,
  formatTimelineDate,
  formatTimelineDateTime,
  groupTimelineEventsByDate,
  type TimelineEventRecord,
} from './timeline-meta';

interface TimelineProps {
  memberId?: number;
  limit?: number;
  title?: string;
  description?: string;
  emptyMessage?: string;
  showMember?: boolean;
  compact?: boolean;
}

export function Timeline({
  memberId,
  limit,
  title = '활동 타임라인',
  description = '최근 활동을 최신순으로 확인합니다.',
  emptyMessage = '표시할 활동이 없습니다.',
  showMember = false,
  compact = false,
}: TimelineProps) {
  const [events, setEvents] = useState<TimelineEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadTimeline = async () => {
      setLoading(true);
      setError('');

      try {
        const searchParams = new URLSearchParams();
        if (memberId) searchParams.set('memberId', String(memberId));
        if (limit) searchParams.set('limit', String(limit));

        const response = await fetch(`/api/timeline?${searchParams.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('타임라인을 불러오지 못했습니다.');
        }

        const data: TimelineEventRecord[] = await response.json();
        if (mounted) {
          setEvents(data);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : '타임라인을 불러오지 못했습니다.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadTimeline();

    return () => {
      mounted = false;
    };
  }, [limit, memberId]);

  const groupedEvents = useMemo(() => groupTimelineEventsByDate(events), [events]);

  return (
    <Card className={`timeline-card${compact ? ' compact' : ''}`}>
      <div className="timeline-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      {loading && <div className="timeline-state">타임라인을 불러오는 중입니다...</div>}
      {!loading && error && <div className="timeline-state error">{error}</div>}
      {!loading && !error && groupedEvents.length === 0 && (
        <div className="timeline-state">{emptyMessage}</div>
      )}

      <div className="timeline-groups">
        {groupedEvents.map((group) => (
          <section key={group.date} className="timeline-group">
            <div className="group-date">{formatTimelineDate(group.date)}</div>

            <div className="timeline-items">
              {group.items.map((event) => {
                const meta = TIMELINE_TYPE_META[event.type];
                const Icon = meta.icon;
                const reservationLink = event.reservation
                  ? `/admin/reservations?date=${event.reservation.date}&reservationId=${event.reservation.id}`
                  : null;

                return (
                  <article key={event.id} className="timeline-item">
                    <div className={`timeline-icon ${meta.tone}`}>
                      <Icon size={16} />
                    </div>

                    <div className="timeline-body">
                      <div className="timeline-row">
                        <div>
                          <div className="timeline-title">{event.title}</div>
                          <div className="timeline-time">{formatTimelineDateTime(event.createdAt)}</div>
                        </div>
                        {showMember && (
                          <div className="member-pill">{event.member.name}</div>
                        )}
                      </div>

                      <div className="timeline-description">{event.description}</div>

                      <div className="timeline-meta-row">
                        <span>{event.member.name}</span>
                        <span>{event.member.phone}</span>
                        {reservationLink && (
                          <Link href={reservationLink} className="timeline-link">
                            예약 보기
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <style jsx>{`
        .timeline-card {
          display: grid;
          gap: 16px;
          padding: 20px;
        }

        .timeline-card.compact {
          padding: 18px;
        }

        .timeline-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .timeline-header p {
          margin: 6px 0 0;
          color: var(--muted);
          font-size: 13px;
        }

        .timeline-state {
          padding: 18px;
          border: 1px dashed var(--line);
          border-radius: 16px;
          text-align: center;
          color: var(--muted);
          font-size: 14px;
        }

        .timeline-state.error {
          border-color: #efc8c8;
          background: #fff3f3;
          color: #9c2f2f;
        }

        .timeline-groups {
          display: grid;
          gap: 16px;
        }

        .timeline-group {
          display: grid;
          gap: 10px;
        }

        .group-date {
          color: var(--green);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .timeline-items {
          display: grid;
          gap: 10px;
        }

        .timeline-item {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 12px;
          align-items: start;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: #fff;
        }

        .timeline-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 14px;
        }

        .timeline-icon.member {
          background: #e8f5ee;
          color: #1f7a59;
        }

        .timeline-icon.reservation {
          background: #fff3de;
          color: #d07a00;
        }

        .timeline-icon.completed {
          background: #e8eef9;
          color: #2e5aac;
        }

        .timeline-icon.action-created {
          background: #efe9ff;
          color: #6346b5;
        }

        .timeline-icon.action-completed {
          background: #e6f7ef;
          color: #167a4d;
        }

        .timeline-body {
          display: grid;
          gap: 8px;
        }

        .timeline-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
        }

        .timeline-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--ink);
        }

        .timeline-time {
          margin-top: 4px;
          font-size: 12px;
          color: var(--muted);
        }

        .member-pill {
          padding: 6px 9px;
          border-radius: 999px;
          background: var(--mint);
          color: var(--green);
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .timeline-description {
          font-size: 13px;
          line-height: 1.5;
          color: #3e4542;
        }

        .timeline-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          font-size: 12px;
          color: var(--muted);
        }

        .timeline-link {
          color: var(--green);
          font-weight: 800;
        }

        @media (max-width: 640px) {
          .timeline-row {
            flex-direction: column;
          }

          .timeline-item {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Card>
  );
}
