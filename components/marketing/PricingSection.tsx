'use client';

import React, { useState } from 'react';

interface PricingSectionProps {
  onOpenLogin: () => void;
}

export default function PricingSection({ onOpenLogin }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Free',
      badge: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'Ideal for trying out FindB and prospecting your first local city.',
      features: [
        '50 Verified Leads / month',
        'Standard City & Category search',
        'Business name & phone numbers',
        'Basic CSV export',
        'Community support',
      ],
      ctaText: 'Start Free',
      highlighted: false,
      btnStyle: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    },
    {
      name: 'Pro',
      badge: 'Most Popular',
      price: billingCycle === 'monthly' ? '$49' : '$39',
      period: 'per month',
      savings: billingCycle === 'annual' ? 'Save 20% annually' : undefined,
      description: 'Everything solo consultants, agencies, and sales reps need to scale.',
      features: [
        'Unlimited City & Category searches',
        '2,500 Exportable Verified Leads / mo',
        'Website, email & rating enrichment',
        'Advanced website status qualification',
        'Direct CSV & Excel formula-safe export',
        'Fast email & chat support',
      ],
      ctaText: 'Upgrade to Pro',
      highlighted: true,
      btnStyle: 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25',
    },
    {
      name: 'Agency',
      badge: 'Teams & Scale',
      price: billingCycle === 'monthly' ? '$149' : '$119',
      period: 'per month',
      savings: billingCycle === 'annual' ? 'Save 20% annually' : undefined,
      description: 'Dedicated power features for high-volume outbound lead generation.',
      features: [
        '10,000 Exportable Verified Leads / mo',
        'Automated background city scanner',
        'Continuous email queue & verification',
        'Multi-user seats (up to 5 team members)',
        'Full REST API access & webhooks',
        'Dedicated account manager',
      ],
      ctaText: 'Contact for Agency',
      highlighted: false,
      btnStyle: 'bg-slate-900 hover:bg-slate-800 text-white',
    },
  ];

  return (
    <section id="pricing" className="mt-20 sm:mt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wide uppercase">
          Simple, Transparent Pricing
        </span>
        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight leading-tight">
          Pick the Right Plan for Your Pipeline
        </h2>
        <p className="mt-3 text-base text-slate-600">
          No hidden fees or surprise contract lock-ins. Upgrade, downgrade, or cancel anytime.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="mt-8 inline-flex items-center rounded-full bg-slate-100 p-1.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`cursor-pointer px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`cursor-pointer px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* 3-Card Pricing Grid */}
      <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
              plan.highlighted
                ? 'bg-white border-2 border-indigo-600 shadow-2xl lg:-translate-y-2'
                : 'bg-white/80 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
            }`}
          >
            {/* Highlighted Ribbon */}
            {plan.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                {plan.badge}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                {!plan.highlighted && (
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  / {plan.period}
                </span>
              </div>

              {plan.savings && (
                <div className="mt-1 text-xs font-bold text-emerald-600">
                  {plan.savings}
                </div>
              )}

              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[40px]">
                {plan.description}
              </p>

              {/* Features List */}
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Included Features
                </div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <svg
                      className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-6">
              <button
                type="button"
                onClick={onOpenLogin}
                className={`cursor-pointer w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all active:scale-98 ${plan.btnStyle}`}
              >
                {plan.ctaText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
