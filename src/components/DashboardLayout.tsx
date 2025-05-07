import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UsersRound,
  Clock,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuthProvider";
import NotificationPanel from "./NotificationPanel";

const DashboardLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Update unread notification count
  useEffect(() => {
    const countUnreadNotifications = () => {
      try {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const unreadCount = notifications.filter(n => !n.read).length;
        setUnreadNotificationCount(unreadCount);
      } catch (error) {
        console.error('Error counting unread notifications:', error);
        setUnreadNotificationCount(0);
      }
    };

    countUnreadNotifications();

    // Listen for new notifications
    const handleNewNotification = () => countUnreadNotifications();
    window.addEventListener('new-notification', handleNewNotification);

    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, []);
  useEffect(() => {
    const handleShowNotificationPanel = () => {
      setNotificationPanelOpen(true);
    };

    window.addEventListener('show-notification-panel', handleShowNotificationPanel);

    return () => {
      window.removeEventListener('show-notification-panel', handleShowNotificationPanel);
    };
  }, []);


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 mr-2" />
    },
    {
      to: "/visits",
      label: "Visits",
      icon: <Clock className="w-5 h-5 mr-2" />
    },
    {
      to: "/guards",
      label: "Guards",
      icon: <UsersRound className="w-5 h-5 mr-2" />
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transition-transform duration-300 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
<div className="flex flex-col items-center border-b px-5 py-5 text-center md:flex-row md:justify-center md:px-12">
  <ShieldCheck className="h-6 w-6 text-primary" />
  <span className="text-sm font-semibold md:ml-2">Premier Security Portal</span>
</div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
              end={item.to === "/"}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:ml-64" : ""
        )}
      >
        {/* Page header */}
        <header className="border-b bg-white p-4 sticky top-0 z-30 shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-center md:text-left w-full md:w-auto">
              {navItems.find(item => location.pathname === item.to ||
                (location.pathname === "/" && item.to === "/"))?.label || "Dashboard"}
            </h1>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>
        <div className="container py-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;