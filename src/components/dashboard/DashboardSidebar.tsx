import { TapHome as Home, TapGrid as LayoutGrid, TapSettings as Settings, TapChart as BarChart3, TapUser as User, TapSparkles as Sparkles, TapDollar as DollarSign } from '@/components/icons/TapIcons';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Aperçu', url: '/dashboard', icon: Home, end: true },
  { title: 'Pages', url: '/dashboard/pages', icon: LayoutGrid },
  { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
  { title: 'Profil', url: '/dashboard/profile', icon: User },
  { title: 'Paramètres', url: '/dashboard/settings', icon: Settings },
  { title: 'Affiliation', url: '/dashboard/affiliate', icon: DollarSign },
];

interface NavItemProps {
  item: { title: string; url: string; icon: React.ElementType; end?: boolean };
  collapsed: boolean;
  isActive: boolean;
}

const NavItem = ({ item, collapsed, isActive }: NavItemProps) => {
  const Icon = item.icon;
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <NavLink
          to={item.url}
          end={item.end}
          className={cn(
            "relative overflow-hidden transition-all duration-300 ease-out",
            "hover:bg-accent/50",
            "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
            "before:w-1 before:rounded-r-full before:bg-primary",
            "before:transition-all before:duration-300 before:ease-out",
            isActive 
              ? "before:h-6 before:opacity-100" 
              : "before:h-0 before:opacity-0"
          )}
          activeClassName="bg-accent/80 font-medium"
        >
          <Icon 
            className={cn(
              "h-4 w-4 transition-all duration-200",
              collapsed ? "" : "mr-2",
              isActive ? "text-primary scale-110" : "text-muted-foreground"
            )} 
          />
          {!collapsed && (
            <span 
              className={cn(
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-foreground"
              )}
            >
              {item.title}
            </span>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { subscription } = useAuth();

  const isActive = (path: string, end?: boolean) => {
    if (end) return currentPath === path;
    return currentPath.startsWith(path);
  };

  const planLabel = subscription.plan === 'pro' ? 'Pro' : subscription.plan === 'starter' ? 'Starter' : 'Free';
  const isFree = subscription.plan === 'free';

  return (
    <Sidebar collapsible="icon" className="border-r border-border/10">
      <SidebarContent className="pt-4 flex flex-col h-full">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <NavItem
                  key={item.title}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive(item.url, item.end)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Plan badge at bottom */}
        <div className="mt-auto px-3 pb-4">
          {!collapsed ? (
            <button
              onClick={() => navigate('/dashboard/settings')}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 text-left",
                isFree
                  ? "bg-gradient-to-r from-pop-violet/10 to-pop-coral/10 hover:from-pop-violet/20 hover:to-pop-coral/20 border border-pop-violet/20"
                  : "bg-accent/30 hover:bg-accent/50"
              )}
            >
              {isFree ? (
                <Sparkles className="w-3.5 h-3.5 text-pop-violet shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-pop-cyan to-pop-lime shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-[11px] font-semibold block",
                  isFree ? "text-pop-violet" : "text-foreground"
                )}>
                  {planLabel}
                </span>
                {isFree && (
                  <span className="text-[9px] text-muted-foreground">Upgrade →</span>
                )}
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard/settings')}
              className={cn(
                "w-full flex items-center justify-center py-2 rounded-xl transition-all duration-200",
                isFree
                  ? "bg-pop-violet/10 hover:bg-pop-violet/20"
                  : "bg-accent/30 hover:bg-accent/50"
              )}
              title={`Plan ${planLabel}`}
            >
              {isFree ? (
                <Sparkles className="w-3.5 h-3.5 text-pop-violet" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-pop-cyan to-pop-lime" />
              )}
            </button>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
