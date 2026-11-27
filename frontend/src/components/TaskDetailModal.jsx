import { useState } from 'react';
import { getDeckThemeForTask } from './TaskCard';

export default function TaskDetailModal({ task, onClose }) {
  const [closing, setClosing] = useState(false);
  if (!task) return null;

  const theme = getDeckThemeForTask(task, task._themeIndex ?? 0);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 220);
  };

  return (
    <div
      className={'modal-overlay paper-overlay' + (closing ? ' closing' : '')}
      onClick={handleClose}
    >
      <div
        className={'task-detail-card paper-modal' + (closing ? ' closing' : '')}
        style={{ backgroundColor: theme.bg, color: theme.text }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="task-detail-top">
          <span
            className="task-detail-cat"
            style={{ backgroundColor: theme.badgeBg, color: theme.text }}
          >
            {task.category || 'Personal'}
          </span>
          <button
            type="button"
            className="task-detail-close"
            style={{ backgroundColor: theme.badgeBg, color: theme.text }}
            onClick={handleClose}
          >
            X
          </button>
        </div>

        <h2 className="task-detail-title">{task.title}</h2>

        {task.description && task.description.trim() ? (
          <p className="task-detail-desc">{task.description}</p>
        ) : null}

        <div className="task-detail-meta-grid">
          <div className="task-detail-meta-box" style={{ backgroundColor: theme.badgeBg }}>
            <span className="task-detail-meta-label">Priority</span>
            <span className="task-detail-meta-value">{task.priority || 'Medium'}</span>
          </div>
          <div className="task-detail-meta-box" style={{ backgroundColor: theme.badgeBg }}>
            <span className="task-detail-meta-label">Due Date</span>
            <span className="task-detail-meta-value">{task.dueDate || 'No due date'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
