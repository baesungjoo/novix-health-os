import React from 'react';

export type ButtonVariant = 'primary' | 'soft' | 'danger' | 'default';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Reusable Button Component
 * 
 * Supports multiple variants and sizes for consistent UI across the application.
 * 
 * Variants:
 * - primary: Green background for primary actions
 * - soft: Mint background for secondary actions
 * - danger: Light red background for destructive actions
 * - default: Minimal button style
 */
export function Button({
  variant = 'default',
  size = 'md',
  isLoading = false,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = `btn btn-${variant} btn-${size}${disabled || isLoading ? ' disabled' : ''}`;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
}

/**
 * Icon Button Component
 * 
 * Compact button for icon-only actions (edit, delete, close, etc.)
 */
export function IconButton({
  variant = 'default',
  icon,
  disabled,
  ...props
}: Omit<ButtonProps, 'children'> & { icon: React.ReactNode }) {
  const classes = `icon-btn ${variant === 'danger' ? 'danger' : ''}${disabled ? ' disabled' : ''}`;

  return (
    <button className={classes} disabled={disabled} {...props}>
      {icon}
    </button>
  );
}

/**
 * Button Styles
 * Applied globally for all button variants
 */
export function ButtonStyles() {
  return (
    <style jsx global>{`
      .btn {
        border: 0;
        border-radius: 12px;
        padding: 11px 16px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .btn.disabled,
      .btn:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .btn-primary {
        background: var(--green);
        color: #fff;
      }

      .btn-soft {
        background: var(--mint);
        color: var(--green);
      }

      .btn-danger {
        background: #fee4e2;
        color: var(--danger);
      }

      .btn-default {
        background: transparent;
        color: var(--ink);
      }

      .btn-sm {
        padding: 7px 10px;
        font-size: 12px;
      }

      .btn-md {
        padding: 11px 16px;
        font-size: 14px;
      }

      .btn-lg {
        padding: 14px 20px;
        font-size: 16px;
      }

      .btn-icon {
        display: inline-flex;
        align-items: center;
      }

      .btn-text {
        display: inline;
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

      .icon-btn.disabled,
      .icon-btn:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    `}</style>
  );
}
