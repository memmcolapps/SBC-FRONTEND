"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type { Notification } from "@/types";

const notifications: Notification[] = [
  {
    id: "1",
    type: "critical",
    title: "Critical Alert",
    message: "Breaker XYZ has failed",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    type: "warning",
    title: "Warning",
    message: "Breaker ABC is nearing capacity",
    timestamp: new Date().toISOString(),
  },
  {
    id: "6",
    type: "info",
    title: "Info",
    message: "Breaker ABC is on",
    timestamp: new Date().toISOString(),
  },
  {
    id: "3",
    type: "warning",
    title: "Warning",
    message: "Breaker 980 is nearing capacity",
    timestamp: new Date().toISOString(),
  },
  {
    id: "4",
    type: "warning",
    title: "Warning",
    message: "Breaker 123 is nearing capacity",
    timestamp: new Date().toISOString(),
  },
];

export function NotificationFeed() {
  // Function to determine background color based on notification type
  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-[#FDC2C2]";
      case "warning":
        return "bg-[#F8FDB8]";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          className={getBackgroundColor(notification.type)}
        >
          <AlertTitle className="text-xl">{notification.title}</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col gap-3 text-lg">
              <p>{notification.message}</p>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
