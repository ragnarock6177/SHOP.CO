"use client";

import React from "react";
import Link from "next/link";
import { AnimatedFooter } from "../ui/animated-footer";

const FOOTER_COLUMNS = [
  {
    title: "COMPANY",
    links: [
      { label: "About AIRAVÉ", href: "/about" },
      { label: "Our Story", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Press & Media", href: "/about" },
    ],
  },
  {
    title: "SHOP",
    links: [
      { label: "All Products", href: "/product" },
      { label: "New Arrivals", href: "/product?sort=newest" },
      { label: "Best Sellers", href: "/product?sort=popular" },
      { label: "Sale", href: "/product?sort=discount" },
    ],
  },
  {
    title: "CATEGORIES",
    links: [
      { label: "Casual Wear", href: "/product?category=casual" },
      { label: "Formal Outfits", href: "/product?category=formal" },
      { label: "Party Collections", href: "/product?category=party" },
      { label: "Gym & Activewear", href: "/product?category=gym" },
    ],
  },
  {
    title: "CUSTOMER CARE",
    links: [
      { label: "Help & Support", href: "/faq" },
      { label: "Shipping & Returns", href: "/delivery" },
      { label: "Track Order", href: "/profile" },
      { label: "Contact Us", href: "/faq" },
    ],
  },
  {
    title: "ACCOUNT",
    links: [
      { label: "My Profile", href: "/profile" },
      { label: "Order History", href: "/profile" },
      { label: "Shopping Cart", href: "/cart" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/terms" },
      { label: "Refund Policy", href: "/delivery" },
      { label: "Cookie Policy", href: "/terms" },
    ],
  },
] as const;

export const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden border-t border-gray-200 bg-[#F0F0F0] text-gray-600">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-6 pt-16 sm:px-6 sm:pb-8 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-12 xl:gap-10">
          <div className="space-y-5 text-center xl:col-span-4 xl:text-left">
            <Link href="/" className="inline-block">
              <span className="font-be-vietnam-pro-black text-2xl font-black tracking-tighter text-black sm:text-3xl">
                AIRAVÉ
              </span>
            </Link>

            <p className="mx-auto max-w-sm font-be-vietnam-pro text-sm leading-relaxed text-gray-600 xl:mx-0">
              Premium fashion for every moment. Discover curated styles crafted
              for comfort, confidence, and everyday elegance.
            </p>

            <div className="flex items-center justify-center gap-3 pt-1 xl:justify-start">
              {[
                {
                  label: "Twitter",
                  href: "https://twitter.com",
                  icon: (
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  ),
                  active: false,
                },
                {
                  label: "Facebook",
                  href: "https://facebook.com",
                  icon: (
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.048 0-2.606.942-2.606 2.502v1.474h3.766l-.546 3.667h-3.22v7.98H9.101z" />
                  ),
                  active: true,
                },
                {
                  label: "Instagram",
                  href: "https://instagram.com",
                  icon: (
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  ),
                  active: false,
                },
                {
                  label: "GitHub",
                  href: "https://github.com",
                  icon: (
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  ),
                  active: false,
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 sm:h-8 sm:w-8 ${
                    social.active
                      ? "border-black bg-black text-white hover:bg-gray-800"
                      : "border-gray-200 bg-white text-black shadow-xs hover:border-black hover:bg-black hover:text-white"
                  }`}
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="xl:col-span-8">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title} className="space-y-3 sm:space-y-4">
                  <h4 className="font-be-vietnam-pro-black text-[11px] font-bold uppercase tracking-[0.16em] text-black sm:text-xs">
                    {column.title}
                  </h4>
                  <ul className="space-y-2.5 font-be-vietnam-pro text-xs sm:space-y-3 sm:text-sm">
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}`}>
                        <Link
                          href={link.href}
                          className="inline-block text-gray-600 transition-colors duration-200 hover:text-black"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-300/70 pt-6 text-center font-be-vietnam-pro text-[11px] text-gray-500 sm:mt-12 sm:flex-row sm:pt-8 sm:text-left sm:text-xs">
          <p>AIRAVÉ &copy; 2000-2026. All Rights Reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {[
              { label: "VISA", className: "text-blue-800" },
              { label: "Mastercard", className: "text-red-600" },
              { label: "PayPal", className: "text-blue-600" },
              { label: "Pay", className: "text-black" },
              { label: "GPay", className: "text-blue-500" },
            ].map((badge) => (
              <span
                key={badge.label}
                className={`rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-extrabold shadow-2xs sm:text-[11px] ${badge.className}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-0 -mt-6 h-[180px] w-full overflow-hidden gpu-layer sm:-mt-10 sm:h-[240px] md:-mt-14 md:h-[300px] lg:-mt-16 lg:h-[360px] xl:h-[400px]">
        <AnimatedFooter
          headingLines={["AIRAVÉ"]}
          leftImage="/animated-footer/hand-left.jpg"
          rightImage="/animated-footer/hand-right.jpg"
          background="#F0F0F0"
          textColor="#000000"
          charColor="#8a8a8a"
          hoverColor="#111111"
          hoverCharColor="#ffffff"
          columns={96}
          cellSize={10}
          fontSize={10}
          parallaxStrength={4}
          hoverRadius={4}
          handWidthClass="w-[48%] sm:w-[45%] md:w-[43%] lg:w-[42%] max-w-[680px]"
          handsAlignmentClass="items-end sm:items-center"
        />
      </div>
    </footer>
  );
};

export default Footer;
