"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const underlineClasses =
  "absolute bottom-0 left-0 h-[2px] w-full origin-left bg-black transition-transform duration-300 ease-out";

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
      className={cn(
        "group relative inline-flex shrink-0 items-center whitespace-nowrap py-1 transition-colors hover:text-neutral-600",
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(underlineClasses, isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")}
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
      className={cn(
        "group relative inline-flex shrink-0 items-center whitespace-nowrap py-1 transition-colors hover:text-neutral-600 focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden
        className={cn(underlineClasses, isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")}
      />
    </button>
  );
}

export function isNavLinkActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`);
}
