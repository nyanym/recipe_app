import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostButton from './Post-btn';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '📊', path: '/' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
  { label: 'Profile', icon: '👤', path: '/profile' },
];

export default function Sidebar({ user, onLogout, onCreatePost }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="website">
            <span className="website-icon">🫨</span>
            {isOpen && <span className="website-name">Website Name</span>}
          </div>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="toggle-btn"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? '✕' : '❯'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ label, icon, path }) => (
            <button
              key={label}
              type="button"
              className="nav-item"
              onClick={() => navigate(path)}
            >
              <span className="icon">{icon}</span>
              {isOpen && <span className="label">{label}</span>}
            </button>
          ))}

          <div className="nav-item">
            <PostButton onClick={onCreatePost} isCollapsed={!isOpen} />
          </div>
        </nav>

        {user && (
          <div className="sidebar-footer">
            {isOpen && <p>Logged in as: {user.username}</p>}
            <button type="button" onClick={onLogout}>
              Log Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}