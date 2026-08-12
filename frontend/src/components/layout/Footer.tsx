'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F0F0F0] text-gray-600 pt-28 sm:pt-36 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info & Social Icons */}
          <div className="md:col-span-4 space-y-5">
            <Link href="/" className="inline-block">
              <span className="font-integral text-2xl sm:text-3xl font-black tracking-tighter text-black">
                SHOP.CO
              </span>
            </Link>

            <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
              We have clothes that suits your style and which you're proud to wear. From women to men.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors shadow-sm"
                aria-label="Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-black text-white border border-black flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.048 0-2.606.942-2.606 2.502v1.474h3.766l-.546 3.667h-3.22v7.98H9.101z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors shadow-sm"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors shadow-sm"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            
            {/* COMPANY */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-black tracking-wider uppercase">
                COMPANY
              </h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-black transition-colors">About Us</Link></li>
                <li><Link href="/shop" className="hover:text-black transition-colors">Features</Link></li>
                <li><Link href="/about#works" className="hover:text-black transition-colors">Works</Link></li>
                <li><Link href="/about#career" className="hover:text-black transition-colors">Career</Link></li>
              </ul>
            </div>

            {/* HELP */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-black tracking-wider uppercase">
                HELP
              </h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/faq" className="hover:text-black transition-colors">Customer Support</Link></li>
                <li><Link href="/delivery" className="hover:text-black transition-colors">Delivery Details</Link></li>
                <li><Link href="/terms" className="hover:text-black transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/terms#privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* FAQ */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-black tracking-wider uppercase">
                FAQ
              </h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/profile" className="hover:text-black transition-colors">Account</Link></li>
                <li><Link href="/profile" className="hover:text-black transition-colors">Manage Deliveries</Link></li>
                <li><Link href="/profile" className="hover:text-black transition-colors">Orders</Link></li>
                <li><Link href="/profile" className="hover:text-black transition-colors">Payments</Link></li>
              </ul>
            </div>

            {/* RESOURCES */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-black tracking-wider uppercase">
                RESOURCES
              </h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about#ebooks" className="hover:text-black transition-colors">Free eBooks</Link></li>
                <li><Link href="/about#tutorials" className="hover:text-black transition-colors">Development Tutorial</Link></li>
                <li><Link href="/about#blog" className="hover:text-black transition-colors">How to - Blog</Link></li>
                <li><Link href="/about#youtube" className="hover:text-black transition-colors">Youtube Playlist</Link></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="pt-8 border-t border-gray-300/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            Shop.co &copy; 2000-2026. All Rights Reserved.
          </p>

          {/* Payment Card Badges */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white rounded-md border border-gray-200 font-extrabold text-[11px] text-blue-800">
              VISA
            </span>
            <span className="px-3 py-1 bg-white rounded-md border border-gray-200 font-extrabold text-[11px] text-red-600">
              Mastercard
            </span>
            <span className="px-3 py-1 bg-white rounded-md border border-gray-200 font-extrabold text-[11px] text-blue-600">
              PayPal
            </span>
            <span className="px-3 py-1 bg-white rounded-md border border-gray-200 font-extrabold text-[11px] text-black">
              Pay
            </span>
            <span className="px-3 py-1 bg-white rounded-md border border-gray-200 font-extrabold text-[11px] text-blue-500">
              GPay
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
