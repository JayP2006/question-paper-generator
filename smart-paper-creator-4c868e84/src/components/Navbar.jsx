import React from 'react';
import { Bell, Moon, Sun, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark(!dark);
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h2 className="text-lg font-heading font-semibold text-foreground">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        <div className="h-8 w-px bg-border mx-2" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full ai-gradient-bg flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          {user?.name && (
            <span className="text-sm font-medium text-foreground hidden sm:block">{user.name}</span>
          )}
          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
