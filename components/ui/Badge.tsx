import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children?: React.ReactNode;
}

/**
 * Reusable Badge Component
 * 
 * Inline label for displaying status, tags, or categories.
 * 
 * Variants:
 * - default: Mint background with green text
 * - success: Green background
 * - warning: Yellow/orange background
 * - danger: Red background
 */
export function Badge({
  variant = 'default',
  children,
  className = '',
  ...props
}: BadgeProps) {
  const classes = `badge badge-${variant} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

/**
 * Badge Styles
 * Applied globally for all badge variants
 */
export function BadgeStyles() {
  return (
    <style jsx global>{`
      .badge {
        display: inline-flex;
        padding: 5px 9px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
      }

      .badge-default {
        background: var(--mint);
        color: var(--green);
      }

      .badge-success {
        background: #c8e6c9;
        color: #2e7d32;
      }

      .badge-warning {
        background: #ffe0b2;
        color: #f57c00;
      }

      .badge-danger {
        background: #ffcdd2;
        color: #c62828;
      }
    `}</style>
  );
}
