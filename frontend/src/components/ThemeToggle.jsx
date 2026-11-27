export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light';

  return (
    <div className="theme-toggle-wrap" onClick={onToggle} title="Switch theme">
      <svg className={'theme-icon moon ' + (!isLight ? 'active' : '')} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      <div className={'toggle-track ' + (isLight ? 'light' : 'dark')}>
        <div className="toggle-thumb" />
      </div>

      <svg className={'theme-icon sun ' + (isLight ? 'active' : '')} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
