import React from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

/**
 * Reusable Modal Component
 * 
 * Full-screen overlay with centered content.
 * 
 * Sizes:
 * - sm: 380px
 * - md: 520px (default)
 * - lg: 720px
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className={`modal modal-${size}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && (
              <IconButton icon={<X size={20} />} onClick={onClose} />
            )}
          </div>
        )}

        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

/**
 * Modal Styles
 * Applied globally for all modal variants
 */
export function ModalStyles() {
  return (
    <style jsx global>{`
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 30, 22, 0.45);
        z-index: 50;
        display: grid;
        place-items: center;
        padding: 18px;
      }

      .modal {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 20px;
        box-shadow: var(--shadow);
        padding: 24px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .modal-sm {
        width: min(380px, 100%);
      }

      .modal-md {
        width: min(520px, 100%);
      }

      .modal-lg {
        width: min(720px, 100%);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--line);
      }

      .modal-title {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: var(--ink);
      }

      .modal-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
    `}</style>
  );
}
