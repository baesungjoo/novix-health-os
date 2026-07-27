import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable Card Component
 * 
 * Container with consistent styling for grouping content.
 * Used for panels, sections, and container elements.
 */
export function Card({
  children,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const paddingClass = `card-p-${padding}`;
  const classes = `card ${paddingClass} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Styles
 * Applied globally for all card variants
 */
export function CardStyles() {
  return (
    <style jsx global>{`
      .card {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 20px;
        box-shadow: var(--shadow);
      }

      .card-p-sm {
        padding: 12px;
      }

      .card-p-md {
        padding: 16px;
      }

      .card-p-lg {
        padding: 24px;
      }

      .table-wrap {
        overflow: auto;
      }

      .table-wrap .card {
        overflow: hidden;
      }
    `}</style>
  );
}
