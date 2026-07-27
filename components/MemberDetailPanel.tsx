'use client';

import { Member } from '@/lib/demo-data';
import { DetailPanel, DetailTabConfig } from './DetailPanel';
import { ReservationHistory } from './reservation/ReservationHistory';
import { MemberStatusBadge } from './member/MemberStatusBadge';
import { NextActionList } from './next-action/NextActionList';
import { Timeline } from './timeline/Timeline';

interface MemberDetailPanelProps {
  member: Member | null;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onClose: () => void;
}

const MEMBER_TABS: DetailTabConfig[] = [
  { id: 'info', label: '회원 정보' },
  { id: 'reservations', label: '예약' },
  { id: 'next-action', label: 'Next Action' },
  { id: 'counseling', label: '상담' },
  { id: 'purchases', label: '구매' },
  { id: 'notes', label: '활동' },
];

function ComingSoonPanel() {
  return (
    <div className="coming-soon">
      <p>준비 중입니다</p>
    </div>
  );
}

/**
 * Member Detail Panel Component
 * 
 * Displays member information in a tabbed interface.
 * 
 * Tabs:
 * - Member Info: Shows name, phone, birthday, visits, interest, memo
 * - Reservations, Counseling, Purchases, Notes: Placeholder for future features
 */
export function MemberDetailPanel({
  member,
  activeTab,
  onTabChange,
  onClose,
}: MemberDetailPanelProps) {
  if (!member) return null;

  return (
    <DetailPanel
      title="회원 상세 정보"
      item={member}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onClose={onClose}
      tabs={MEMBER_TABS}
    >
      {activeTab === 'info' && (
        <div className="member-info">
          <div className="detail-item">
            <span className="detail-label">상태</span>
            <span className="detail-value">
              <MemberStatusBadge visits={member.visits} />
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">이름</span>
            <span className="detail-value">{member.name}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">연락처</span>
            <span className="detail-value">{member.phone}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">생년월일</span>
            <span className="detail-value">{member.birthday}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">방문 횟수</span>
            <span className="detail-value">{member.visits}회</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">관심 분야</span>
            <span className="detail-value">
              {member.interest || '미입력'}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">메모</span>
            <span className="detail-value detail-memo">
              {member.memo || '-'}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <ReservationHistory memberId={member.id} memberName={member.name} />
      )}

      {activeTab === 'next-action' && (
        <NextActionList memberId={member.id} />
      )}

      {activeTab === 'counseling' && <ComingSoonPanel />}

      {activeTab === 'purchases' && <ComingSoonPanel />}

      {activeTab === 'notes' && (
        <Timeline
          memberId={member.id}
          title="회원 활동"
          description="회원 생성부터 예약 이력까지 하나의 흐름으로 보여줍니다."
          emptyMessage="표시할 활동이 없습니다."
        />
      )}

      <style jsx>{`
        .member-info {
          display: grid;
          gap: 16px;
        }

        .detail-item {
          display: grid;
          gap: 6px;
        }

        .detail-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--muted);
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 14px;
          color: #333;
          word-break: break-word;
        }

        .detail-memo {
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .coming-soon {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: var(--muted);
          font-size: 14px;
          text-align: center;
        }
      `}</style>
    </DetailPanel>
  );
}
