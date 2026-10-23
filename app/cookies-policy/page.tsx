'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import LoginModal from '@/components/marketing/LoginModal';
import { 
  SafetyCertificateOutlined, 
  SettingOutlined, 
  BarChartOutlined, 
  ThunderboltOutlined,
  InfoCircleOutlined,
  MailOutlined
} from '@ant-design/icons';

export default function CookiesPolicyPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-[#4F46E5] selection:text-white">
      {/* Wave Banner with Embedded Translucent Navbar */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#503BF6] via-[#A832E5] to-[#EE4B7B] pb-24 sm:pb-32 rounded-b-[48px] sm:rounded-b-[68px] shadow-lg">
        <MarketingHeader onOpenLogin={() => setIsLoginOpen(true)} activePath="/cookies-policy" />

        <div className="mx-auto max-w-7xl px-4 pt-28 sm:pt-36 lg:pt-44 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-4 border border-white/20">
            <SafetyCertificateOutlined />
            <span>Transparency &amp; Privacy Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight !text-white drop-shadow-sm">
            Cookies Policy
          </h1>
          <p className="mt-4 text-white/85 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Learn how FindB Technologies LLC utilizes cookies and browser storage technologies to keep your account secure, accelerate B2B lead discovery, and deliver reliable platform features.
          </p>
          <p className="mt-2 text-xs text-white/70">
            Last Updated: October 2026 &middot; Version 2.4
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
                  Table of Contents
                </div>
                <nav className="space-y-1 text-sm font-medium">
                  <a href="#overview" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    1. Overview &amp; Scope
                  </a>
                  <a href="#what-are-cookies" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    2. What Are Cookies?
                  </a>
                  <a href="#cookie-types" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    3. Categories of Cookies We Use
                  </a>
                  <a href="#local-storage" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    4. Local Storage &amp; Cache
                  </a>
                  <a href="#third-parties" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    5. Third-Party Integrations
                  </a>
                  <a href="#managing-cookies" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    6. How to Control Cookies
                  </a>
                  <a href="#contact-us" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    7. Contact &amp; Questions
                  </a>
                </nav>

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <InfoCircleOutlined className="text-[#2563EB]" />
                    <span>Quick Tip</span>
                  </div>
                  <p>
                    Essential cookies are required for logging into FindB and executing real-time lead searches. Disabling them may break authentication.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Main Article Content */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl bg-white shadow-xl border border-slate-200/80 p-6 sm:p-10 space-y-10">
                
                {/* 1. Overview */}
                <section id="overview" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">1.</span> Overview &amp; Scope
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    This Cookies Policy explains how <strong>FindB Technologies LLC</strong> (&quot;FindB&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) uses cookies, pixel tags, web beacons, browser local storage, and similar technologies on our website (<Link href="/" className="text-[#2563EB] underline">findb.ai</Link>), web application platform, and related B2B lead generation services.
                  </p>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    By browsing or using FindB, you consent to our use of cookies in accordance with this policy. We ensure that our data handling adheres strictly to international privacy standards, including the EU General Data Protection Regulation (GDPR), the ePrivacy Directive, and the California Consumer Privacy Act (CCPA).
                  </p>
                </section>

                <hr className="border-slate-100" />

                {/* 2. What are Cookies */}
                <section id="what-are-cookies" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">2.</span> What Are Cookies?
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Cookies are small text files sent to your browser by a website you visit. They are stored on your device (computer, tablet, or smartphone) and allow the site to remember your actions, preferences, and authentication state over a period of time, so you don’t have to re-enter them every time you return to the platform or browse between pages.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="font-bold text-slate-800 text-sm mb-1">Session Cookies</div>
                      <div className="text-xs text-slate-600">
                        Temporary cookies that expire and are automatically erased when you close your browser. They keep your search queries and active lead scan parameters synchronized.
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="font-bold text-slate-800 text-sm mb-1">Persistent Cookies</div>
                      <div className="text-xs text-slate-600">
                        Remain stored on your device until they expire or are manually cleared. They allow FindB to remember your login session and custom UI preferences across visits.
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 3. Categories of Cookies We Use */}
                <section id="cookie-types" className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">3.</span> Categories of Cookies We Use
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    We group the cookies and storage tokens utilized on FindB into four distinct functional categories:
                  </p>

                  <div className="space-y-4">
                    {/* Category A */}
                    <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-[#2563EB] font-bold text-base">
                        <SafetyCertificateOutlined />
                        <span>A. Strictly Necessary / Essential Cookies</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        These cookies are vital for the core functionality of FindB. They enable secure authentication, cross-site request forgery (CSRF) tokens, session management, and routing. Without these cookies, you cannot log into your dashboard or perform lead searches.
                      </p>
                      <div className="text-xs text-slate-500 font-mono">
                        Examples: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">findb_session</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">csrf_token</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">auth_token</code>
                      </div>
                    </div>

                    {/* Category B */}
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                        <ThunderboltOutlined className="text-amber-500" />
                        <span>B. Functional &amp; Preference Cookies</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        Functional cookies enable our application to remember choices you make during your prospecting workflows—such as default search filters (e.g. &quot;Only businesses without websites&quot;), table column ordering, sort directions, and notification settings.
                      </p>
                    </div>

                    {/* Category C */}
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                        <BarChartOutlined className="text-emerald-500" />
                        <span>C. Performance &amp; Analytics Cookies</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        These cookies collect aggregated, anonymized metrics on how visitors navigate FindB, which features are most heavily utilized (such as CSV export or real-time website crawling), and where API latency occurs. This telemetry helps us optimize server performance and user interface speed.
                      </p>
                    </div>

                    {/* Category D */}
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                        <SettingOutlined className="text-purple-500" />
                        <span>D. Marketing &amp; Referral Cookies</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        We use minimal attribution cookies to measure the effectiveness of our advertising campaigns and affiliate partner referrals. They help us understand which channel introduced you to FindB without tracking your private browsing activity across third-party websites.
                      </p>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 4. Local Storage */}
                <section id="local-storage" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">4.</span> Local Storage &amp; Cache
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    In addition to HTTP cookies, FindB leverages modern HTML5 browser technologies including <strong>LocalStorage</strong> and <strong>SessionStorage</strong>. These store client-side preferences and temporary state directly in your browser without transmitting them on every network request.
                  </p>
                  <ul className="list-disc pl-5 text-sm sm:text-base text-slate-600 space-y-2">
                    <li><strong>JWT Authorization Tokens:</strong> Securely persist your authenticated session so you don’t need to re-login on page refreshes.</li>
                    <li><strong>Search Cache:</strong> Accelerates instant lead filtering by caching recent city scans locally.</li>
                    <li><strong>Table Customization:</strong> Preserves hidden columns and pagination preferences.</li>
                  </ul>
                </section>

                <hr className="border-slate-100" />

                {/* 5. Third-Party Integrations */}
                <section id="third-parties" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">5.</span> Third-Party Integrations
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    To deliver reliable payment processing, authentication, and platform stability, FindB partners with trusted third-party service providers who may also set cookies on our behalf:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <div className="font-bold text-xs text-slate-900">Payment Gateways</div>
                      <div className="text-xs text-slate-500 mt-1">PCI-DSS compliant processors for secure trial &amp; subscription transactions.</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <div className="font-bold text-xs text-slate-900">OAuth Providers</div>
                      <div className="text-xs text-slate-500 mt-1">Google, Apple, and Facebook for seamless single sign-on authentication.</div>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <div className="font-bold text-xs text-slate-900">Infrastructure &amp; CDN</div>
                      <div className="text-xs text-slate-500 mt-1">Cloudflare and AWS for low-latency assets and DDoS mitigation.</div>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 6. How to Control Cookies */}
                <section id="managing-cookies" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">6.</span> How You Can Control or Disable Cookies
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Most web browsers automatically accept cookies, but you have the right and ability to accept, refuse, or delete cookies at any time via your browser preferences.
                  </p>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs sm:text-sm text-amber-900 leading-relaxed">
                    <strong>Important Note:</strong> If you choose to reject or disable strictly necessary cookies, key components of the FindB application—including user login, subscription verification, and CSV exports—may become inaccessible.
                  </div>
                  <p className="text-sm text-slate-600">
                    To adjust your cookie preferences in your specific browser, refer to the official documentation:
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">Google Chrome</span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">Mozilla Firefox</span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">Apple Safari</span>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">Microsoft Edge</span>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 7. Contact */}
                <section id="contact-us" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">7.</span> Contact &amp; Questions
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    If you have questions or concerns regarding our use of cookies or privacy practices, please contact our Data Protection Officer:
                  </p>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm space-y-1.5">
                    <div className="font-bold text-slate-900">FindB Technologies LLC</div>
                    <div className="text-slate-600 flex items-center gap-2">
                      <MailOutlined className="text-[#2563EB]" />
                      <span>Email: <a href="mailto:privacy@findb.ai" className="text-[#2563EB] hover:underline font-medium">privacy@findb.ai</a></span>
                    </div>
                    <div className="text-slate-600">
                      Support: <a href="mailto:support@findb.ai" className="text-[#2563EB] hover:underline font-medium">support@findb.ai</a>
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
