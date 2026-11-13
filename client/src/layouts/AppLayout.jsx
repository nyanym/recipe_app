import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AppLayout({ user, onLogout, onCreatePost }) {
  return (
    <div className="app-container">
      <Sidebar user={user} onLogout={onLogout} onCreatePost={onCreatePost} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}