import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ArrowLeftRight, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Shield,
  Bell
} from 'lucide-react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useSidebarContext } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: CreditCard, label: 'Accounts', path: '/accounts' },
  { icon: ArrowLeftRight, label: 'Transactions', path: '/transactions' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
];

const bottomItems = [
  { icon: Shield, label: 'Security', path: '/security' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function AppSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebarContext();
  const location = useLocation();

  const NavItem = ({ icon: Icon, label, path }: { icon: any; label: string; path: string }) => {
    const isActive = location.pathname === path;
    
    return (
      <RouterNavLink
        to={path}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
          isActive 
            ? 'bg-sidebar-accent text-sidebar-primary' 
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-sidebar-primary')} />
        {!isCollapsed && (
          <span className={cn('font-medium text-sm', isActive && 'text-sidebar-accent-foreground')}>
            {label}
          </span>
        )}
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
        )}
      </RouterNavLink>
    );
  };

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar flex flex-col transition-all duration-300 ease-in-out relative',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'h-16 flex items-center border-b border-sidebar-border px-4',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground text-lg">AdminPro</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
            <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* Bottom Items */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </div>

      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-soft hover:bg-secondary transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
