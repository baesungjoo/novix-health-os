import React from 'react';

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

/**
 * Reusable Input Component
 * 
 * Supports text, email, password, number, date, time, and more input types.
 */
export function Input({
  error,
  label,
  ...props
}: InputProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input className="field" {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}

/**
 * Reusable TextArea Component
 * 
 * Multi-line text input with consistent styling.
 */
export function TextArea({
  error,
  label,
  ...props
}: TextAreaProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <textarea className="field" {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}

/**
 * Input Styles
 * Applied globally for all input variants
 */
export function InputStyles() {
  return (
    <style jsx global>{`
      .input-group {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .input-label {
        font-weight: 700;
        font-size: 14px;
        color: var(--ink);
      }

      .field {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 12px 13px;
        background: #fff;
        outline: none;
        transition: all 0.2s ease;
        font-size: 14px;
        color: var(--ink);
      }

      .field:focus {
        border-color: var(--green2);
        box-shadow: 0 0 0 3px rgba(31, 122, 89, 0.12);
      }

      .field::placeholder {
        color: var(--muted);
      }

      .field:disabled {
        background: var(--bg);
        cursor: not-allowed;
        opacity: 0.6;
      }

      textarea.field {
        min-height: 100px;
        resize: vertical;
        font-family: inherit;
      }

      .input-error {
        font-size: 12px;
        color: var(--danger);
        margin-top: -3px;
      }
    `}</style>
  );
}
