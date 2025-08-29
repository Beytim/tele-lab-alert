import { NavLink, useLocation } from "react-router-dom";
import { FlaskConical, Monitor, Stethoscope, Settings, Users, History, Upload, Home, MessageCircle } from "lucide-react";
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
} from "@/components/ui/sidebar";

const departments = [
  { title: "Laboratory", url: "/", icon: FlaskConical },
  { title: "Radiology", url: "/radiology", icon: Monitor },
  { title: "Gastroenterology", url: "/gi", icon: Stethoscope },
  { title: "Telegram Notifications", url: "/notifications", icon: MessageCircle },
];

const quickActions = [
  { title: "Upload Files", url: "/?tab=upload", icon: Upload },
  { title: "Patient Management", url: "/?tab=patients", icon: Users },
  { title: "Notification History", url: "/?tab=history", icon: History },
  { title: "Telegram Setup", url: "/telegram-setup", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/" || currentPath === "";
    }
    return currentPath === path;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Hospital Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Home className="h-8 w-8 text-primary" />
            {state !== "collapsed" && (
              <div>
                <h2 className="font-bold text-lg">Girum Hospital</h2>
                <p className="text-sm text-muted-foreground">Notification System</p>
              </div>
            )}
          </div>
        </div>

        {/* Departments */}
        <SidebarGroup>
          <SidebarGroupLabel>Departments</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {departments.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
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