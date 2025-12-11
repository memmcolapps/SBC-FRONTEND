"use client";
import {
  Bell,
  FileText,
  Grid,
  LogOut,
  UserRoundPen,
  LayoutDashboard,
  UserRound,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { type ReactElement } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: ReactElement<LucideIcon>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} className="shrink-0" />,
  },
  {
    title: "Operator Management",
    href: "/operators",
    icon: <UserRound size={20} />,
  },
  {
    title: "Breaker Management",
    href: "/breakers",
    icon: <Grid size={20} />,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: <Bell size={20} />,
  },
  {
    title: "Audit Logs",
    href: "/audit",
    icon: <FileText size={20} />,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: <UserRoundPen size={20} />,
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <Sidebar className="h-screen bg-[#dddbff] p-8">
      <div className="flex h-full flex-col bg-[#ffffff]">
        <SidebarHeader className="flex items-center justify-center pt-14">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <div className="relative">
              <Image
                width={200}
                height={43}
                alt="MOMAS/EPAIL Logo"
                src="/sea-logo.png"
                className="mx-auto drop-shadow-lg"
                priority
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-lg"></div>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="flex-1 px-4 pt-8">
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href} className="h-full">
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "group w-full rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#16085F] hover:to-[#2a1b8f] hover:text-[#ffffff] hover:shadow-lg hover:scale-105",
                      isActive ? "bg-gradient-to-r from-[#16085F] to-[#2a1b8f] text-[#ffffff] shadow-lg" : "",
                    )}
                  >
                    <Link
                      href={item.href}
                      className="flex h-full items-center gap-3 px-4 py-3"
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.icon}
                      <span className="break-words text-lg font-medium transition-transform group-hover:translate-x-1">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem className="my-6">
              <SidebarMenuButton
                className="text-red-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 hover:text-red-700 transition-all duration-300 hover:shadow-md"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4 transition-transform hover:scale-110" />
                <span className="font-medium">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
