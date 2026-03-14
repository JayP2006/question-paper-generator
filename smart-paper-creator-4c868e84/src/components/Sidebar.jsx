import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  BookOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Smart Generator', path: '/generator', icon: Sparkles },
  { title: 'Generated Papers', path: '/papers', icon: FileText },
  { title: 'Question Bank', path: '/questions', icon: BookOpen },
  { title: 'Analytics', path: '/analytics', icon: BarChart3 },
  { title: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 z-50 ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border gap-3">
        <div className="w-9 h-9 rounded-lg ai-gradient-bg flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-lg tracking-tight truncate">
            PaperGen AI
          </span>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-12 flex items-center justify-center border-t border-sidebar-border hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
