import React from 'react';

interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  children?: React.ReactNode;
}

/**
 * Reusable Table Component
 * 
 * Semantic table with consistent styling.
 */
export function Table({ children, ...props }: TableProps) {
  return (
    <table className="table" {...props}>
      {children}
    </table>
  );
}

interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
}

/**
 * Table Header Component
 * 
 * Semantic thead element with consistent styling.
 */
export function TableHeader({ children, ...props }: TableHeaderProps) {
  return (
    <thead {...props}>
      {children}
    </thead>
  );
}

interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
}

/**
 * Table Body Component
 * 
 * Semantic tbody element with consistent styling.
 */
export function TableBody({ children, ...props }: TableBodyProps) {
  return (
    <tbody {...props}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode;
}

/**
 * Table Row Component
 * 
 * Semantic tr element with consistent styling.
 */
export function TableRow({ children, ...props }: TableRowProps) {
  return (
    <tr {...props}>
      {children}
    </tr>
  );
}

interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableDataCellElement> {
  children?: React.ReactNode;
}

/**
 * Table Cell Component
 * 
 * Semantic td element with consistent styling.
 */
export function TableCell({ children, ...props }: TableCellProps) {
  return (
    <td {...props}>
      {children}
    </td>
  );
}

interface TableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children?: React.ReactNode;
}

/**
 * Table Header Cell Component
 * 
 * Semantic th element with consistent styling.
 */
export function TableHeaderCell({
  children,
  ...props
}: TableHeaderCellProps) {
  return (
    <th {...props}>
      {children}
    </th>
  );
}

/**
 * Table Styles
 * Applied globally for all table variants
 */
export function TableStyles() {
  return (
    <style jsx global>{`
      .table {
        width: 100%;
        border-collapse: collapse;
      }

      .table th,
      .table td {
        padding: 13px 12px;
        border-bottom: 1px solid var(--line);
        text-align: left;
        white-space: nowrap;
      }

      .table th {
        font-size: 13px;
        color: var(--muted);
        font-weight: 600;
        background: var(--bg);
      }

      .table td {
        font-size: 14px;
        color: var(--ink);
      }

      .table tbody tr {
        transition: background-color 0.2s ease;
      }

      .table tbody tr:hover {
        background-color: #f9f9f9;
      }

      .table tbody tr.selected {
        background-color: #f0f8f5;
      }
    `}</style>
  );
}
