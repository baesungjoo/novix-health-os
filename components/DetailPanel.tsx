'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Card, IconButton, Tabs, TabsStyles } from './ui';

export type DetailTabConfig = {
  id: string;
  label: string;
  icon?: ReactNode;
};

export interface DetailPanelProps<T extends Record<string, unknown>> {
  title: string;
  item: T | null;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onClose: () => void;
  tabs: DetailTabConfig[];
  children: ReactNode;
  isLoading?: boolean;
}

/**
 * Reusable CRM Detail Panel Component
 * 
 * A scalable, tabbed detail panel that can be used for any entity type.
 * Designed to be modular and work with different data models.
 * 
 * Features:
 * - Configurable tabs with labels
 * - Sticky positioning (responsive)
 * - Reusable for members, reservations, counseling, purchases, etc.
 * - TypeScript support for generic data types
 * - Accessible tab navigation
 */
export function DetailPanel<T extends Record<string, unknown>>({
  title,
  item,
  activeTab,
  onTabChange,
  onClose,
  tabs,
  children,
  isLoading = false,
}: DetailPanelProps<T>) {
  if (!item) return null;

  return (
    <Card className="detail-panel" style={{ padding: '20px' }}>
      <div className="detail-header">
        <h3>{title}</h3>
        <IconButton
          onClick={onClose}
          title="닫기"
          aria-label="Close detail panel"
          icon={<X size={20} />}
        />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange}>
        {isLoading ? (
          <div className="loading">로드 중...</div>
        ) : (
          children
        )}
      </Tabs>

      <TabsStyles />

      <style jsx>{`
        .detail-panel {
          height: fit-content;
          position: sticky;
          top: 80px;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--line);
        }

        .detail-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: var(--muted);
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .detail-panel {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </Card>
  );
}
