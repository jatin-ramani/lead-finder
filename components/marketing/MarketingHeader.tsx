'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileBtnRef.current &&
        !mobileBtnRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

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
                className="w-[125px] h-[30px] lg:w-[190px] lg:h-[45px] flex items-center gap-2 lg:gap-3 group focus:outline-none shrink-0 no-underline select-none"
              >
                {/* White Circular Badge with FindB Logo */}
                <div className="h-[26px] w-[26px] lg:h-[38px] lg:w-[38px] shrink-0 flex items-center justify-center rounded-full bg-white shadow-xs transition-transform group-hover:scale-105 p-1 lg:p-1.5 overflow-hidden">
                  <img
                    src="/logo/logo.svg"
                    alt="FindB Logo"
                    width={24}
                    height={24}
                    className="h-full w-full object-contain cursor-pointer"
                  />
                </div>
                <span className="text-[18px] lg:text-[27px] font-bold tracking-tight !text-white select-none drop-shadow-xs leading-none">
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

            <div ref={mobileBtnRef} className={`responsive-header-btn ${mobileMenuOpen ? 'active' : 'false'}`}>
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

        {/* Mobile Gradient Floating Dropdown Menu (Tracelo Style) */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden absolute right-4 sm:right-8 top-[calc(100%+8px)] w-[230px] sm:w-[250px] z-50 text-white animate-in fade-in zoom-in-95 duration-150"
            style={{
              background: 'linear-gradient(135deg, #DE4787 0%, #B139BE 45%, #6E5AEB 100%)',
              borderRadius: '20px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
              padding: '16px',
            }}
          >
            <ul className="space-y-1 list-none p-0 m-0 text-left">
              <li>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-white font-medium text-sm rounded-xl transition-colors no-underline ${
                    activePath === '/faq' ? 'bg-white/20 font-bold' : 'hover:bg-white/15'
                  }`}
                >
                  F.A.Q
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-white font-medium text-sm rounded-xl transition-colors no-underline ${
                    activePath === '/pricing' ? 'bg-white/20 font-bold' : 'hover:bg-white/15'
                  }`}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-white font-medium text-sm rounded-xl transition-colors no-underline ${
                    activePath === '/contact' ? 'bg-white/20 font-bold' : 'hover:bg-white/15'
                  }`}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/cancel-subscription"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-white font-medium text-sm rounded-xl transition-colors no-underline ${
                    activePath === '/cancel-subscription' ? 'bg-white/20 font-bold' : 'hover:bg-white/15'
                  }`}
                >
                  Cancel Subscription
                </Link>
              </li>
              <li className="pt-2">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="cursor-pointer w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full border border-white text-white font-bold text-xs hover:bg-white hover:text-[#503BF6] transition-all shadow-xs no-underline"
                  >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 16 16">
                      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                    </svg>
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="cursor-pointer w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full border border-white text-white font-bold text-xs hover:bg-white hover:text-[#503BF6] transition-all shadow-xs"
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 16 16"
                      height="14"
                      width="14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path>
                    </svg>
                    <span>Login</span>
                  </button>
                )}
              </li>
            </ul>
          </div>
        )}
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
