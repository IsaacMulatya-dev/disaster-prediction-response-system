import { useState, useEffect } from 'react';
import { Bell, Check, X, AlertTriangle, Info, CheckCircle, AlertCircle, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  is_read: boolean;
  created_at: string;
}

interface AlertData {
  id: string;
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  location: string;
  description: string;
  timestamp: string;
  status: 'active' | 'resolved';
  affectedPopulation: number;
}

const notificationIcons = {
  alert: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  success: CheckCircle,
};

const notificationColors = {
  alert: 'text-red-500',
  warning: 'text-orange-500',
  info: 'text-blue-500',
  success: 'text-green-500',
};

const notificationBadgeColors = {
  alert: 'bg-red-100 text-red-800',
  warning: 'bg-orange-100 text-orange-800',
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
};

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

// Mock recent alerts data
const RECENT_ALERTS: AlertData[] = [
  { id: '1', type: 'Flood', severity: 'high', location: 'Mombasa', description: 'Heavy rainfall causing flooding in coastal areas', timestamp: '2 min ago', status: 'active', affectedPopulation: 150000 },
  { id: '2', type: 'Fire', severity: 'moderate', location: 'Nakuru', description: 'Wildfire spreading in national park', timestamp: '15 min ago', status: 'active', affectedPopulation: 25000 },
  { id: '3', type: 'Storm', severity: 'critical', location: 'Eldoret', description: 'Severe thunderstorm with strong winds', timestamp: '1 hour ago', status: 'active', affectedPopulation: 80000 },
  { id: '4', type: 'Drought', severity: 'high', location: 'Turkana', description: 'Prolonged drought affecting livestock and agriculture', timestamp: '30 min ago', status: 'active', affectedPopulation: 120000 },
  { id: '5', type: 'Landslide', severity: 'moderate', location: 'Muranga', description: 'Heavy rains causing soil erosion and landslides', timestamp: '45 min ago', status: 'active', affectedPopulation: 35000 },
];

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.user_id) return;

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.user_id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.user_id]);

  const fetchNotifications = async () => {
    if (!profile?.user_id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!profile?.user_id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.user_id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Recent Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {RECENT_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className="border rounded-lg p-3 space-y-2 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{alert.type}</h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${severityColors[alert.severity]}`}
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {alert.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {alert.affectedPopulation.toLocaleString()} affected
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {alert.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-muted-foreground">No notifications</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
                
                return (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-3 space-y-2 ${
                      !notification.is_read ? 'bg-muted/30 border-primary/20' : 'bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <Icon className={`h-4 w-4 mt-0.5 ${notificationColors[notification.type]}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <Badge
                              variant="outline"
                              className={`text-xs ${notificationBadgeColors[notification.type]}`}
                            >
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="ml-2"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}