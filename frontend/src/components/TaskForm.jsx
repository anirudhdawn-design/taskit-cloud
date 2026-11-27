import { useState, useRef, useEffect } from 'react';

const PICK_COLORS = ["#F5F09A","#9AE8BC","#FFB899","#B6C2FF","#FFC6E0","#FFAEAE","#C9E6FF","#D8C2FF"];

function CustomSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="field-group custom-select-wrap" ref={wrapRef}>
      <label>{label}</label>
      <button
        type="button"
        className="custom-select-trigger"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value}</span>
        <svg
          className={'select-chevron' + (open ? ' open' : '')}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={'custom-select-menu' + (open ? ' open' : '')}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={'custom-select-option' + (value === option ? ' is-current' : '')}
            onClick={() => {
              onChange(option);
              setOpen(false);
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function BoldColorCalendar({ value, pickColor, onToggleDate, closing }) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const initial = value ? new Date(value + 'T00:00:00') : todayStart;

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = new Date(viewYear, viewMonth, 1)
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase();

  const prevMonth = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const formatKey = (y, m, d) =>
    y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');

  const todayKey = formatKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className={'bold-calendar dot-cal-popover' + (closing ? ' closing' : '')}>
      <div className="min-cal-top">
        <div className="bold-cal-month">{monthName}</div>
        <div className="min-cal-right">
          <span className="min-cal-year">{viewYear}</span>
          <div className="min-cal-nav">
            <button
              type="button"
              onClick={prevMonth}
              disabled={isCurrentMonth}
              aria-label="Previous month"
            >
              &lt;
            </button>
            <button type="button" onClick={nextMonth} aria-label="Next month">
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div className="bold-cal-weekdays">
        {WEEKDAYS.map((w, idx) => (
          <span key={idx}>{w}</span>
        ))}
      </div>

      <div className="bold-cal-grid">
        {cells.map((day, idx) => {
          if (!day) return <span key={idx} className="bold-cal-cell empty" />;
          const key = formatKey(viewYear, viewMonth, day);
          const cellDate = new Date(viewYear, viewMonth, day);
          const isPast = cellDate < todayStart;
          const isSelected = value === key;
          const isToday = key === todayKey;

          const activeStyle = isSelected
            ? { backgroundColor: pickColor, color: '#0a0a0a' }
            : undefined;

          return (
            <button
              key={idx}
              type="button"
              disabled={isPast}
              style={activeStyle}
              className={
                'bold-cal-cell' +
                (isPast ? ' past' : ' future') +
                (isToday ? ' today' : '') +
                (isSelected ? ' selected' : '')
              }
              onClick={() => !isPast && onToggleDate(key)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TaskForm({ onAddTask, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [pickColor, setPickColor] = useState('#F5F09A');
  const [showCal, setShowCal] = useState(false);
  const [calClosing, setCalClosing] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleToggleDate = (dateKey) => {
    if (dueDate === dateKey) {
      setDueDate('');
    } else {
      const nextColor = PICK_COLORS[Math.floor(Math.random() * PICK_COLORS.length)];
      setPickColor(nextColor);
      setDueDate(dateKey);
    }
  };

  const toggleCalendar = () => {
    if (showCal && !calClosing) {
      setCalClosing(true);
      setTimeout(() => {
        setShowCal(false);
        setCalClosing(false);
      }, 220);
    } else if (!showCal) {
      setShowCal(true);
    }
  };

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    if (showCal) setCalClosing(true);
    setTimeout(() => {
      onClose();
    }, 220);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || closing) return;
    onAddTask({ title, description, category, priority, dueDate });
    setTitle('');
    setDescription('');
    setDueDate('');
    handleClose();
  };

  return (
    <div
      className={'modal-overlay paper-overlay' + (closing ? ' closing' : '')}
      onClick={handleClose}
    >
      <div
        className={'modal-card paper-modal task-form-modal' + (closing ? ' closing' : '')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>New Task</h2>
          <button type="button" className="modal-close" onClick={handleClose}>
            X
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="field-group">
            <label>Short Description</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-row">
            <CustomSelect
              label="Category"
              value={category}
              options={['Academic', 'Work', 'Personal']}
              onChange={setCategory}
            />
            <CustomSelect
              label="Priority"
              value={priority}
              options={['Low', 'Medium', 'High']}
              onChange={setPriority}
            />
          </div>

          <div className="date-circle-row">
            <label className="date-circle-label">Due Date</label>
            <div className="date-circle-controls">
              {dueDate && <span className="picked-date-minimal">{dueDate}</span>}
              <button
                type="button"
                className={'date-circle-btn' + (dueDate || showCal ? ' has-date' : '')}
                style={dueDate ? { backgroundColor: pickColor, borderColor: pickColor, color: '#0a0a0a' } : undefined}
                onClick={toggleCalendar}
                title="Toggle calendar"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth-white">
            Add to Stack
          </button>
        </form>

        {showCal && (
          <BoldColorCalendar
            value={dueDate}
            pickColor={pickColor}
            closing={calClosing}
            onToggleDate={handleToggleDate}
          />
        )}
      </div>
    </div>
  );
}
