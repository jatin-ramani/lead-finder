'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import LoginModal from '@/components/marketing/LoginModal';
import { Alert } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

export default function CancelSubscriptionPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [cancelled, setCancelled] = useState(false);

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setCancelled(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-[#4F46E5] selection:text-white">
      {/* Wave Banner with Embedded Translucent Navbar */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#503BF6] via-[#A832E5] to-[#EE4B7B] pb-28 sm:pb-36 rounded-b-[48px] sm:rounded-b-[68px] shadow-lg">
        <MarketingHeader onOpenLogin={() => setIsLoginOpen(true)} activePath="/cancel-subscription" />

        <div className="mx-auto max-w-7xl px-4 pt-28 sm:pt-36 lg:pt-44 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight !text-white drop-shadow-sm">
            Cancel Subscription
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 pb-24">

        {/* Top Centered Cancellation Card */}
        <div className="mx-auto max-w-2xl px-4 sm:px-6 -mt-20 sm:-mt-28 relative z-10">
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-2xl border border-slate-200/80 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Cancel Your Subscription
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Enter your email address below. This will immediately turn off auto-renewal and prevent any future charges. It takes less than 10 seconds.
            </p>

            {cancelled ? (
              <Alert
                type="success"
                message="Subscription Cancelled"
                description="Your subscription auto-renewal has been successfully turned off. You will retain access until the end of your current billing cycle with no future charges."
                showIcon
                className="mt-6 rounded-2xl p-4 text-left"
              />
            ) : (
              <form onSubmit={handleCancel} className="mt-6 text-left space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="hello@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-hidden transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="cursor-pointer w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md transition-all"
                >
                  Cancel Subscription
                </button>

                <div className="my-5 flex items-center justify-center">
                  <span className="h-px flex-1 bg-slate-200"></span>
                  <span className="px-3 text-xs text-slate-400 font-medium">Or</span>
                  <span className="h-px flex-1 bg-slate-200"></span>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setCancelled(true)}
                    className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Cancel with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCancelled(true)}
                    className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-xl bg-black text-white py-3 text-sm font-semibold hover:bg-neutral-900 transition-colors shadow-xs"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.95-2.92-.93.04-2.04.62-2.7 1.4-.58.67-1.09 1.76-.95 2.81 1.04.08 2.07-.52 2.7-1.29z" />
                    </svg>
                    <span>Cancel with Apple</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCancelled(true)}
                    className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] text-white py-3 text-sm font-semibold hover:bg-[#166FE5] transition-colors shadow-xs"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Cancel with Facebook</span>
                  </button>
                </div>

                <div className="pt-3 text-center">
                  <p className="text-xs text-slate-500">
                    If you don&apos;t remember which email you used,{' '}
                    <Link href="/contact" className="text-[#2563EB] font-bold hover:underline">
                      contact support
                    </Link>
                    .
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Section 2: Why was I charged? */}
        <section className="mt-20 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-12">
            Why was I charged?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Trial period card */}
            <div className="rounded-3xl bg-[#F1F5F9] p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-extrabold text-[#2563EB] bg-white border border-blue-200/90 rounded-full shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                  Trial period
                </span>
                <div className="text-4xl font-extrabold text-[#0F172A] mt-4">₹109</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">24 Hour Trial</div>
                <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                  FindB operates on a monthly subscription basis. Your initial payment grants unrestricted access to all platform services for 24 hours. After that period, the subscription fee of ₹2,495 per month applies.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-700 list-none p-0">
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-emerald-500" /> Discovers local businesses in any city or niche
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-emerald-500" /> Filters companies without a website
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-emerald-500" /> Automated deep email &amp; phone scraper
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-emerald-500" /> Unlimited formula-safe CSV exports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-emerald-500" /> Worldwide coverage across 190+ countries
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-emerald-500" /> Support via email 24 hours
                  </li>
                </ul>
              </div>
            </div>

            {/* Subscription card */}
            <div className="rounded-3xl bg-[#2563EB] text-white p-8 border border-blue-400/40 shadow-lg flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 text-xs font-bold text-[#2563EB] bg-white rounded-full">
                  Subscription
                </span>
                <div className="text-4xl font-extrabold text-white mt-4">₹2,495</div>
                <div className="text-xs font-medium text-blue-100 mt-1">Monthly fee</div>
                <p className="text-xs text-blue-100 mt-4 leading-relaxed">
                  Once the 24 hour trial period has ended, the offer will automatically renew to a monthly subscription. Remember that you can cancel the subscription whenever you want.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-white list-none p-0">
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-white" /> Discovers local businesses in any city or niche
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-white" /> Filters companies without a website
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-white" /> Automated deep email &amp; phone scraper
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-white" /> Unlimited formula-safe CSV exports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-white" /> Worldwide coverage across 190+ countries
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckOutlined className="text-white" /> Support via email 24 hours
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Need help? Card */}
        <section className="mt-16 max-w-2xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-slate-100 p-8 text-center border border-slate-200">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-2xl shadow-sm">
                👤
              </div>
            </div>
            <h3 className="text-2xl font-black text-[#0F172A]">Need help?</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              If you&apos;re experiencing an issue or have any questions, our support team is here for you 24/7. Just reach out and we&apos;ll get back to you quickly!
            </p>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-block py-3 px-8 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <MarketingFooter onOpenLogin={() => setIsLoginOpen(true)} />

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
