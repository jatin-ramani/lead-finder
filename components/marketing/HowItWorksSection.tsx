import React from 'react';

export default function HowItWorksSection() {
  const steps = [
    {
      step: '1',
      title: 'Enter City & Category',
      description:
        'Choose any geographical market and industry niche. Target local dentists, plumbers, roofers, restaurants, or accountants with pinpoint accuracy.',
      icon: (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      step: '2',
      title: 'Instant Discovery & Enrichment',
      description:
        'FindB queries trusted local directory APIs in real time, validating business phone numbers, physical addresses, review counts, and active website status.',
      icon: (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      step: '3',
      title: 'Export & Close Deals',
      description:
        'Download your verified leads in formula-safe CSV or Excel formats. Plug high-converting prospects straight into your cold email or phone outreach workflow.',
      icon: (
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      ),
    },
  ];

  return (
    <section className="mt-28 sm:mt-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold tracking-wide uppercase">
          Workflow
        </span>
        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight">
          How FindB Works
        </h2>
        <p className="mt-3 text-base text-slate-600">
          From zero leads to a qualified local sales pipeline in three straightforward steps.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((item) => (
          <div
            key={item.step}
            className="rounded-3xl bg-slate-50/80 hover:bg-white border border-slate-200/80 p-8 shadow-xs hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
          >
            {/* Watermark Step Number */}
            <span className="absolute top-4 right-6 text-7xl font-black text-slate-200/70 select-none pointer-events-none">
              {item.step}
            </span>

            <div className="relative z-10">
              {/* Step Icon Badge */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm">
                {item.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {item.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-indigo-600">
              <span>Step {item.step} Complete</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
