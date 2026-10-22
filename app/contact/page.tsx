'use client';

import { useState } from 'react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import LoginModal from '@/components/marketing/LoginModal';
import { Alert } from 'antd';

export default function ContactPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-[#4F46E5] selection:text-white">
      {/* Wave Banner with Embedded Translucent Navbar */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#503BF6] via-[#A832E5] to-[#EE4B7B] pb-28 sm:pb-36 rounded-b-[48px] sm:rounded-b-[68px] shadow-lg">
        <MarketingHeader onOpenLogin={() => setIsLoginOpen(true)} activePath="/contact" />

        <div className="mx-auto max-w-7xl px-4 pt-28 sm:pt-36 lg:pt-44 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight !text-white drop-shadow-sm">
            Contact Us
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 pb-24">

        {/* Floating Centered Card */}
        <div className="mx-auto max-w-2xl px-4 sm:px-6 -mt-20 sm:-mt-28 relative z-10">
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-2xl border border-slate-200/80">
            {/* Support Agent Illustration */}
            <div className="flex justify-center mb-6">
              <svg viewBox="0 0 200 120" className="w-48 h-auto" fill="none">
                <circle cx="100" cy="60" r="50" fill="#EEF2FF" />
                {/* Chat Bubbles */}
                <rect x="25" y="25" width="30" height="20" rx="4" fill="#93C5FD" />
                <rect x="145" y="30" width="35" height="18" rx="4" fill="#C7D2FE" />
                {/* Agent Body */}
                <path d="M70 115 C75 90 125 90 130 115 Z" fill="#2563EB" />
                {/* Head */}
                <circle cx="100" cy="70" r="18" fill="#FDBA74" />
                <path d="M85 62 C85 45 115 45 115 62 Z" fill="#1E293B" />
                {/* Headset */}
                <path d="M84 70 C84 55 116 55 116 70" stroke="#1E293B" strokeWidth="3" fill="none" />
                <circle cx="84" cy="70" r="4" fill="#1E293B" />
                <path d="M84 74 L94 80" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                <circle cx="94" cy="80" r="2.5" fill="#2563EB" />
              </svg>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                We&apos;re Here to Help
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500">
                Our support team is here 24/7 to help you right away.
              </p>
            </div>

            {submitted ? (
              <Alert
                type="success"
                message="Message Sent!"
                description="Thank you for reaching out. A FindB support specialist will review your inquiry and respond within 2-4 hours."
                showIcon
                className="rounded-2xl p-4 mb-4"
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-hidden transition-colors"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Billing &amp; Refunds">Billing &amp; Refunds</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Cancel Subscription">Cancel Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-hidden transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="cursor-pointer w-full py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
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
