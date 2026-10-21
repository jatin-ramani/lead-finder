'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FindBLogo from '@/components/FindBLogo';

interface MarketingHeaderProps {
  onOpenLogin: () => void;
  activePath?: string;
}

export default function MarketingHeader({
  onOpenLogin,
  activePath = '',
}: MarketingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="w-full pt-4 sm:pt-6">
      <header className="w-full z-40 bg-white/10 backdrop-blur-md transition-all border-y border-white/10">
        <div className="mx-auto max-w-7xl flex h-[76px] sm:h-[78px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Left: FindB Brand Logo */}
          <Link
            href="/"
            className="group focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-xl"
            aria-label="FindB Home"
          >
            <FindBLogo variant="light" size="md" />
          </Link>

          {/* Center & Right Navigation: Features, Pricing, FAQ, Login */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <nav className="hidden items-center gap-6 lg:gap-8 md:flex" aria-label="Main Navigation">
              <Link
                href="/#features"
                className="text-sm lg:text-[15px] font-semibold text-white/90 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className={`text-sm lg:text-[15px] font-semibold text-white/90 hover:text-white transition-colors ${
                  activePath === '/pricing' ? 'text-white underline underline-offset-8 font-bold' : ''
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/faq"
                className={`text-sm lg:text-[15px] font-semibold text-white/90 hover:text-white transition-colors ${
                  activePath === '/faq' ? 'text-white underline underline-offset-8 font-bold' : ''
                }`}
              >
                FAQ
              </Link>
            </nav>

            {/* Login Button */}
            <button
              type="button"
              onClick={onOpenLogin}
              aria-label="Log in to FindB"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-cyan-400/50 bg-white/10 hover:bg-white/20 active:scale-95 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all backdrop-blur-xs select-none"
            >
              <svg
                className="h-4 w-4 fill-current text-cyan-300 shrink-0"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Login</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white md:hidden hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#1E1B4B]/95 backdrop-blur-xl px-6 py-5 space-y-4 text-white">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold hover:text-cyan-300 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold hover:text-cyan-300 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold hover:text-cyan-300 transition-colors"
            >
              FAQ
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 font-bold text-sm shadow-md"
            >
              Log in to Dashboard
            </button>
          </div>
        )}
      </header>
    </div>
  );
}
