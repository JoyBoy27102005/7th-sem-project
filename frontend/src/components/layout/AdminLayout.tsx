import React from 'react';
import { Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const showExitPrompt = useExitConfirmation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {showExitPrompt && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-2xl font-medium text-sm">
            Press back again to exit
          </div>
        </div>
      )}

      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Admin Portal</h2>
          <p className="text-sm text-muted-foreground">
            {user.name}
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            to="/admin"
            className="block px-4 py-2 rounded hover:bg-accent"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="block px-4 py-2 rounded hover:bg-accent"
          >
            User Management
          </Link>

          <Link
            to="/admin/careers"
            className="block px-4 py-2 rounded hover:bg-accent"
          >
            Career Management
          </Link>
        </nav>

        <Button
          variant="outline"
          className="w-full mt-auto"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="absolute top-4 right-8">
          <ThemeSwitcher />
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;