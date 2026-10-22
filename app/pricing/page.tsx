'use client';

import { useState } from 'react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import LoginModal from '@/components/marketing/LoginModal';

export default function PricingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);

  const durationPricing: Record<number, { price: string; perMonth: string; save?: string }> = {
    1: { price: '₹2,495', perMonth: '₹2,495 / month' },
    2: { price: '₹4,490', perMonth: '₹2,245 / month', save: 'Save 10%' },
    3: { price: '₹5,990', perMonth: '₹1,996 / month', save: 'Save 20%' },
    4: { price: '₹7,490', perMonth: '₹1,872 / month', save: 'Save 25%' },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-[#4F46E5] selection:text-white">
      {/* 1. Hero Wave Banner with Embedded Translucent Navbar */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#503BF6] via-[#A832E5] to-[#EE4B7B] pb-28 sm:pb-36 rounded-b-[48px] sm:rounded-b-[68px] shadow-lg">
        <MarketingHeader onOpenLogin={() => setIsLoginOpen(true)} activePath="/pricing" />

        <div className="mx-auto max-w-7xl px-4 pt-28 sm:pt-36 lg:pt-44 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight !text-white drop-shadow-sm">
            Pricing
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 pb-24">

        {/* 3. The 3 Pricing Cards Row (Overlapping the Wave) */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 -mt-16 sm:-mt-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Card 1: Special offer! (Dark Container with Illustration) */}
            <div className="rounded-3xl bg-[#111827] p-7 sm:p-8 text-white flex flex-col justify-between shadow-2xl border border-slate-800 relative overflow-hidden">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                  Special offer!
                </h3>
                <p className="mt-3 text-base font-bold text-white leading-snug">
                  Test out FindB&apos;s lead generation capabilities for just ₹109!
                </p>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  FindB offers its services through an easy-to-manage subscription.
                </p>
              </div>

              {/* Isometric 3D Analytics & Infrastructure Showcase */}
              <div className="mt-8 pt-2 relative flex items-center justify-center min-h-[230px]">
                {/* Ambient Soft Radial Glow */}
                <div className="absolute inset-x-4 bottom-2 h-36 bg-gradient-to-t from-blue-600/30 via-indigo-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Vector Image */}
                <div className="relative z-10 w-full flex items-center justify-center">
                  <img
                    src="/images/special-offer-vector.png"
                    alt="FindB Lead Intelligence & Server Architecture"
                    width={320}
                    height={250}
                    className="w-full max-w-[270px] sm:max-w-[290px] h-auto object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:scale-105 select-none"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Trial period (Light Container with Clean White Pill Badge) */}
            <div className="rounded-3xl bg-[#F1F5F9] p-7 sm:p-8 flex flex-col justify-between shadow-xl border border-slate-200/80">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-extrabold text-[#2563EB] bg-white border border-blue-200/90 rounded-full shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                  Trial period
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] mt-4 tracking-tight">
                  ₹109
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1">
                  Trial price
                </div>
                <p className="text-xs text-slate-600 mt-5 leading-relaxed">
                  FindB operates on a subscription basis. Your initial payment grants unrestricted access to all platform
                  lead discovery tools, website audits, and lead exports. After that period, the subscription fee applies.
                </p>
              </div>

              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="cursor-pointer w-full py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  Start Trial
                </button>
              </div>
            </div>

            {/* Card 3: Subscription (Royal Blue Container) */}
            <div className="rounded-3xl bg-[#2563EB] p-7 sm:p-8 text-white flex flex-col justify-between shadow-2xl border border-blue-400/40 relative">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-block px-3 py-1 text-xs font-bold text-[#2563EB] bg-white rounded-full shadow-sm">
                    Subscription
                  </span>
                  {durationPricing[selectedDuration].save && (
                    <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/40 rounded-full border border-emerald-400/30">
                      {durationPricing[selectedDuration].save}
                    </span>
                  )}
                </div>

                <div className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
                  {durationPricing[selectedDuration].price}
                </div>
                <div className="text-xs font-medium text-blue-100 mt-1">
                  {durationPricing[selectedDuration].perMonth}
                </div>

                {/* Plan options Step Slider */}
                <div className="mt-5">
                  <div className="text-xs font-bold text-blue-100 mb-2">Plan options</div>
                  <div className="relative py-2">
                    {/* Track Background */}
                    <div className="h-3 w-full rounded-full bg-blue-700/80 p-0.5 flex items-center relative">
                      {/* Active Progress Fill */}
                      <div
                        className="h-full rounded-full bg-white transition-all duration-200"
                        style={{
                          width: `${((selectedDuration - 1) / 3) * 100}%`,
                        }}
                      />
                      {/* Interactive Thumb */}
                      <div
                        className="absolute h-6 w-6 rounded-full bg-white border-4 border-[#2563EB] shadow-md -ml-3 transition-all duration-200"
                        style={{
                          left: `${((selectedDuration - 1) / 3) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Step Labels */}
                    <div className="flex justify-between items-center text-[11px] font-bold text-blue-100 mt-3 px-1">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSelectedDuration(num)}
                          className={`cursor-pointer transition-all ${
                            selectedDuration === num
                              ? 'text-white font-extrabold underline underline-offset-4 scale-110'
                              : 'text-blue-200 hover:text-white'
                          }`}
                        >
                          {num === 1 ? '1 Month' : num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-blue-100 mt-5 leading-relaxed">
                  Once the trial period has ended, the offer will automatically renew to a subscription. Remember that you
                  can cancel the subscription whenever you want.
                </p>
              </div>

              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="blob-btn blob-btn--white cursor-pointer w-full py-3.5 rounded-full border-2 border-white text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center select-none"
                >
                  <span className="blob-btn__inner" aria-hidden="true">
                    <span className="blob-btn__blobs">
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                    </span>
                  </span>
                  <span className="relative z-10">
                    Subscribe Now
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footnote Notice */}
          <p className="text-xs text-slate-500 mt-8 text-center">
            *Subscription duration and pricing may vary depending on your country and current promotions.
          </p>
        </div>
      </main>

      {/* 4. Deep Navy Footer */}
      <MarketingFooter onOpenLogin={() => setIsLoginOpen(true)} />

      {/* 5. Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
