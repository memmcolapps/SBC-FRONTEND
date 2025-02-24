"use client";

import { Bell, FileText, Grid, Home, Users, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Organizational \n Management",
    href: "/organization",
    icon: Users,
  },
  {
    title: "Breaker Management",
    href: "/breakers",
    icon: Grid,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Audit Logs",
    href: "/audit",
    icon: FileText,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="h-full bg-[#dddbff]">
      <Sidebar className="m-10 h-screen bg-[#ffffff]">
        <SidebarHeader className="flex h-48 items-center justify-center p-4">
          <div className="p-4 text-xl font-bold">Smart Breaker Controller</div>
        </SidebarHeader>
        <SidebarContent className="px-4">
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href} className="py-6">
                  <SidebarMenuButton
                    asChild
                    className={`group w-full rounded-lg transition-all duration-200 hover:bg-[#16085F] hover:text-[#ffffff] ${
                      isActive ? "bg-[#16085F] text-[#ffffff]" : ""
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3"
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="text-xl font-medium transition-transform group-hover:translate-x-1">
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
              <SidebarMenuButton className="text-red-600 hover:bg-red-100 hover:text-red-700">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
