'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import LoginModal from '@/components/marketing/LoginModal';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  DollarCircleOutlined,
  StopOutlined,
  MailOutlined
} from '@ant-design/icons';

export default function TermsAndConditionsPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-[#4F46E5] selection:text-white">
      {/* Wave Banner with Embedded Translucent Navbar */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#503BF6] via-[#A832E5] to-[#EE4B7B] pb-24 sm:pb-32 rounded-b-[48px] sm:rounded-b-[68px] shadow-lg">
        <MarketingHeader onOpenLogin={() => setIsLoginOpen(true)} activePath="/terms-and-conditions" />

        <div className="mx-auto max-w-7xl px-4 pt-28 sm:pt-36 lg:pt-44 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-4 border border-white/20">
            <FileTextOutlined />
            <span>Customer Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight !text-white drop-shadow-sm">
            Terms and Conditions
          </h1>
          <p className="mt-4 text-white/85 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Please read these terms carefully before accessing or using the FindB B2B sales intelligence platform, lead discovery engines, or data export services.
          </p>
          <p className="mt-2 text-xs text-white/70">
            Last Revised: October 2026 &middot; Version 4.0
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 -mt-14 sm:-mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sticky Navigation Menu */}
            <div className="lg:col-span-4 hidden lg:block sticky top-24">
              <div className="rounded-2xl bg-white shadow-lg border border-slate-200/80 p-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
                  Agreement Index
                </div>
                <nav className="space-y-1 text-sm font-medium">
                  <a href="#acceptance" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    1. Acceptance of Terms
                  </a>
                  <a href="#services" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    2. Description of Services
                  </a>
                  <a href="#accounts" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    3. Account Registration &amp; Security
                  </a>
                  <a href="#acceptable-use" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    4. Acceptable Use Policy
                  </a>
                  <a href="#billing" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    5. Billing, Trials &amp; Renewals
                  </a>
                  <a href="#cancellations" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    6. Cancellations &amp; Refunds
                  </a>
                  <a href="#intellectual-property" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    7. Intellectual Property
                  </a>
                  <a href="#disclaimers" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    8. Disclaimers &amp; Data Accuracy
                  </a>
                  <a href="#liability" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    9. Limitation of Liability
                  </a>
                  <a href="#governing-law" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    10. Governing Law &amp; Contact
                  </a>
                </nav>

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                  <div className="flex items-center gap-2 text-[#2563EB] font-semibold">
                    <CheckCircleOutlined />
                    <span>Instant Cancellation</span>
                  </div>
                  <p>
                    You can cancel your subscription at any time with one click from our <Link href="/cancel-subscription" className="text-[#2563EB] underline">Cancel Subscription</Link> page.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Main Article Content */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl bg-white shadow-xl border border-slate-200/80 p-6 sm:p-10 space-y-10">
                
                {/* 1. Acceptance */}
                <section id="acceptance" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">1.</span> Acceptance of Terms
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    These Terms and Conditions (&quot;Terms&quot;, &quot;Agreement&quot;) constitute a legally binding agreement entered into between you (either an individual or a legal entity, referred to as &quot;Customer&quot;, &quot;User&quot;, or &quot;You&quot;) and <strong>FindB Technologies LLC</strong> (&quot;FindB&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
                  </p>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    By registering for an account, accessing <Link href="/" className="text-[#2563EB] underline">findb.ai</Link>, subscribing to any membership tier, or executing any data scan, you explicitly acknowledge that you have read, understood, and agreed to be bound by these Terms and our incorporated <Link href="/privacy-policy" className="text-[#2563EB] underline">Privacy Policy</Link> and <Link href="/cookies-policy" className="text-[#2563EB] underline">Cookies Policy</Link>.
                  </p>
                </section>

                <hr className="border-slate-100" />

                {/* 2. Description of Services */}
                <section id="services" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">2.</span> Description of Services
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    FindB operates a proprietary software-as-a-service (SaaS) platform providing sales intelligence, local commercial business indexing, digital presence verification, and verified B2B lead generation tools. Key features include:
                  </p>
                  <ul className="list-disc pl-5 text-sm sm:text-base text-slate-600 space-y-1.5">
                    <li><strong>Global Business Discovery:</strong> Real-time discovery of registered commercial entities across 190+ countries and thousands of industry categories.</li>
                    <li><strong>Website Presence Auditing:</strong> Automated identification of high-converting prospect businesses operating without a functional digital website.</li>
                    <li><strong>Public Contact Enrichment:</strong> Extraction of publicly disclosed corporate phone numbers, verified emails, operational hours, and social media links.</li>
                    <li><strong>Lead Export Pipelines:</strong> Formatted CSV data downloads equipped with spreadsheet formula injection protection.</li>
                  </ul>
                </section>

                <hr className="border-slate-100" />

                {/* 3. Account Registration & Security */}
                <section id="accounts" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">3.</span> Account Registration &amp; Security
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    To access the full functionality of FindB, you must create an account. You represent and warrant that:
                  </p>
                  <div className="space-y-3 pt-1">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-700">
                      <strong>Accuracy of Credentials:</strong> All registration information submitted is truthful, accurate, and kept up-to-date.
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-700">
                      <strong>Age Eligibility:</strong> You are at least eighteen (18) years of age and possess legal capacity to enter into binding agreements.
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-700">
                      <strong>Confidentiality:</strong> You are solely responsible for maintaining the confidentiality of your login password and all activities under your account. You agree not to share your account credentials across multiple organizations.
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 4. Acceptable Use Policy */}
                <section id="acceptable-use" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">4.</span> Acceptable Use Policy
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    You agree to use FindB exclusively for lawful commercial purposes in compliance with all applicable local, national, and international laws, including the CAN-SPAM Act, the Telephone Consumer Protection Act (TCPA), GDPR, and CASL.
                  </p>
                  
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                      <StopOutlined />
                      <span>Strictly Prohibited Activities</span>
                    </div>
                    <ul className="list-disc pl-5 text-xs sm:text-sm text-rose-800 space-y-1">
                      <li>Using exported contact leads to transmit unsolicited, deceptive, or malicious bulk spam emails.</li>
                      <li>Scraping, crawling, or extracting data from FindB&apos;s internal web application or database through automated bots, scrapers, or exploits without express written consent.</li>
                      <li>Attempting to bypass platform rate limits, user authentication barriers, or security mechanisms.</li>
                      <li>Reselling, sublicensing, or syndicating raw bulk access to FindB as a competing standalone data brokerage.</li>
                      <li>Transmitting viruses, Trojan horses, worms, or malicious code into our infrastructure.</li>
                    </ul>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 5. Billing, Trials & Renewals */}
                <section id="billing" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">5.</span> Billing, Trials &amp; Automatic Renewals
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    FindB offers promotional trial access (e.g. ₹109 trial periods) and recurring monthly or annual subscription plans designed for agencies and sales professionals:
                  </p>
                  <div className="space-y-3 pt-1">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                        <DollarCircleOutlined className="text-[#2563EB]" />
                        <span>Recurring Subscription Model</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Following the conclusion of your promotional trial period, your subscription automatically renews at the designated periodic rate unless explicitly cancelled prior to the renewal date.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                        <CheckCircleOutlined className="text-emerald-600" />
                        <span>Payment Authorization</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        You authorize FindB Technologies LLC to charge your provided payment method for the applicable subscription fees, taxes, and transaction charges.
                      </p>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 6. Cancellations & Refunds */}
                <section id="cancellations" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">6.</span> Cancellations &amp; Refund Policy
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    We believe in complete transparency and customer freedom. We do not enforce lock-in contracts or punitive cancellation hurdles:
                  </p>
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2 text-xs sm:text-sm text-slate-700">
                    <div className="font-bold text-blue-900">How to Cancel:</div>
                    <p>
                      You can cancel your subscription at any time with one click by navigating to our dedicated <Link href="/cancel-subscription" className="text-[#2563EB] font-bold underline">Cancel Subscription</Link> page, entering your account email, and confirming cancellation.
                    </p>
                    <p className="text-slate-500 text-xs">
                      Upon cancellation, your subscription will not renew, and no further charges will occur. You will maintain access until the end of your prepaid period.
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <strong>14-Day Refund Policy:</strong> If you experience technical faults preventing you from utilizing the platform or were charged in error, please contact our support team at <a href="mailto:support@findb.ai" className="text-[#2563EB] underline">support@findb.ai</a> within fourteen (14) days of the transaction for a prompt review and refund.
                  </p>
                </section>

                <hr className="border-slate-100" />

                {/* 7. Intellectual Property */}
                <section id="intellectual-property" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">7.</span> Intellectual Property Rights
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    All software, design systems, algorithms, database schemas, code, logos, visual trademarks, and documentation comprising the FindB service are the exclusive intellectual property of FindB Technologies LLC and its licensors.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    FindB grants you a limited, non-exclusive, non-transferable, revocable license to access the platform and export lead files solely for your internal business operations in accordance with these Terms.
                  </p>
                </section>

                <hr className="border-slate-100" />

                {/* 8. Disclaimers */}
                <section id="disclaimers" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">8.</span> Disclaimers &amp; Data Accuracy
                  </h2>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs sm:text-sm text-amber-900 leading-relaxed space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <ExclamationCircleOutlined />
                      <span>Service Provided &quot;AS-IS&quot;</span>
                    </div>
                    <p>
                      FindB retrieves public commercial business listings from third-party mapping indices and public websites. While we implement rigorous automated validation algorithms, we do not guarantee that all phone numbers, email addresses, or operational statuses are 100% complete, error-free, or current.
                    </p>
                    <p>
                      FindB does not warrant that your outreach to discovered prospects will achieve specific sales quotas, conversion rates, or financial returns.
                    </p>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 9. Limitation of Liability */}
                <section id="liability" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">9.</span> Limitation of Liability
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    To the maximum extent permitted by applicable law, in no event shall FindB Technologies LLC, its directors, employees, or partners be liable for any indirect, incidental, punitive, special, or consequential damages (including loss of profits, revenue, data, or business goodwill) arising from your use of or inability to use the platform.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Our total aggregate liability for any claims under these Terms shall be limited to the total amount paid by you to FindB during the twelve (12) month period immediately preceding the event giving rise to liability.
                  </p>
                </section>

                <hr className="border-slate-100" />

                {/* 10. Governing Law & Contact */}
                <section id="governing-law" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">10.</span> Governing Law &amp; Contact Information
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    These Terms shall be governed by and construed in accordance with applicable laws without regard to conflict of law principles. Any legal suit, action, or proceeding arising out of or related to these Terms shall be instituted in competent commercial courts.
                  </p>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm space-y-1.5">
                    <div className="font-bold text-slate-900">FindB Technologies LLC</div>
                    <div className="text-slate-600 flex items-center gap-2">
                      <MailOutlined className="text-[#2563EB]" />
                      <span>Legal Notices: <a href="mailto:legal@findb.ai" className="text-[#2563EB] hover:underline font-medium">legal@findb.ai</a></span>
                    </div>
                    <div className="text-slate-600">
                      Customer Support: <a href="mailto:support@findb.ai" className="text-[#2563EB] hover:underline font-medium">support@findb.ai</a>
                    </div>
                    <div className="text-slate-500 text-xs pt-1">
                      Website: <Link href="/" className="text-[#2563EB] hover:underline">https://findb.ai</Link>
                    </div>
                  </div>
                </section>

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
