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

const mainItems = [
  { title: 'Aperçu', url: '/dashboard', icon: Home, end: true },
  { title: 'Pages', url: '/dashboard/pages', icon: LayoutGrid },
];

const toolsItems = [
  { title: 'Thèmes', url: '/dashboard/themes', icon: Palette },
  { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
];

const settingsItems = [
  { title: 'Profil', url: '/dashboard/profile', icon: User },
  { title: 'Paramètres', url: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string, end?: boolean) => {
    if (end) return currentPath === path;
    return currentPath.startsWith(path);
  };

  const allItems = [...mainItems, ...toolsItems, ...settingsItems];
  const hasActiveMain = mainItems.some((i) => isActive(i.url, i.end));
  const hasActiveTools = toolsItems.some((i) => isActive(i.url));
  const hasActiveSettings = settingsItems.some((i) => isActive(i.url));

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.end)}>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className={collapsed ? '' : 'mr-2 h-4 w-4'} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Outils</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className={collapsed ? '' : 'mr-2 h-4 w-4'} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Paramètres</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className={collapsed ? '' : 'mr-2 h-4 w-4'} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
