import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { getMonthMatrix, getMonthTitle, getTodayIsoDate, isSameIsoDate } from './reservation-meta';

interface ReservationCalendarProps {
  month: Date;
  selectedDate: string;
  countsByDate: Record<string, number>;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export function ReservationCalendar({
  month,
  selectedDate,
  countsByDate,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: ReservationCalendarProps) {
  const today = getTodayIsoDate();
  const days = getMonthMatrix(month);
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;

  return (
    <Card className="calendar-card">
      <div className="calendar-header">
        <div>
          <p className="eyebrow">CALENDAR</p>
          <h2>{getMonthTitle(month)}</h2>
        </div>

        <div className="controls">
          <Button type="button" variant="default" size="sm" onClick={onPreviousMonth} icon={<ChevronLeft size={16} />}>
            이전
          </Button>
          <Button type="button" variant="default" size="sm" onClick={onNextMonth} icon={<ChevronRight size={16} />}>
            다음
          </Button>
        </div>
      </div>

      <div className="calendar-grid">
        {DAY_LABELS.map((label) => (
          <div key={label} className="weekday">
            {label}
          </div>
        ))}

        {days.map((date) => {
          const count = countsByDate[date] ?? 0;
          const isCurrentMonth = date.slice(0, 7) === monthKey;
          const selected = isSameIsoDate(date, selectedDate);
          const isToday = isSameIsoDate(date, today);

          return (
            <button
              key={date}
              type="button"
              className={`day-cell${selected ? ' selected' : ''}${isToday ? ' today' : ''}${isCurrentMonth ? '' : ' muted'}`}
              onClick={() => onSelectDate(date)}
            >
              <span className="day-number">{Number(date.slice(-2))}</span>
              <span className="count">{count}건</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .calendar-card {
          display: grid;
          gap: 16px;
          padding: 20px;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .eyebrow {
          margin: 0 0 6px;
          color: var(--green);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        h2 {
          margin: 0;
          font-size: 24px;
        }

        .controls {
          display: flex;
          gap: 8px;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 10px;
        }

        .weekday {
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
          text-align: center;
          padding: 4px 0 2px;
        }

        .day-cell {
          min-height: 92px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: #fff;
          padding: 12px;
          text-align: left;
          display: grid;
          align-content: space-between;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .day-cell:hover {
          transform: translateY(-1px);
          border-color: rgba(31, 122, 89, 0.28);
          box-shadow: 0 8px 20px rgba(18, 63, 48, 0.08);
        }

        .day-cell.selected {
          border-color: var(--green);
          background: rgba(31, 122, 89, 0.06);
        }

        .day-cell.today {
          box-shadow: inset 0 0 0 1px rgba(31, 122, 89, 0.18);
        }

        .day-cell.muted {
          opacity: 0.45;
        }

        .day-number {
          font-size: 15px;
          font-weight: 800;
          color: var(--ink);
        }

        .count {
          justify-self: start;
          font-size: 12px;
          font-weight: 800;
          color: var(--green);
          background: var(--mint);
          border-radius: 999px;
          padding: 4px 8px;
        }

        @media (max-width: 920px) {
          .day-cell {
            min-height: 84px;
          }
        }

        @media (max-width: 640px) {
          .calendar-header {
            flex-direction: column;
            align-items: stretch;
          }

          .controls {
            justify-content: space-between;
          }

          .day-cell {
            min-height: 72px;
            padding: 10px;
          }
        }
      `}</style>
    </Card>
  );
}
