import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationFeed } from "@/components/notifications/notification-feed";

export default function NotificationsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Notifications</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Notification Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationFeed />
        </CardContent>
      </Card>
    </div>
  );
}
