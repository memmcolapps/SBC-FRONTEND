import { SidebarProvider } from "@/components/ui/sidebar";
import "../styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { SidebarNav } from "@/components/sidebar-nav";

export const metadata: Metadata = {
  title: "Smart Breaker Controller",
  description: "Made By Momas R&D Team",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <SidebarProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <SidebarNav />
            <main className="flex-1 overflow-auto p-8">{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
