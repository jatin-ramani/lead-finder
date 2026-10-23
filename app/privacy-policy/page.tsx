'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import LoginModal from '@/components/marketing/LoginModal';
import { 
  LockOutlined, 
  FileProtectOutlined, 
  GlobalOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  MailOutlined
} from '@ant-design/icons';

export default function PrivacyPolicyPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-[#4F46E5] selection:text-white">
      {/* Wave Banner with Embedded Translucent Navbar */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#503BF6] via-[#A832E5] to-[#EE4B7B] pb-24 sm:pb-32 rounded-b-[48px] sm:rounded-b-[68px] shadow-lg">
        <MarketingHeader onOpenLogin={() => setIsLoginOpen(true)} activePath="/privacy-policy" />

        <div className="mx-auto max-w-7xl px-4 pt-28 sm:pt-36 lg:pt-44 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-4 border border-white/20">
            <LockOutlined />
            <span>GDPR &amp; CCPA Compliant Privacy Standards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight !text-white drop-shadow-sm">
            Privacy Policy
          </h1>
          <p className="mt-4 text-white/85 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            FindB Technologies LLC is dedicated to safeguarding your personal data and upholding the highest standards of data integrity for our global B2B sales intelligence platform.
          </p>
          <p className="mt-2 text-xs text-white/70">
            Effective Date: October 2026 &middot; Version 3.1
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
                  Privacy Sections
                </div>
                <nav className="space-y-1 text-sm font-medium">
                  <a href="#introduction" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    1. Introduction &amp; Scope
                  </a>
                  <a href="#information-we-collect" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    2. Information We Collect
                  </a>
                  <a href="#b2b-data" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    3. B2B Public Directory Data
                  </a>
                  <a href="#how-we-use-data" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    4. How We Use Information
                  </a>
                  <a href="#legal-basis" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    5. Legal Basis for Processing
                  </a>
                  <a href="#data-sharing" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    6. Data Sharing &amp; Third Parties
                  </a>
                  <a href="#security" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    7. Security &amp; Data Protection
                  </a>
                  <a href="#your-rights" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    8. Your Rights (GDPR &amp; CCPA)
                  </a>
                  <a href="#opt-out" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    9. Business Removal &amp; Opt-Out
                  </a>
                  <a href="#contact" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors">
                    10. Contacting Us
                  </a>
                </nav>

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                    <CheckCircleOutlined />
                    <span>No Data Selling</span>
                  </div>
                  <p>
                    We never sell, rent, or monetize your private account or payment credentials to third-party advertisers.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Main Article Content */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl bg-white shadow-xl border border-slate-200/80 p-6 sm:p-10 space-y-10">
                
                {/* 1. Introduction */}
                <section id="introduction" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">1.</span> Introduction &amp; Scope
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Welcome to <strong>FindB</strong>, operated by <strong>FindB Technologies LLC</strong> (&quot;FindB&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We provide a B2B sales intelligence and local lead generation engine designed for marketing agencies, outbound sales professionals, and software consultants.
                  </p>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    This Privacy Policy articulates our practices regarding the collection, storage, processing, and protection of personal data when you interact with our website (<Link href="/" className="text-[#2563EB] underline">findb.ai</Link>), use our software services, or when your business information appears within our B2B directory index.
                  </p>
                </section>

                <hr className="border-slate-100" />

                {/* 2. Information We Collect */}
                <section id="information-we-collect" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">2.</span> Information We Collect
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    We distinguish between two primary classifications of data: <strong>User Account Information</strong> and <strong>Public B2B Commercial Data</strong>.
                  </p>

                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <UserOutlined className="text-[#2563EB]" />
                        <span>A. User Account &amp; Billing Data</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        When you register for a FindB account, subscribe to a trial plan, or contact support, we collect:
                      </p>
                      <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                        <li><strong>Contact Identifiers:</strong> Name, professional email address, and authentication credentials (hashed passwords or OAuth identifiers).</li>
                        <li><strong>Payment Records:</strong> Transaction IDs, billing zip codes, and receipt history. Payment card numbers are processed directly by PCI-DSS Level 1 certified payment gateways and are never stored on our servers.</li>
                        <li><strong>User Preferences:</strong> Saved lead filters, custom search presets, and notification settings.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <GlobalOutlined className="text-purple-600" />
                        <span>B. System &amp; Usage Telemetry</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        To maintain service reliability and enforce rate limits, we automatically record:
                      </p>
                      <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                        <li>IP addresses, browser client headers, operating system versions, and device types.</li>
                        <li>API scan counts, lead export logs, and page load performance metrics.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 3. B2B Public Directory Data */}
                <section id="b2b-data" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">3.</span> Public B2B Directory Data
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    FindB indexes publicly available business records to help digital agencies identify companies that require web development, marketing, and technological modernization.
                  </p>
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                    <div className="font-bold text-blue-900">What our B2B Index Contains:</div>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Commercial business names and operating industry categories.</li>
                      <li>Public street addresses, phone numbers, and operational hours.</li>
                      <li>Website presence status, domain registration details, and technical audit scores.</li>
                      <li>Publicly disclosed corporate email addresses (e.g., info@company.com or sales@company.com) and official social media profiles.</li>
                    </ul>
                  </div>
                  <p className="text-xs text-slate-500">
                    We do <strong>not</strong> collect private consumer records, social security numbers, banking details, or sensitive personal data under any circumstances.
                  </p>
                </section>

                <hr className="border-slate-100" />

                {/* 4. How We Use Information */}
                <section id="how-we-use-data" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">4.</span> How We Use Information
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    We process information strictly for legitimate commercial and operational purposes, including:
                  </p>
                  <ul className="list-disc pl-5 text-sm sm:text-base text-slate-600 space-y-2">
                    <li><strong>Delivering Platform Features:</strong> Running real-time business discovery, verifying domain presence, and generating clean CSV exports.</li>
                    <li><strong>Account Administration:</strong> Authenticating user logins, sending transactional notifications, and processing subscription renewals.</li>
                    <li><strong>Fraud Prevention &amp; Security:</strong> Monitoring abuse patterns, preventing automated credential stuffing, and upholding system integrity.</li>
                    <li><strong>Customer Support:</strong> Responding to user inquiries, troubleshooting scan jobs, and resolving billing requests.</li>
                  </ul>
                </section>

                <hr className="border-slate-100" />

                {/* 5. Legal Basis under GDPR */}
                <section id="legal-basis" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">5.</span> Legal Basis for Processing (GDPR)
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    For individuals within the European Economic Area (EEA), United Kingdom, and Switzerland, our processing relies on the following lawful bases:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="font-bold text-xs text-slate-900 mb-1">Contractual Necessity</div>
                      <div className="text-xs text-slate-600">To provide the FindB services you subscribed to under our Terms.</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="font-bold text-xs text-slate-900 mb-1">Legitimate Interests</div>
                      <div className="text-xs text-slate-600">Facilitating commercial B2B sales discovery and business networking.</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="font-bold text-xs text-slate-900 mb-1">Legal Obligations</div>
                      <div className="text-xs text-slate-600">Complying with accounting, tax, anti-fraud, and statutory requirements.</div>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 6. Data Sharing */}
                <section id="data-sharing" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">6.</span> Data Sharing &amp; Third Parties
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    FindB does not sell, rent, or barter personal user accounts. We only share information with vetted service providers who act as data processors under confidentiality agreements:
                  </p>
                  <ul className="list-disc pl-5 text-sm sm:text-base text-slate-600 space-y-1.5">
                    <li><strong>Hosting &amp; Cloud Infrastructure:</strong> AWS and MongoDB Atlas for secure database storage.</li>
                    <li><strong>Payment Processors:</strong> Stripe, Razorpay, or authorized gateways for billing execution.</li>
                    <li><strong>Communication Providers:</strong> Transactional email delivery systems for account verification.</li>
                    <li><strong>Legal Authorities:</strong> Only when strictly required by a valid court order or statutory mandate.</li>
                  </ul>
                </section>

                <hr className="border-slate-100" />

                {/* 7. Security */}
                <section id="security" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">7.</span> Security &amp; Data Protection
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    We employ enterprise-grade technical and organizational measures to safeguard data against accidental loss, unauthorized modification, and malicious intrusion:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700">
                      <strong>Cryptographic Security:</strong> All web traffic is strictly served over HTTPS with TLS 1.3 encryption. Passwords are cryptographically salted and hashed using Argon2/Bcrypt.
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700">
                      <strong>Access Controls:</strong> Database clusters enforce zero-trust network boundaries, role-based access controls (RBAC), and automated threat detection.
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 8. Your Rights */}
                <section id="your-rights" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">8.</span> Your Rights (GDPR &amp; CCPA)
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Depending on your geographic jurisdiction, you have statutory rights concerning your personal data:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <strong>Right of Access:</strong> Request a copy of the personal information we hold about you.
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete records.
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <strong>Right to Erasure:</strong> Request the deletion of your account and associated personal data.
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <strong>Right to Opt-Out:</strong> Exercise your right under CCPA to opt out of commercial directory indexing.
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 9. Business Removal & Opt-Out */}
                <section id="opt-out" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">9.</span> Business Removal &amp; Opt-Out
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    If you are a business owner and wish to modify or permanently remove your public business listing from the FindB search index, we provide a hassle-free, expedited removal procedure:
                  </p>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <p className="text-xs sm:text-sm text-slate-700">
                      Send an email to <a href="mailto:privacy@findb.ai" className="text-[#2563EB] font-bold underline">privacy@findb.ai</a> with the subject line <strong>&quot;Business Listing Removal Request&quot;</strong>, including your business name, address, and verification of authorization.
                    </p>
                    <p className="text-xs text-slate-500">
                      Our privacy team reviews and processes opt-out requests within <strong>48 business hours</strong> at zero cost.
                    </p>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* 10. Contact */}
                <section id="contact" className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-[#2563EB]">10.</span> Contacting Us
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    If you have questions, feedback, or complaints regarding this Privacy Policy or our data governance, please reach out to our Data Protection Office:
                  </p>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm space-y-1.5">
                    <div className="font-bold text-slate-900">FindB Technologies LLC</div>
                    <div className="text-slate-600 flex items-center gap-2">
                      <MailOutlined className="text-[#2563EB]" />
                      <span>Data Protection Officer: <a href="mailto:privacy@findb.ai" className="text-[#2563EB] hover:underline font-medium">privacy@findb.ai</a></span>
                    </div>
                    <div className="text-slate-600">
                      Support Team: <a href="mailto:support@findb.ai" className="text-[#2563EB] hover:underline font-medium">support@findb.ai</a>
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
