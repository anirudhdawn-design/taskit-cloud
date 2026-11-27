import { useState, useRef, useEffect } from 'react';

const TASK_PALETTE = [{"bg":"#0E5A07","text":"#FFFFFF"},{"bg":"#B79EFF","text":"#141124"},{"bg":"#EF6C33","text":"#FFFFFF"},{"bg":"#D13514","text":"#FFFFFF"},{"bg":"#FF98CC","text":"#1C0D16"},{"bg":"#45A7F5","text":"#FFFFFF"},{"bg":"#FFE27A","text":"#2B2206"},{"bg":"#BFF7B2","text":"#0D2E12"}];
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TICKS = Array.from({ length: 16 }, (_, i) => i);

function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function getTaskDateKey(task, fallbackTodayKey) {
  if (task.dueDate) return task.dueDate;
  if (task.createdAt) {
    const parsed = new Date(task.createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      return toLocalDateKey(parsed);
    }
  }
  return fallbackTodayKey;
}

export default function HistoryModal({ tasks, onClose, onDeleteTask }) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayKey = toLocalDateKey(todayStart);

  const [viewYear, setViewYear] = useState(todayStart.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayStart.getMonth());
  const [selectedKey, setSelectedKey] = useState('');
  const [pickTheme, setPickTheme] = useState(TASK_PALETTE[1]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const [scrollPct, setScrollPct] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const listRef = useRef(null);
  const trackRef = useRef(null);
  const draggingRef = useRef(false);

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

  const handleDateClick = (key) => {
    if (selectedKey === key && drawerOpen) {
      setDrawerOpen(false);
      setTimeout(() => setSelectedKey(''), 220);
      return;
    }
    const choices = TASK_PALETTE.filter((c) => c.bg !== pickTheme.bg);
    const nextTheme = choices[Math.floor(Math.random() * choices.length)];
    setPickTheme(nextTheme);
    setSelectedKey(key);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setDrawerOpen(false);
    setTimeout(() => {
      onClose();
    }, 220);
  };

  const dayTasks = selectedKey
    ? tasks.filter((t) => getTaskDateKey(t, todayKey) === selectedKey)
    : [];

  const doneTasks = dayTasks.filter((t) => t.completed);
  const pendingTasks = dayTasks.filter((t) => !t.completed);

  const syncScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    setCanScroll(maxScroll > 4);
    setScrollPct(maxScroll > 0 ? el.scrollTop / maxScroll : 0);
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = 0;
      syncScroll();
    });
    return () => cancelAnimationFrame(id);
  }, [selectedKey, drawerOpen]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      syncScroll();
    });
    return () => cancelAnimationFrame(id);
  }, [tasks.length]);

  const scrollToPointer = (clientY) => {
    const track = trackRef.current;
    const list = listRef.current;
    if (!track || !list) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    list.scrollTop = pct * (list.scrollHeight - list.clientHeight);
    setScrollPct(pct);
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      scrollToPointer(e.clientY);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const activeTickIndex = Math.round(scrollPct * (TICKS.length - 1));

  const formattedSelected = selectedKey
    ? new Date(selectedKey + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div
      className={'modal-overlay paper-overlay' + (closing ? ' closing' : '')}
      onClick={handleClose}
    >
      <div
        className={'history-stage' + (closing ? ' closing' : '')}
        onClick={handleClose}
      >
        <div
          className="modal-card paper-modal bold-calendar cal-history-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header cal-history-header">
            <div className="bold-cal-month-year">
              {monthName} {viewYear}
            </div>
            <div className="min-cal-nav">
              <button type="button" onClick={prevMonth} aria-label="Previous month">
                &lt;
              </button>
              <button type="button" onClick={nextMonth} aria-label="Next month">
                &gt;
              </button>
            </div>
          </div>

          <div className="bold-cal-weekdays">
            {WEEKDAYS.map((w, idx) => (
              <span key={idx}>{w}</span>
            ))}
          </div>

          <div className="bold-cal-grid circle-cal-grid">
            {cells.map((day, idx) => {
              if (!day) return <span key={idx} className="circle-cal-cell empty" />;
              const key = formatKey(viewYear, viewMonth, day);
              const isToday = key === todayKey;
              const isSelected = selectedKey === key;
              const hasTasks = tasks.some((t) => getTaskDateKey(t, todayKey) === key);

              const selectedStyle =
                isSelected && !isToday
                  ? {
                      backgroundColor: pickTheme.bg,
                      color: pickTheme.text,
                      borderColor: pickTheme.bg,
                    }
                  : undefined;

              return (
                <button
                  key={idx}
                  type="button"
                  style={selectedStyle}
                  aria-label={isToday ? 'Current date ' + day : 'Day ' + day}
                  className={
                    'circle-cal-cell' +
                    (isToday ? ' is-today' : '') +
                    (isSelected ? ' is-selected' : '') +
                    (hasTasks ? ' has-task' : '')
                  }
                  onClick={() => handleDateClick(key)}
                >
                  <span>{day}</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedKey && (
          <aside
            className={'cal-side-bar neutral-side-drawer' + (drawerOpen ? ' open' : ' closed')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cal-side-top">
              <div>
                <div className="cal-side-date">{formattedSelected}</div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setDrawerOpen(false);
                  setTimeout(() => setSelectedKey(''), 220);
                }}
              >
                X
              </button>
            </div>

            <div className="history-scroll-area">
              <div
                ref={listRef}
                className="cal-side-sections"
                onScroll={syncScroll}
              >
                <div className="cal-side-group">
                  <div className="cal-side-label">Done</div>
                  {doneTasks.length === 0 ? (
                    <div className="cal-side-empty">No completed tasks</div>
                  ) : (
                    doneTasks.map((t) => (
                      <div key={t._id} className="neutral-drawer-card">
                        <span className="neutral-drawer-title">{t.title}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="cal-side-group">
                  <div className="cal-side-label">Pending</div>
                  {pendingTasks.length === 0 ? (
                    <div className="cal-side-empty">No pending tasks</div>
                  ) : (
                    pendingTasks.map((t) => (
                      <div key={t._id} className="neutral-drawer-card has-delete">
                        <span className="neutral-drawer-title">{t.title}</span>
                        {onDeleteTask && (
                          <button
                            type="button"
                            className="pending-item-cross"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(t._id);
                            }}
                            aria-label={'Delete ' + t.title}
                            title="Delete task"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {canScroll && (
                <div
                  ref={trackRef}
                  className="ruler-scrollbar"
                  onMouseDown={(e) => {
                    draggingRef.current = true;
                    scrollToPointer(e.clientY);
                  }}
                >
                  <div className="ruler-ticks">
                    {TICKS.map((t) => (
                      <span
                        key={t}
                        className={'ruler-tick ' + (t <= activeTickIndex ? 'lit' : '')}
                      />
                    ))}
                  </div>

                  <div className="ruler-track">
                    <div
                      className="ruler-fill"
                      style={{ height: (scrollPct * 100) + '%' }}
                    />
                    <div
                      className="ruler-thumb"
                      style={{ top: (scrollPct * 100) + '%' }}
                    >
                      <span className="ruler-thumb-dot" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
