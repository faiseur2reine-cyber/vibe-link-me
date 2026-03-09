import { Home, LayoutGrid, Settings, Palette, BarChart3, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const mainItems = [
  { title: 'Aperçu', url: '/dashboard', icon: Home, end: true },
  { title: 'Pages', url: '/dashboard/pages', icon: LayoutGrid },
];

const toolsItems = [
  { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
];

const settingsItems = [
  { title: 'Profil', url: '/dashboard/profile', icon: User },
  { title: 'Paramètres', url: '/dashboard/settings', icon: Settings },
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
            // Active indicator bar with animation
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
  const currentPath = location.pathname;

  const isActive = (path: string, end?: boolean) => {
    if (end) return currentPath === path;
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "transition-opacity duration-200",
            collapsed ? 'sr-only' : ''
          )}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "transition-opacity duration-200",
            collapsed ? 'sr-only' : ''
          )}>
            Outils
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <NavItem 
                  key={item.title} 
                  item={item} 
                  collapsed={collapsed}
                  isActive={isActive(item.url)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "transition-opacity duration-200",
            collapsed ? 'sr-only' : ''
          )}>
            Paramètres
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <NavItem 
                  key={item.title} 
                  item={item} 
                  collapsed={collapsed}
                  isActive={isActive(item.url)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
