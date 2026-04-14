import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { translations } from '../lib/translations';
import { 
  LayoutDashboard, 
  List, 
  Send, 
  Mail, 
  Palette, 
  Settings, 
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Key
} from 'lucide-react';
import { cn } from '../lib/utils';
import ThemeLanguageToggle from '../components/ThemeLanguageToggle';
import ChangePasswordModal from '../components/admin/ChangePasswordModal';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { theme, language } = useAppStore();
  const t = translations[language];
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Auto-collapse sidebar when in builder mode
  React.useEffect(() => {
    if (location.pathname.includes('/admin/builder/')) {
      setIsSidebarCollapsed(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t.admin.dashboard, end: true },
    { to: '/admin/forms', icon: List, label: t.admin.forms },
    { to: '/admin/publish', icon: Send, label: t.admin.publish },
    { to: '/admin/results', icon: Mail, label: t.admin.results },
    { to: '/admin/branding', icon: Palette, label: t.admin.branding },
    { to: '/admin/settings', icon: Settings, label: t.admin.settings, roles: ['super_admin'] },
  ].filter(item => !item.roles || item.roles.includes(user?.role || ''));

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-300", theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50')}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-semibold text-xl text-gray-900 dark:text-white hidden sm:block">PSYEDU RESEARCH</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeLanguageToggle />

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                <UserIcon size={18} />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mb-1">
                  {user?.role === 'super_admin' ? 'Super Admin' : 'Manager'}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
                  {user?.name}
                </p>
              </div>
              <ChevronDown size={16} className={cn("text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
            </button>

            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Key size={16} />
                    {language === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    {t.admin.logout}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {isChangePasswordOpen && (
        <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />
      )}


      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-10 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out flex flex-col pt-16 lg:pt-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsSidebarOpen(false)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                  isSidebarCollapsed && "justify-center px-0"
                )}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
          
          {/* Collapse Toggle Button (Desktop Only) */}
          <div className="hidden lg:flex p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex items-center justify-center w-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
