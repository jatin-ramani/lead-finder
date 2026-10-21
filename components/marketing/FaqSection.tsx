'use client';

import React, { useState } from 'react';

type TabKey = 'about' | 'pricing' | 'privacy';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqSection() {
  const [activeTab, setActiveTab] = useState<TabKey>('about');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'about-0': true, // First open by default
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const faqData: Record<TabKey, FaqItem[]> = {
    about: [
      {
        q: 'What is FindB and who is it for?',
        a: 'FindB is a local B2B sales intelligence platform. It enables digital marketing agencies, SEO consultants, software vendors, and sales reps to search any city and business niche worldwide to instantly find qualified local business leads with verified phone numbers, addresses, and website status.',
      },
      {
        q: 'How does FindB discover local businesses?',
        a: 'FindB connects to high-coverage geographical directory APIs and verified business registries, retrieving fresh real-time listings by coordinates, radius, and industry taxonomy rather than relying on stale static scrapers.',
      },
      {
        q: 'What data fields are included with each business lead?',
        a: 'Every discovered lead includes the business name, primary category, verified phone number, physical address, Google rating, review counts, website URL, and qualification flags (such as whether they lack an active website).',
      },
      {
        q: 'Can I target businesses that do not have an active website?',
        a: 'Yes! FindB includes built-in website status qualification. You can filter exclusively for businesses without websites, making it effortless to pitch web design, hosting, or SEO services to high-intent local prospects.',
      },
    ],
    pricing: [
      {
        q: 'Is there a free plan to test FindB?',
        a: 'Yes, FindB offers a Free starter plan with 50 exportable verified leads per month so you can experience data accuracy and workflow before upgrading to a paid tier.',
      },
      {
        q: 'Can I cancel or change my plan anytime?',
        a: 'Absolutely. There are no multi-year lock-in contracts. You can upgrade, downgrade, or cancel your subscription at any time directly from your account settings with a single click.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), as well as UPI and international cards via our secure Stripe-powered payment gateway.',
      },
      {
        q: 'What happens to my exported leads if I cancel?',
        a: 'All leads and CSV/Excel files you have already exported remain yours permanently. We never revoke access to data you have legitimately downloaded.',
      },
    ],
    privacy: [
      {
        q: 'Is using FindB compliant with data privacy regulations (GDPR, CCPA)?',
        a: 'Yes. FindB only collects, aggregates, and enriches publicly available business data (B2B commercial listings, public corporate phone lines, and physical storefront addresses) in full accordance with international business directory guidelines.',
      },
      {
        q: 'Are exported CSV files safe against CSV formula injection?',
        a: 'Yes. FindB automatically sanitizes all exported spreadsheets, escaping potentially malicious formula prefixes (=, +, -, @) to protect your team when opening lead data in Microsoft Excel or Google Sheets.',
      },
      {
        q: 'Do you share or sell my search history?',
        a: 'Never. Your targeted cities, niches, and exported campaigns are strictly private to your account and encrypted in our database.',
      },
    ],
  };

  return (
    <section id="faq" className="mt-28 sm:mt-36 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {/* Section Header */}
      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wide uppercase">
        Answers &amp; Help
      </span>
      <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight">
        Frequently Asked Questions
      </h2>
      <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">
        Everything you need to know about FindB lead discovery, pricing, and compliance.
      </p>

      {/* 3 Tabs */}
      <div className="mt-10 flex justify-center">
        <div
          role="tablist"
          aria-label="FAQ Categories"
          className="inline-flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200 gap-1"
        >
          {[
            { key: 'about', label: 'About FindB' },
            { key: 'pricing', label: 'Pricing & Plans' },
            { key: 'privacy', label: 'Data & Privacy' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`faq-panel-${tab.key}`}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`cursor-pointer px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div
        id={`faq-panel-${activeTab}`}
        role="tabpanel"
        className="mt-10 space-y-3.5 text-left"
      >
        {faqData[activeTab].map((item, idx) => {
          const key = `${activeTab}-${idx}`;
          const isOpen = !!openItems[key];
          return (
            <div
              key={key}
              className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleItem(key)}
                aria-expanded={isOpen}
                className="cursor-pointer w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
              >
                <span>{item.q}</span>
                <span className="text-indigo-600 text-xl font-bold ml-4 shrink-0">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
