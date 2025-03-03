import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationFeed } from "@/components/notifications/notification-feed";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notifications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Notification Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationFeed />
        </CardContent>
      </Card>
    </div>
  );
}
