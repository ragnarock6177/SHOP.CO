import { cn } from '@/lib/utils';
import { Search, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-black sm:px-6 lg:px-8">
      <div className="flex flex-1 items-center gap-4">
        <form className="hidden w-full max-w-sm lg:flex">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              type="search"
              placeholder="Search (Cmd+K)"
              className="w-full appearance-none bg-neutral-50 pl-8 shadow-none dark:bg-neutral-900 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white border-neutral-200 dark:border-neutral-800"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-black dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-white">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-black dark:bg-white" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white">
              <Avatar className="h-8 w-8 border border-neutral-200 dark:border-neutral-800">
                <AvatarImage src="/placeholder-user.jpg" alt="@admin" />
                <AvatarFallback className="bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white">A</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-neutral-200 dark:border-neutral-800">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
            <DropdownMenuItem className="focus:bg-neutral-100 focus:text-black dark:focus:bg-neutral-800 dark:focus:text-white">Profile</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-neutral-100 focus:text-black dark:focus:bg-neutral-800 dark:focus:text-white">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
            <DropdownMenuItem className="focus:bg-neutral-100 focus:text-black dark:focus:bg-neutral-800 dark:focus:text-white">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
