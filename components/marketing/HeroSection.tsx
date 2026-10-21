'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarketingHeader from './MarketingHeader';

interface HeroSectionProps {
  onOpenLogin: () => void;
}

export default function HeroSection({ onOpenLogin }: HeroSectionProps) {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !category.trim()) {
      setError('Please provide both city and business category.');
      return;
    }
    setError('');
    // Store preliminary intent or navigate to dashboard/login
    router.push(`/businesses?city=${encodeURIComponent(city.trim())}&category=${encodeURIComponent(category.trim())}`);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[linear-gradient(135deg,#1E1B4B_0%,#312E81_28%,#4338CA_58%,#2563EB_82%,#0EA5E9_100%)]">
      {/* Top Navbar */}
      <MarketingHeader onOpenLogin={onOpenLogin} activePath="/" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 pb-12 sm:pt-12 sm:pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline & Dual Search Form (7 Cols on desktop) */}
          <div className="lg:col-span-7 text-left text-white max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-cyan-200 mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Real-Time B2B Local Lead Discovery</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.08] text-white drop-shadow-sm">
              Find Local Business Leads in Seconds
            </h1>

            <p className="mt-5 text-base sm:text-lg text-white/90 font-medium leading-relaxed max-w-xl">
              Target any city and niche worldwide. Instantly extract verified phone numbers, addresses, ratings, and websites ready for cold outreach.
            </p>

            {/* City & Category Lead Search Form */}
            <form
              onSubmit={handleSearch}
              className="mt-8 p-2 rounded-2xl sm:rounded-full bg-white shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-white/30"
            >
              {/* City Input */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
                <svg
                  className="w-5 h-5 text-indigo-500 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  type="text"
                  placeholder="City (e.g. Austin, TX)"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              {/* Category Input */}
              <div className="flex-1 flex items-center gap-2 px-3 py-2">
                <svg
                  className="w-5 h-5 text-cyan-500 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <input
                  type="text"
                  placeholder="Category (e.g. Dental Clinics)"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="cursor-pointer shrink-0 rounded-xl sm:rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-95 text-white px-7 py-3 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Find Leads</span>
                <svg
                  className="w-4 h-4 stroke-current stroke-2 fill-none"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>

            {error && (
              <p className="mt-2.5 text-xs text-rose-300 font-semibold pl-2">
                ⚠️ {error}
              </p>
            )}

            {/* Quick Filter Tag Suggestions */}
            <div className="mt-4 flex items-center gap-2 flex-wrap text-xs text-white/80">
              <span className="font-semibold text-white/60">Trending Searches:</span>
              {['Plumbers in Miami', 'Roofers in Dallas', 'Dental in Chicago', 'HVAC in Denver'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const [cat, c] = tag.split(' in ');
                    setCategory(cat);
                    setCity(c);
                  }}
                  className="cursor-pointer px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Live Results Table Mockup Card (5 Cols on desktop) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-white/40 backdrop-blur-md relative transform transition-transform hover:-translate-y-1 duration-300">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Austin, TX · Dental Clinics
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      48 Verified Business Leads
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-[11px] font-bold text-indigo-700">
                  Ready to Export
                </span>
              </div>

              {/* Sample Lead Rows */}
              <div className="mt-4 space-y-3">
                {[
                  {
                    name: 'Apex Dental Studio',
                    category: 'Dentist · Family & Cosmetic',
                    phone: '+1 (512) 890-2100',
                    rating: '4.9',
                    reviews: '124',
                    website: 'Verified Website',
                    websiteType: 'verified',
                  },
                  {
                    name: 'Capital City Dental Care',
                    category: 'Cosmetic Dentistry',
                    phone: '+1 (512) 441-3200',
                    rating: '4.8',
                    reviews: '98',
                    website: 'No Website · High Opportunity',
                    websiteType: 'missing',
                  },
                  {
                    name: 'South Lamar Orthodontics',
                    category: 'Orthodontist Specialist',
                    phone: '+1 (512) 770-5540',
                    rating: '5.0',
                    reviews: '215',
                    website: 'Verified Website',
                    websiteType: 'verified',
                  },
                ].map((lead, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-slate-100 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {lead.name}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-0.5">
                        ★ {lead.rating} <span className="text-slate-400 font-normal">({lead.reviews})</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 truncate max-w-[150px]">
                        {lead.category}
                      </span>
                      <span className="font-mono text-indigo-600 font-semibold">
                        {lead.phone}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span
                        className={`font-semibold ${
                          lead.websiteType === 'missing'
                            ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded'
                            : 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded'
                        }`}
                      >
                        {lead.website}
                      </span>
                      <span className="text-slate-400">Austin, TX</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer Summary */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Average qualification rate: <strong className="text-slate-800">94.2%</strong>
                </span>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  View full results →
                </button>
              </div>

              {/* Floating Verified Badge */}
              <div className="absolute -bottom-4 -left-4 sm:-left-6 px-4 py-2 rounded-xl bg-slate-900 text-white shadow-xl flex items-center gap-2 border border-slate-800 text-xs font-bold">
                <span className="text-emerald-400">✓</span>
                <span>Direct Verified Phone &amp; Email</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organic Curved Bottom Wave */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 sm:h-20 lg:h-24"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C380,75 880,85 1440,25 L1440,90 L0,90 Z"
            fill="#F8FAFC"
          />
        </svg>
      </div>
    </section>
  );
}
