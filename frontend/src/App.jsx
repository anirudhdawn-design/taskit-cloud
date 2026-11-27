import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import TaskForm from './components/TaskForm';
import TaskCard from './components/TaskCard';
import TaskDetailModal from './components/TaskDetailModal';
import ThemeToggle from './components/ThemeToggle';
import HistoryModal from './components/HistoryModal';
import TrashBin from './components/TrashBin';
import './App.css';

const API_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:5000/api`;

try {
  localStorage.removeItem('taskit_profile_overrides');
  localStorage.removeItem('taskit_deleted_accounts');
} catch {
  // ignore storage errors
}

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem('user') ||
      localStorage.getItem('taskit_user') ||
      'null'
    );
  } catch {
    return null;
  }
};

const saveStoredUser = (userData) => {
  if (!userData) return;
  const serialized = JSON.stringify(userData);
  localStorage.setItem('user', serialized);
  localStorage.setItem('taskit_user', serialized);
};

const clearSessionOnly = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('taskit_user');
};

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24,
          color: '#ff8a80',
          background: '#111',
          minHeight: '100dvh',
          fontFamily: 'monospace'
        }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {String(
              this.state.error.stack ||
              this.state.error.message ||
              this.state.error
            )}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [user, setUser] = useState(getStoredUser);
  const [theme, setTheme] = useState(
    localStorage.getItem('taskit_theme') || 'dark'
  );
  const [tasks, setTasks] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const [isTrashHot, setIsTrashHot] = useState(false);
  const [isTrashGulping, setIsTrashGulping] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const trashRef = useRef(null);
  const menuRef = useRef(null);

  const token = localStorage.getItem('token');

  const authHeaders = useMemo(() => {
    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  }, [token]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskit_theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const loadTasks = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    try {
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (
        error.response?.status === 401 ||
        error.response?.status === 400 ||
        error.response?.status === 404
      ) {
        clearSessionOnly();
        setUser(null);
        setTasks([]);
      } else {
        console.error('Could not load tasks:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      loadTasks();
    }
  }, [user, token, loadTasks]);

  const handleAuthSuccess = (userData) => {
    const normalized = {
      ...userData,
      username: userData?.username || userData?.name || '',
      name: userData?.name || userData?.username || ''
    };
    saveStoredUser(normalized);
    setUser(normalized);
  };

  const handleLogout = () => {
    clearSessionOnly();
    setUser(null);
    setTasks([]);
    setMenuOpen(false);
    setShowEditProfile(false);
  };

  const openEditModal = () => {
    setEditUsername(user?.username || user?.name || '');
    setEditEmail(user?.email || '');
    setMenuOpen(false);
    setShowEditProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const trimmedName = editUsername.trim();
    const trimmedEmail = editEmail.trim();
    if (!trimmedName || !trimmedEmail) return;

    setSavingProfile(true);
    try {
      const res = await axios.put(
        `${API_URL}/auth/update-profile`,
        {
          currentEmail: user?.email,
          name: trimmedName,
          email: trimmedEmail
        },
        { headers: authHeaders }
      );

      const serverUser = res.data?.user || {};
      const merged = {
        ...user,
        ...serverUser,
        username: serverUser.name || trimmedName,
        name: serverUser.name || trimmedName,
        email: serverUser.email || trimmedEmail
      };

      saveStoredUser(merged);
      setUser(merged);
      setShowEditProfile(false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        'Could not update profile.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    setMenuOpen(false);
    if (!user?.email) {
      handleLogout();
      return;
    }

    const confirmed = window.confirm(
      'Permanently delete your account and all your tasks?'
    );
    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      await axios.delete(`${API_URL}/auth/delete-account`, {
        headers: authHeaders,
        data: { email: user.email }
      });

      setTasks([]);
      clearSessionOnly();
      setUser(null);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        'Could not delete account.'
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const response = await axios.post(
        `${API_URL}/tasks`,
        taskData,
        { headers: authHeaders }
      );

      setTasks(current => [response.data, ...current]);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        'Could not add task. Check that the backend is running.'
      );
    }
  };

  const handleToggleTask = async (id, completed) => {
    const previousTasks = tasks;

    setTasks(current =>
      current.map(task =>
        task._id === id ? { ...task, completed } : task
      )
    );

    try {
      const response = await axios.put(
        `${API_URL}/tasks/${id}`,
        { completed },
        { headers: authHeaders }
      );

      setTasks(current =>
        current.map(task =>
          task._id === id ? response.data : task
        )
      );
    } catch (error) {
      setTasks(previousTasks);
      alert(error.response?.data?.message || 'Could not update task.');
    }
  };

  const handleDeleteTask = async (id) => {
    const previousTasks = tasks;

    setTasks(current => current.filter(task => task._id !== id));

    try {
      await axios.delete(
        `${API_URL}/tasks/${id}`,
        { headers: authHeaders }
      );

      if (selectedTask?._id === id) {
        setSelectedTask(null);
      }
    } catch (error) {
      setTasks(previousTasks);
      alert(error.response?.data?.message || 'Could not delete task.');
    }
  };

  const pendingTasks = tasks.filter(task => !task.completed);

  const filteredTasks = pendingTasks.filter(task =>
    filterCategory === 'All' || task.category === filterCategory
  );

  const handleTrashGulp = () => {
    setIsTrashGulping(true);
    window.setTimeout(() => {
      setIsTrashGulping(false);
    }, 700);
  };

  const displayName =
    user?.username ||
    user?.name ||
    (user?.email ? user.email.split('@')[0] : 'there');

  if (!user || !token) {
    return (
      <div className="app-root" data-theme={theme}>
        <AuthForm
          onAuthSuccess={handleAuthSuccess}
          theme={theme}
          onToggleTheme={() =>
            setTheme(value => (value === 'dark' ? 'light' : 'dark'))
          }
        />
        <div className="bottom-left-motto">DO NOT PANIC. ORGANIZE.</div>
      </div>
    );
  }

  return (
    <div className="app-root" data-theme={theme}>
      <header className="corner-header">
        <div className="hello-dawn">
          Hello {displayName}
        </div>

        <div className="corner-right">
          <ThemeToggle
            theme={theme}
            onToggle={() =>
              setTheme(value => (value === 'dark' ? 'light' : 'dark'))
            }
          />

          <div className="account-dots-wrapper" ref={menuRef}>
            <button
              type="button"
              className="account-dots-btn cradle-dots-btn"
              aria-label="Account options"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
            >
              <span className="cradle-bob-slot">
                <span className="cradle-thread" />
                <span className="cradle-bob cradle-bob-left" />
              </span>

              <span className="cradle-bob-slot">
                <span className="cradle-thread" />
                <span className="cradle-bob cradle-bob-mid" />
              </span>

              <span className="cradle-bob-slot">
                <span className="cradle-thread" />
                <span className="cradle-bob cradle-bob-right" />
              </span>
            </button>

            <div
              id="taskit-account-dropdown"
              className={
                'account-dots-dropdown' + (menuOpen ? ' open' : '')
              }
            >
              <button
                type="button"
                className="account-dropdown-item"
                onClick={openEditModal}
              >
                Edit
              </button>

              <button
                type="button"
                className="account-dropdown-item danger"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? 'Deleting...' : 'Delete'}
              </button>

              <button
                type="button"
                className="account-dropdown-item"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-shell">
        <div className="phone-frame">
          <nav className="pill-nav">
            {['All', 'Academic', 'Work', 'Personal'].map(category => (
              <button
                key={category}
                className={
                  'nav-pill ' + (filterCategory === category ? 'active' : '')
                }
                onClick={() => setFilterCategory(category)}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className="section-header">
            <span>Tasks and routines</span>
          </div>

          <div className="pill-stack deck-stack">
            {filteredTasks.length === 0 ? (
              <div className="empty-faded-state">
                You’re all caught up.
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  totalCount={filteredTasks.length}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onInspect={setSelectedTask}
                  trashRef={trashRef}
                  onDragStateChange={(dragging, hot) => {
                    setIsDraggingTask(Boolean(dragging));
                    setIsTrashHot(Boolean(hot));
                  }}
                  onTrashGulp={handleTrashGulp}
                />
              ))
            )}
          </div>

          <div className="floating-dock">
            <button
              className="fab-add fab-calendar"
              onClick={() => setShowHistory(true)}
              title="7-Day Task History"
              aria-label="Task history"
            >
              <svg
                width="24"
                height="24"
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

            <button
              className="fab-add"
              onClick={() => setShowModal(true)}
              title="Add new task"
              aria-label="Add task"
            >
              +
            </button>
          </div>
        </div>
      </main>

      <div className="bottom-left-motto">DO NOT PANIC. ORGANIZE.</div>

      <TrashBin
        ref={trashRef}
        isDragging={isDraggingTask}
        isHot={isTrashHot}
        isGulping={isTrashGulping}
      />

      {showEditProfile && (
        <div
          className="edit-profile-backdrop"
          style={{ display: 'flex' }}
          onClick={() => setShowEditProfile(false)}
        >
          <form
            className="edit-profile-card"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveProfile}
          >
            <h3 className="edit-profile-title">Edit Account</h3>

            <label className="edit-profile-label">
              Username
              <input
                type="text"
                className="edit-profile-input"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </label>

            <label className="edit-profile-label">
              Email
              <input
                type="email"
                className="edit-profile-input"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </label>

            <div className="edit-profile-actions">
              <button
                type="button"
                className="edit-profile-cancel"
                onClick={() => setShowEditProfile(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="edit-profile-save"
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showModal && (
        <TaskForm
          onAddTask={handleAddTask}
          onClose={() => setShowModal(false)}
        />
      )}

      {showHistory && (
        <HistoryModal
          tasks={tasks}
          onClose={() => setShowHistory(false)}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}