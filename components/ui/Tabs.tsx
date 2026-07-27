import React from 'react';

export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children?: React.ReactNode;
}

/**
 * Reusable Tabs Component
 * 
 * Tab navigation with configurable tabs and content.
 * 
 * Features:
 * - Keyboard navigation support
 * - ARIA accessibility attributes
 * - Customizable tab labels and icons
 */
export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  children,
}: TabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' && index < tabs.length - 1) {
      onTabChange(tabs[index + 1].id);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      onTabChange(tabs[index - 1].id);
      e.preventDefault();
    }
  };

  return (
    <div className="tabs">
      <div className="tabs-list" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`tabs-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            {tab.icon && <span className="tabs-icon">{tab.icon}</span>}
            <span className="tabs-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div
        className="tabs-panel"
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Tabs Styles
 * Applied globally for all tabs variants
 */
export function TabsStyles() {
  return (
    <style jsx global>{`
      .tabs {
        display: flex;
        flex-direction: column;
      }

      .tabs-list {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid var(--line);
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .tabs-tab {
        padding: 12px 16px;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--muted);
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        position: relative;
        transition: color 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .tabs-tab:hover {
        color: #333;
      }

      .tabs-tab.active {
        color: var(--green);
      }

      .tabs-tab.active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--green);
      }

      .tabs-icon {
        display: inline-flex;
        align-items: center;
        font-size: 16px;
      }

      .tabs-label {
        display: inline;
      }

      .tabs-panel {
        flex: 1;
        margin-top: 16px;
      }
    `}</style>
  );
}
