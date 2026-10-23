'use client';

import Link from 'next/link';

interface MarketingFooterProps {
  onOpenLogin: () => void;
  className?: string;
}

export default function MarketingFooter({ onOpenLogin, className = '' }: MarketingFooterProps) {
  return (
    <footer className={`w-full bg-[#0B1B2F] lg:bg-[#F9FAFB] pt-0 lg:pt-6 pb-0 lg:pb-12 lg:px-6 xl:px-12 transition-all ${className}`}>
      <div className="w-full mx-auto max-w-7xl rounded-none lg:rounded-[36px] bg-[#0B1B2F] px-5 sm:px-8 lg:px-14 xl:px-16 py-10 sm:py-12 lg:py-14 shadow-none lg:shadow-2xl !text-white border-0 lg:border border-slate-800/80">
        {/* Top Row: Brand Info + Navigation Columns */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16">
          {/* Left Column: Brand & Description */}
          <div className="max-w-md space-y-4">
            <div className="h-[30px] lg:h-[45px] flex items-center gap-2 lg:gap-2.5 shrink-0 select-none">
              <div className="h-[30px] w-[30px] lg:h-[45px] lg:w-[45px] shrink-0 flex items-center justify-center rounded-full bg-white shadow-md p-0.5 lg:p-1 overflow-hidden">
                <img
                  src="/logo/logo.svg"
                  alt="FindB Logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain mt-[3px]"
                />
              </div>
              <span className="text-[22px] lg:text-[34px] font-black tracking-tight !text-white select-none leading-none">
                FindB
              </span>
            </div>
            <p className="text-xs sm:text-sm !text-slate-300 leading-relaxed font-normal">
              FindB helps agencies, consultants, and outbound sales teams discover high-intent local businesses, uncover companies without websites, and acquire verified contact emails and phone numbers worldwide.
            </p>
          </div>

          {/* Right Columns: Legal info + Account */}
          <div className="flex flex-wrap sm:flex-nowrap gap-10 sm:gap-20 lg:gap-28 shrink-0">
            {/* Column 1: Legal info */}
            <div>
              <h4 className="text-sm font-bold !text-white mb-3 tracking-normal">
                Legal info
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm list-none p-0 m-0 font-medium">
                <li>
                  <Link href="/pricing" className="!text-slate-300 hover:!text-white transition-colors block">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="!text-slate-300 hover:!text-white transition-colors block">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="!text-slate-300 hover:!text-white transition-colors block">
                    F.A.Q
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Account */}
            <div>
              <h4 className="text-sm font-bold !text-white mb-3 tracking-normal">
                Account
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm list-none p-0 m-0 font-medium">
                <li>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="cursor-pointer text-left !text-slate-300 hover:!text-white transition-colors block font-medium"
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="cursor-pointer text-left !text-slate-300 hover:!text-white transition-colors block font-medium"
                  >
                    Sign up
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
        <div className="border-t border-white/10 my-8 sm:my-10" />

        {/* Bottom Bar: Copyright & Policies */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs !text-slate-400">
          <div className="space-y-0.5 !text-slate-400">
            <div>FindB &middot; 2026</div>
            <div>FindB Technologies LLC &middot; All rights reserved</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link href="/cookies-policy" className="!text-slate-400 hover:!text-white transition-colors">
              Cookies Policy
            </Link>
            <span className="!text-white/20">|</span>
            <Link href="/privacy-policy" className="!text-slate-400 hover:!text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="!text-white/20">|</span>
            <Link href="/terms-and-conditions" className="!text-slate-400 hover:!text-white transition-colors">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
