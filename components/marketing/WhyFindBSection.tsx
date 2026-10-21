'use client';

import React from 'react';

interface WhyFindBSectionProps {
  onOpenLogin: () => void;
}

export default function WhyFindBSection({ onOpenLogin }: WhyFindBSectionProps) {
  const features = [
    {
      title: 'Verified Local Business Data',
      description:
        'Stop wasting hours on dead phone numbers and outdated directories. FindB continuously validates phone numbers, ratings, physical addresses, and active website status.',
      badgeGradient: 'from-cyan-100 to-sky-200 text-sky-600',
      icon: (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'Instant Opportunity Filtering',
      description:
        'Easily target local businesses that lack an active website or have poor online presence. Sell web design, SEO, and marketing services to business owners who actually need them.',
      badgeGradient: 'from-emerald-100 to-green-200 text-emerald-600',
      icon: (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6M9 9l6 6" />
        </svg>
      ),
    },
    {
      title: 'Worldwide Metropolitan Coverage',
      description:
        'Discover local businesses in over 180 countries. Whether targeting dentists in Austin, electricians in London, or restaurants in Toronto, FindB connects you directly.',
      badgeGradient: 'from-amber-100 to-orange-200 text-amber-600',
      icon: (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
        </svg>
      ),
    },
    {
      title: 'One-Click CSV & CRM Export',
      description:
        'Download your filtered lead lists in clean, formula-injection safe CSV or Excel formats ready for instant import into your favorite sales dialer or email outreach sequencer.',
      badgeGradient: 'from-indigo-100 to-violet-200 text-indigo-600',
      icon: (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="mt-28 sm:mt-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto">
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide uppercase">
          Key Advantages
        </span>
        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight">
          Why Agencies &amp; Sales Reps Choose FindB
        </h2>
        <p className="mt-3 text-base text-slate-600">
          Everything you need to locate, qualify, and convert local small business clients.
        </p>
      </div>

      {/* 4 Feature Cards */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-left">
        {features.map((feat, idx) => (
          <div key={idx} className="flex flex-col justify-between">
            <div>
              {/* 45-Degree Rotated Diamond Badge */}
              <div
                className={`w-14 h-14 rounded-2xl rotate-45 bg-gradient-to-br ${feat.badgeGradient} flex items-center justify-center shadow-xs mb-8 ml-2`}
              >
                <div className="-rotate-45 text-2xl flex items-center justify-center">
                  {feat.icon}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">
                {feat.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {feat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Call to Action */}
      <div className="mt-14">
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="cursor-pointer inline-flex items-center gap-2 py-3 px-8 rounded-xl border-[1.5px] border-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold text-sm transition-all shadow-xs"
        >
          <span>Find Local Leads Now</span>
          <span>↑</span>
        </button>
      </div>
    </section>
  );
}
