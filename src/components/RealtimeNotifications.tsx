import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertCircle, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RealtimeNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  department: string;
  patientId?: string;
  read: boolean;
}

export const RealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // In real implementation, this would be WebSocket or Server-Sent Events
      const mockNotifications: RealtimeNotification[] = [
        {
          id: Date.now().toString(),
          type: 'success',
          title: 'Lab Results Sent',
          message: 'CBC results successfully delivered to John Smith',
          timestamp: new Date().toISOString(),
          department: 'Laboratory',
          patientId: 'P001',
          read: false
        }
      ];

      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        const newNotification = mockNotifications[0];
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        setUnreadCount(prev => prev + 1);
        
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [toast]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-warning" />;
      default: return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Real-time Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No recent notifications
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                notification.read ? 'bg-muted/30' : 'bg-accent/50'
              }`}
            >
              {getIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {notification.department}
                    </Badge>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};