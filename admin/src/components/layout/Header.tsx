"use client";

import React from "react";
import { Search, Bell, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function Header() {
  const { user, logout } = useAuth();

  const getInitials = () => {
    if (!user) return "A";
    const first = user.firstName ? user.firstName[0] : "";
    const last = user.lastName ? user.lastName[0] : "";
    return (first + last).toUpperCase() || user.email[0].toUpperCase() || "A";
  };

  const getDisplayName = () => {
    if (!user) return "Admin User";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-1 items-center gap-4">
        <form className="hidden w-full max-w-sm lg:flex">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              type="search"
              placeholder="Search Orders, SKUs, Customers..."
              className="w-full appearance-none border-zinc-800 bg-zinc-900 pl-8 text-xs text-zinc-100 placeholder-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100">
          <span className="sr-only">View notifications</span>
          <Bell className="h-4 w-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-1 focus:ring-zinc-400">
              <Avatar className="h-8 w-8 border border-zinc-800 bg-zinc-900">
                <AvatarFallback className="bg-zinc-900 text-xs font-semibold text-zinc-100">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-zinc-800 bg-zinc-900 text-zinc-100">
            <DropdownMenuLabel className="flex flex-col space-y-1">
              <span className="text-xs font-semibold text-zinc-100">{getDisplayName()}</span>
              <span className="text-[10px] text-zinc-400">{user?.email}</span>
              {user?.isSuperAdmin && (
                <span className="inline-block w-max rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300">
                  SUPER ADMIN
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="flex items-center gap-2 text-xs focus:bg-zinc-800 focus:text-zinc-100">
              <User className="h-3.5 w-3.5" />
              <span>Staff Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="flex items-center gap-2 text-xs text-red-400 focus:bg-zinc-800 focus:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Header;
