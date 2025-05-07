import React, { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
    Bell,
    BellRing,
    X,
    Check,
    UserPlus,
    UserCheck,
    UserMinus,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const NotificationPanel = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications from localStorage
    useEffect(() => {
        const loadNotifications = () => {
            try {
                const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
                setNotifications(stored);
                setUnreadCount(stored.filter(n => !n.read).length);
            } catch (error) {
                console.error('Error loading notifications:', error);
                setNotifications([]);
            }
        };

        loadNotifications();

        // Listen for new notifications
        const handleNewNotification = () => loadNotifications();
        window.addEventListener('new-notification', handleNewNotification);

        return () => {
            window.removeEventListener('new-notification', handleNewNotification);
        };
    }, []);

    // Mark a notification as read
    const markAsRead = (id) => {
        const updated = notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        );
        setNotifications(updated);
        localStorage.setItem('notifications', JSON.stringify(updated));
        setUnreadCount(updated.filter(n => !n.read).length);
        window.dispatchEvent(new Event("new-notification"));
    };
    const markAllAsRead = () => {
        const updated = notifications.map(notification => ({ ...notification, read: true }));
        setNotifications(updated);
        localStorage.setItem('notifications', JSON.stringify(updated));
        setUnreadCount(0);
        window.dispatchEvent(new Event("new-notification"));
    };
    const clearAll = () => {
        setNotifications([]);
        localStorage.setItem('notifications', JSON.stringify([]));
        window.dispatchEvent(new Event("new-notification"));
        setUnreadCount(0);
    };

    // Get icon based on notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new-guest':
                return <UserPlus className="h-5 w-5 text-blue-500" />;
            case 'check-in':
                return <UserCheck className="h-5 w-5 text-green-500" />;
            case 'check-out':
                return <UserMinus className="h-5 w-5 text-amber-500" />;
            default:
                return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className={cn(
            "fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "translate-x-full"
        )}>
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center space-x-2">
                    <BellRing className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Notifications</h2>
                    {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex justify-between items-center border-b px-4 py-2">
                <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                    Mark all as read
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll} disabled={notifications.length === 0}>
                    Clear all
                </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-105px)]">
                {notifications.length > 0 ? (
                    <div className="py-2">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "px-4 py-3 border-b hover:bg-gray-50 transition-colors relative",
                                    !notification.read && "bg-blue-50"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{notification.title}</p>
                                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                                        {notification.details && notification.details.length > 0 && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs border border-gray-100">
                                                {notification.details.map((detail, idx) => (
                                                    <div key={idx} className="flex justify-between mb-1 last:mb-0">
                                                        <span className="text-gray-500">{detail.label}:</span>
                                                        <span className="font-medium">{detail.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 mt-2">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 absolute top-3 right-3"
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 px-4 text-center">
                        <Bell className="h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-gray-500">No notifications yet</p>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default NotificationPanel;