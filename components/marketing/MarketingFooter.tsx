'use client';

import React from 'react';
import Link from 'next/link';
import FindBLogo from '@/components/FindBLogo';

interface MarketingFooterProps {
  onOpenLogin: () => void;
}

export default function MarketingFooter({ onOpenLogin }: MarketingFooterProps) {
  return (
    <footer className="w-full px-4 sm:px-8 lg:px-16 pb-8 pt-12">
      <div className="mx-auto max-w-7xl rounded-[28px] sm:rounded-[36px] bg-[#0B1120] px-8 sm:px-12 lg:px-16 py-12 sm:py-16 shadow-2xl !text-white border border-slate-800">
        {/* Top Row: Brand Info + Navigation Columns */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16">
          {/* Left Column: Brand & Description */}
          <div className="max-w-md space-y-5">
            <Link href="/" aria-label="FindB Home" className="inline-block">
              <FindBLogo variant="light" size="lg" />
            </Link>
            <p className="text-sm sm:text-base !text-slate-300 leading-relaxed font-normal">
              FindB is the premier sales intelligence platform for discovering, qualifying, and exporting high-intent local business leads across any city in seconds.
            </p>
            <div className="flex items-center gap-3 text-xs !text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>Global Directory API Status: Operational</span>
            </div>
          </div>

          {/* Right Columns: Product, Resources, Account */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-14 shrink-0">
            {/* Column 1: Product */}
            <div>
              <h4 className="text-sm font-bold !text-white mb-4 tracking-wider uppercase">
                Product
              </h4>
              <ul className="space-y-3 text-sm list-none p-0 m-0 font-medium">
                <li>
                  <Link href="/#features" className="!text-slate-300 hover:!text-white transition-colors block">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="!text-slate-300 hover:!text-white transition-colors block">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="!text-slate-300 hover:!text-white transition-colors block">
                    FAQ
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="cursor-pointer text-left !text-slate-300 hover:!text-white transition-colors block font-medium"
                  >
                    API Access
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div>
              <h4 className="text-sm font-bold !text-white mb-4 tracking-wider uppercase">
                Resources
              </h4>
              <ul className="space-y-3 text-sm list-none p-0 m-0 font-medium">
                <li>
                  <Link href="/contact" className="!text-slate-300 hover:!text-white transition-colors block">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="!text-slate-300 hover:!text-white transition-colors block">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/cancel-subscription" className="!text-slate-300 hover:!text-white transition-colors block">
                    Manage Billing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Account */}
            <div>
              <h4 className="text-sm font-bold !text-white mb-4 tracking-wider uppercase">
                Account
              </h4>
              <ul className="space-y-3 text-sm list-none p-0 m-0 font-medium">
                <li>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="cursor-pointer text-left !text-slate-300 hover:!text-white transition-colors block font-medium"
                  >
                    Sign In
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="cursor-pointer text-left !text-slate-300 hover:!text-white transition-colors block font-medium"
                  >
                    Get Started Free
                  </button>
                </li>
                <li>
                  <Link href="/cancel-subscription" className="!text-slate-300 hover:!text-white transition-colors block">
                    Cancel Subscription
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-slate-800 my-8 sm:my-10" />

        {/* Bottom Bar: Copyright & Policies */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm !text-slate-400">
          <div className="space-y-0.5">
            <div>&copy; {new Date().getFullYear()} FindB Technologies Inc. All rights reserved.</div>
            <div className="text-[11px] text-slate-500">
              High-accuracy local B2B lead generation and intelligence.
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link href="/pricing" className="!text-slate-400 hover:!text-white transition-colors">
              Cookies Policy
            </Link>
            <span className="!text-slate-600">|</span>
            <Link href="/pricing" className="!text-slate-400 hover:!text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="!text-slate-600">|</span>
            <Link href="/pricing" className="!text-slate-400 hover:!text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
