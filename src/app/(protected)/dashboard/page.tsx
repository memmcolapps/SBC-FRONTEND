// src/app/(protected)/dashboard/page.tsx
// This file is a server component by default.
import DashboardClientContent from './dashboard-client-content';

export default function DashboardPage() {
  // We're now just rendering the client component.
  // No hooks, no state, no browser APIs here.
  return <DashboardClientContent />;
}