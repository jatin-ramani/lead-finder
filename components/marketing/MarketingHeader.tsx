'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';

interface MarketingHeaderProps {
  onOpenLogin: () => void;
  activePath?: string;
  isTransparent?: boolean;
}

export default function MarketingHeader({
  onOpenLogin,
  activePath = '',
}: MarketingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="header-main-section">
      <div className="header ">
        <div className="header-df">
          {/* Logo on Left */}
          <div className="header-main-logo">
            <div className="header-logo">
              <Link
                href="/"
                data-discover="true"
                className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none shrink-0 no-underline"
              >
                {/* White Circular Badge with FindB Logo */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-xs transition-transform group-hover:scale-105 p-1.5 overflow-hidden">
                  <img
                    src="/logo/logo.svg"
                    alt="FindB Logo"
                    width={20}
                    height={20}
                    className="h-full w-full object-contain cursor-pointer"
                  />
                </div>
                <span className="text-xl sm:text-2xl font-bold tracking-tight !text-white select-none drop-shadow-xs">
                  FindB
                </span>
              </Link>
            </div>
          </div>

          {/* Menu + Language + Login Button + Responsive Button on Right */}
          <div className="header-menu-nd-login">
            <ul className="header-menu m-0 p-0">
              <li className={activePath === '/faq' ? 'active' : ''}>
                <Link href="/faq" data-discover="true">
                  F.A.Q
                </Link>
              </li>
              <li className={activePath === '/pricing' ? 'active' : ''}>
                <Link href="/pricing" data-discover="true">
                  Pricing
                </Link>
              </li>
              <li className={activePath === '/contact' ? 'active' : ''}>
                <Link href="/contact" data-discover="true">
                  Contact Us
                </Link>
              </li>
              <li className={activePath === '/cancel-subscription' ? 'active' : ''}>
                <Link href="/cancel-subscription" data-discover="true">
                  Cancel Subscription
                </Link>
              </li>
            </ul>

            <div className="header-lang-drop">
              <ul className="m-0 p-0">
                <li>
                  <div className="header_change_lang_icon" title="United Kingdom (English)">
                    <img
                      width="22"
                      height="22"
                      alt="Country Flag"
                      loading="lazy"
                      decoding="async"
                      title="GB"
                      src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/gb.svg"
                    />
                  </div>
                </li>
              </ul>
            </div>

            <div className="header-login-btn">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="hl_cta_wrap blob-btn no-underline"
                  aria-label="Dashboard"
                >
                  <span className="blob-btn__inner" aria-hidden="true">
                    <span className="blob-btn__blobs">
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                    </span>
                  </span>
                  <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-300">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 16 16"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                    </svg>
                    <span>Dashboard</span>
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="hl_cta_wrap blob-btn"
                  aria-label="Login"
                >
                  <span className="blob-btn__inner" aria-hidden="true">
                    <span className="blob-btn__blobs">
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                    </span>
                  </span>
                  <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-300">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 16 16"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path>
                    </svg>
                    <span>Login</span>
                  </span>
                </button>
              )}
            </div>

            <div className={`responsive-header-btn ${mobileMenuOpen ? 'active' : 'false'}`}>
              <span
                className="ant-dropdown-trigger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                role="button"
                tabIndex={0}
                aria-label="Toggle navigation menu"
              >
                <div className="ant-space css-mncuj7 ant-space-horizontal ant-space-align-center ant-space-gap-row-small ant-space-gap-col-small">
                  <div className="ant-space-item flex items-center justify-center">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Animated Dropdown Drawer (Floats Absolute over Hero in Pure Solid White) */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 w-full z-50 overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen
              ? 'max-h-[500px] opacity-100 shadow-[0_20px_50px_rgba(0,0,0,0.22)] border-b border-slate-200'
              : 'max-h-0 opacity-0 pointer-events-none'
          } bg-white px-5 py-4 text-slate-800`}
        >
          <div className="space-y-1">
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                activePath === '/faq'
                  ? 'bg-blue-50 font-bold'
                  : 'hover:bg-slate-50 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span
                  style={{ color: activePath === '/faq' ? '#2563EB' : '#0F172A' }}
                  className="!text-[#0F172A] font-semibold"
                >
                  F.A.Q
                </span>
              </div>
              <span className="text-[10px] text-slate-400">&rarr;</span>
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                activePath === '/pricing'
                  ? 'bg-blue-50 font-bold'
                  : 'hover:bg-slate-50 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span
                  style={{ color: activePath === '/pricing' ? '#2563EB' : '#0F172A' }}
                  className="!text-[#0F172A] font-semibold"
                >
                  Pricing
                </span>
              </div>
              <span className="text-[10px] text-slate-400">&rarr;</span>
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                activePath === '/contact'
                  ? 'bg-blue-50 font-bold'
                  : 'hover:bg-slate-50 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span
                  style={{ color: activePath === '/contact' ? '#2563EB' : '#0F172A' }}
                  className="!text-[#0F172A] font-semibold"
                >
                  Contact Us
                </span>
              </div>
              <span className="text-[10px] text-slate-400">&rarr;</span>
            </Link>
            <Link
              href="/cancel-subscription"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                activePath === '/cancel-subscription'
                  ? 'bg-blue-50 font-bold'
                  : 'hover:bg-slate-50 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span
                  style={{ color: activePath === '/cancel-subscription' ? '#2563EB' : '#0F172A' }}
                  className="!text-[#0F172A] font-semibold"
                >
                  Cancel Subscription
                </span>
              </div>
              <span className="text-[10px] text-slate-400">&rarr;</span>
            </Link>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3">
            {/* Language Row */}
            <div className="flex items-center justify-between px-3.5 py-1 text-xs">
              <span className="text-slate-500 font-medium">Language</span>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-semibold">
                <img
                  width="18"
                  height="18"
                  alt="GB Flag"
                  className="rounded-full shadow-2xs object-cover"
                  src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/gb.svg"
                />
                <span>English (UK)</span>
              </div>
            </div>

            {/* Prominent Login / Dashboard Button */}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="lf-btn-shine w-full cursor-pointer py-2.5 px-4 rounded-xl bg-[#1E6BFF] hover:bg-[#185adb] active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 no-underline"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                </svg>
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="lf-btn-shine w-full cursor-pointer py-2.5 px-4 rounded-xl bg-[#1E6BFF] hover:bg-[#185adb] active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 16 16">
                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path>
                </svg>
                <span>Login to FindB</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden SVG Goo Filter for Blob Hover Animation */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="6" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in2="goo" in="SourceGraphic" result="mix" />
          </filter>
        </defs>
      </svg>
    </header>
  );
}
