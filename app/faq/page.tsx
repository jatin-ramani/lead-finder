'use client';

import { useState } from 'react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import LoginModal from '@/components/marketing/LoginModal';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

export default function FaqPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'about' | 'billing' | 'account'>('about');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'about-0': true,
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const aboutQuestions = [
    {
      q: 'What is FindB?',
      a: 'FindB is a state-of-the-art B2B sales intelligence and local lead generation platform that allows marketing agencies, web design firms, and sales reps to discover local businesses, identify companies without websites, and acquire verified contact emails and phone numbers worldwide.',
    },
    {
      q: 'How does FindB discover local businesses?',
      a: 'FindB connects to high-fidelity global place indices (including Geoapify Places and commercial mapping registries) across 190+ countries. It indexes businesses by city, category, rating, and address, then applies deep enrichment to verify digital presence.',
    },
    {
      q: 'Why should I target businesses without a website?',
      a: 'Local businesses without websites are the highest-converting prospect segment for digital agencies, web developers, and SEO consultants. These companies already have real revenue and paying customers, but desperately need an online presence to scale.',
    },
    {
      q: 'What contact details does FindB discover?',
      a: 'FindB retrieves business names, physical addresses, direct phone numbers, website status, verified decision-maker emails, social links, opening hours, and precise geo-coordinates.',
    },
    {
      q: 'Is web scraping and lead generation with FindB legal?',
      a: 'Yes. FindB strictly collects publicly available business information and commercial directory listings in full compliance with public web scraping guidelines, GDPR, and CAN-SPAM regulations.',
    },
    {
      q: 'Can I export my leads into my CRM or email sequencer?',
      a: 'Yes! FindB supports one-click CSV export with UTF-8 BOM encoding and spreadsheet formula injection protection. You can export filtered leads straight into tools like Instantly, Lemlist, Apollo, HubSpot, or Excel.',
    },
    {
      q: 'How fast does FindB scan and scrape leads?',
      a: 'FindB performs real-time queries in seconds. City-wide scans and deep contact website crawls run asynchronously in background pipelines so you can monitor progress or export immediately.',
    },
    {
      q: 'Can I filter leads by specific criteria?',
      a: 'Yes! FindB provides composable filters for website presence (Without Website / Has Website), contact availability (Has Email, Has Phone), category, and city/region.',
    },
    {
      q: 'Can I test FindB before committing to a plan?',
      a: 'FindB offers a trial period for just ₹109 so you can test all features, run live business scans, and export verified leads before deciding on an ongoing subscription.',
    },
    {
      q: 'Still Need Help?',
      a: 'Our customer support team is available 24/7 to assist you. Contact us anytime via our Contact Us page.',
    },
  ];

  const billingQuestions = [
    {
      q: 'How do I cancel my account or my subscription?',
      a: 'You can cancel your subscription at any time with one click from our Cancel Subscription page, or directly from your account settings. Cancellation is immediate with zero hidden fees.',
    },
    {
      q: 'Will my subscription renew automatically?',
      a: 'Yes. Following the initial trial period, your subscription automatically renews on your chosen cycle unless cancelled prior to the renewal date.',
    },
    {
      q: 'Why am I being charged by FindB?',
      a: 'Charges reflect your chosen trial period or ongoing monthly subscription providing unlimited access to the FindB lead scanner, enrichment crawlers, and lead export pipelines.',
    },
    {
      q: 'Is my credit card information safe with FindB?',
      a: 'Absolutely. All transactions are encrypted with bank-level 256-bit SSL encryption via PCI-compliant payment gateways. We do not store raw card numbers on our servers.',
    },
    {
      q: 'Can I Request a Refund?',
      a: 'Yes. If you experienced technical issues or were unsatisfied with the service, please contact our support team within 14 days of your purchase.',
    },
    {
      q: 'Where is my refund?',
      a: 'Refunds are typically processed within 3 to 5 business days depending on your bank and payment provider.',
    },
    {
      q: 'I want to pay for FindB, but my payment is declined. What now?',
      a: 'Ensure your card is enabled for online and international transactions, or try using an alternative debit/credit card or payment method.',
    },
    {
      q: 'Still Need Help?',
      a: 'Please reach out to support@findb.ai with your transaction ID and our billing team will resolve your request quickly.',
    },
  ];

  const accountQuestions = [
    {
      q: 'How do I cancel my subscription?',
      a: 'Visit the Cancel Subscription page in the top menu, enter your registered email address, and click Cancel Subscription. You will receive immediate confirmation.',
    },
    {
      q: 'I forgot the password associated with my account. How can I reset it?',
      a: 'Click "Login" in the header, then click "Forgot Password?". Enter your email address to receive a secure password reset link.',
    },
    {
      q: 'Still Need Help?',
      a: 'Our support specialists are online 24/7. Reach out via our Contact Us form for immediate assistance.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-[#4F46E5] selection:text-white">
      {/* Wave Banner with Embedded Translucent Navbar */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#503BF6] via-[#A832E5] to-[#EE4B7B] pb-24 sm:pb-32 rounded-b-[48px] sm:rounded-b-[68px] shadow-lg">
        <MarketingHeader onOpenLogin={() => setIsLoginOpen(true)} activePath="/faq" />

        <div className="mx-auto max-w-7xl px-4 pt-28 sm:pt-36 lg:pt-44 text-center">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight !text-white drop-shadow-sm">
            Frequently Asked Questions
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        {/* Content Container */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 -mt-14 sm:-mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar Category Tabs */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl bg-white shadow-lg border border-slate-200/80 p-2 overflow-hidden sticky top-24">
                <div className="bg-[#2563EB] text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  FAQ Categories
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('about')}
                    className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                      activeCategory === 'about'
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>About FindB</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 font-semibold text-slate-700">
                      {aboutQuestions.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('billing')}
                    className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                      activeCategory === 'billing'
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Payments &amp; Billing</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 font-semibold text-slate-700">
                      {billingQuestions.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('account')}
                    className={`cursor-pointer w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                      activeCategory === 'account'
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>My Account</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 font-semibold text-slate-700">
                      {accountQuestions.length}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Accordion Panel */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl bg-white shadow-xl border border-slate-200/80 p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] mb-6">
                  {activeCategory === 'about' && 'About FindB Lead Platform'}
                  {activeCategory === 'billing' && 'Payments & Subscription Billing'}
                  {activeCategory === 'account' && 'Account Management'}
                </h2>

                <div className="space-y-3">
                  {(activeCategory === 'about'
                    ? aboutQuestions
                    : activeCategory === 'billing'
                    ? billingQuestions
                    : accountQuestions
                  ).map((item, idx) => {
                    const key = `${activeCategory}-${idx}`;
                    const isOpen = !!openItems[key];
                    return (
                      <div
                        key={key}
                        className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(key)}
                          className="cursor-pointer w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-bold text-slate-800 hover:text-[#2563EB] transition-colors gap-4"
                        >
                          <span>{item.q}</span>
                          <span className="text-[#2563EB] text-lg font-bold shrink-0">
                            {isOpen ? <MinusOutlined /> : <PlusOutlined />}
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
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <MarketingFooter onOpenLogin={() => setIsLoginOpen(true)} />

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
