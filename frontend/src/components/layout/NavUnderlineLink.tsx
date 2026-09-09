"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const navItemClasses =
  "group relative inline-flex shrink-0 items-center whitespace-nowrap py-1 transition-colors hover:text-neutral-600";

const underlineClasses =
  "pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-black transition-[width] duration-300 ease-out group-hover:w-full";

const underlineActiveClasses = "w-full";

interface NavUnderlineLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function NavUnderlineLink({
  href,
  children,
  isActive = false,
  className,
  onClick,
}: NavUnderlineLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(navItemClasses, className)}
    >
      {children}
      <span
        aria-hidden
        className={cn(underlineClasses, isActive && underlineActiveClasses)}
      />
    </Link>
  );
}

interface NavUnderlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export function NavUnderlineButton({
  children,
  isActive = false,
  className,
  ...props
}: NavUnderlineButtonProps) {
  return (
    <button
      type="button"
      className={cn(navItemClasses, "focus:outline-none", className)}
      {...props}
    >
      {children}
      <span
        aria-hidden
        className={cn(underlineClasses, isActive && underlineActiveClasses)}
      />
    </button>
  );
}

export function isNavLinkActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`);
}
