'use client';

import { Timeline } from '@/components/timeline/Timeline';

export function RecentActivityWidget() {
  return (
    <Timeline
      limit={6}
      showMember
      compact
      title="Recent Activity"
      description="회원과 예약 활동을 최신순으로 확인합니다."
      emptyMessage="최근 활동이 없습니다."
    />
  );
}
