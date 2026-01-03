import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './MainLayout.css';

function MainLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">SecureLMS</div>
        <nav className="nav">
          <NavLink to="/courses" className="nav-link">
            Catalog
          </NavLink>
          <NavLink to="/learning" className="nav-link">
            My Learning
          </NavLink>
          {user?.role === 'instructor' && (
            <NavLink to="/instructor/courses" className="nav-link">
              Instructor
            </NavLink>
          )}
        </nav>
        <div className="user-box">
          <div className="user-meta">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button className="btn-secondary" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;


