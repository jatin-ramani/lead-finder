'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import LoginModal from '@/components/marketing/LoginModal';
import { useAuth } from '@/features/auth/AuthContext';
import {
  CheckOutlined,
  CloseOutlined,
  DownOutlined,
  GlobalOutlined,
  MailOutlined,
  MinusOutlined,
  PhoneOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SendOutlined,
  StarFilled,
  ThunderboltOutlined,
} from '@ant-design/icons';

// Professional Vector SVG Icons for Search & Niches
const MapPinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563EB"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: '#2563EB', width: 18, height: 18, minWidth: 18 }}
  >
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ToothIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3C4.24 3 2 5.24 2 8c0 3.31 1.5 6.5 2.5 10 .8 2.8 2.5 4 4 4 1.2 0 2-.8 2.5-2 .5-1.2 1-1.2 2 0 .5 1.2 1.3 2 2.5 2 1.5 0 3.2-1.2 4-4 1-3.5 2.5-6.69 2.5-10 0-2.76-2.24-5-5-5-2.2 0-3.5 1.5-4.5 1.5S9.2 3 7 3z" />
  </svg>
);

const WrenchIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const RoofingIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const UtensilsIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
    <path d="M15 2v18" />
    <path d="M5 2c0 2.5 1.5 4 3 4v14" />
    <path d="M8 2v4" />
  </svg>
);

const ScaleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h18" />
  </svg>
);

const BoltIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const BuildingIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

const DumbbellIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6.5 6.5 11 11" />
    <path d="m21 21-1-1a2 2 0 0 0-2.83 0l-1.17 1.17a2 2 0 0 0 0 2.83l1 1a2 2 0 0 0 2.83 0l1.17-1.17a2 2 0 0 0 0-2.83Z" />
    <path d="m3 3 1 1a2 2 0 0 0 2.83 0l1.17-1.17a2 2 0 0 0 0-2.83l-1-1a2 2 0 0 0-2.83 0L3 1.17a2 2 0 0 0 0 2.83Z" />
  </svg>
);

const CarIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const CalculatorIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);

interface CategoryItem {
  id: string;
  label: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'Dentists', label: 'Dentists & Dental', tag: 'High Intent', icon: ToothIcon, bg: 'bg-blue-50 text-blue-600' },
  { id: 'Plumbers', label: 'Plumbing & Heating', tag: 'High Ticket', icon: WrenchIcon, bg: 'bg-amber-50 text-amber-600' },
  { id: 'Roofers', label: 'Roofing Contractors', tag: 'High Ticket', icon: RoofingIcon, bg: 'bg-emerald-50 text-emerald-600' },
  { id: 'Restaurants', label: 'Restaurants & Cafes', tag: 'Local', icon: UtensilsIcon, bg: 'bg-orange-50 text-orange-600' },
  { id: 'Lawyers', label: 'Attorneys & Legal', tag: 'High Value', icon: ScaleIcon, bg: 'bg-purple-50 text-purple-600' },
  { id: 'Electricians', label: 'Electricians', tag: 'Contractors', icon: BoltIcon, bg: 'bg-yellow-50 text-yellow-600' },
  { id: 'Real Estate', label: 'Real Estate Agencies', tag: 'High Ticket', icon: BuildingIcon, bg: 'bg-sky-50 text-sky-600' },
  { id: 'Gyms & Fitness', label: 'Fitness & Gyms', tag: 'Local', icon: DumbbellIcon, bg: 'bg-rose-50 text-rose-600' },
  { id: 'Auto Repair', label: 'Auto Repair & Service', tag: 'High Demand', icon: CarIcon, bg: 'bg-indigo-50 text-indigo-600' },
  { id: 'Accounting', label: 'CPAs & Accountants', tag: 'B2B', icon: CalculatorIcon, bg: 'bg-teal-50 text-teal-600' },
];

interface LandingPageProps {
  initialLoginOpen?: boolean;
}

export default function LandingPage({ initialLoginOpen = false }: LandingPageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(initialLoginOpen);
  const [category, setCategory] = useState('Restaurants');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [isDraggingDuration, setIsDraggingDuration] = useState(false);
  const [dragPercent, setDragPercent] = useState<number | null>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const [activeFaqTab, setActiveFaqTab] = useState<'about' | 'billing' | 'account'>('about');
  const [openFaq, setOpenFaq] = useState<Record<string, boolean>>({
    'about-0': true,
  });

  // Click outside and Escape key listener for custom dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFaq = (key: string) => {
    setOpenFaq((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const durationPricing: Record<number, { price: string; perMonth: string; save?: string }> = {
    1: { price: '₹2,495', perMonth: '₹2,495 / month' },
    2: { price: '₹4,490', perMonth: '₹2,245 / month', save: 'Save 10%' },
    3: { price: '₹5,990', perMonth: '₹1,996 / month', save: 'Save 20%' },
    4: { price: '₹7,490', perMonth: '₹1,872 / month', save: 'Save 25%' },
  };

  const handleSliderPointer = (clientX: number) => {
    if (!sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const rawFraction = (clientX - rect.left) / rect.width;
    const fraction = Math.max(0, Math.min(1, rawFraction));
    const closest = Math.round(1 + fraction * 3);
    const clamped = Math.max(1, Math.min(4, closest));
    setSelectedDuration(clamped);
    setDragPercent(fraction * 100);
  };

  const handleSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingDuration(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    handleSliderPointer(e.clientX);
  };

  const handleSliderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingDuration) return;
    handleSliderPointer(e.clientX);
  };

  const handleSliderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingDuration) {
      setIsDraggingDuration(false);
      setDragPercent(null);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('findb_search_category', category);
        localStorage.setItem('findb_search_location', location);
      } catch {
        // Ignore localStorage quota errors
      }
    }
    setIsLoginOpen(true);
  };

  const faqData = {
    about: [
      {
        q: 'What is FindB?',
        a: 'FindB is an advanced B2B sales intelligence and local lead generation platform. It empowers marketing agencies, web design firms, and sales teams to discover high-value local businesses, uncover companies without websites, and acquire verified contact emails and direct phone numbers.',
      },
      {
        q: 'How does FindB find local business leads?',
        a: 'FindB connects to global place directories (including Geoapify Places and mapping APIs) across 190+ countries. It indexes businesses by city, category, rating, and address, then applies deep enrichment to verify whether they have an active website and extract contact details.',
      },
      {
        q: 'Why should I target businesses without a website?',
        a: 'Local businesses without websites are the highest-converting prospect segment for digital agencies, freelance web developers, and SEO consultants. These businesses already have revenue, staff, and paying customers, but desperately need an online presence to survive and grow.',
      },
      {
        q: 'What contact details does FindB discover?',
        a: 'FindB retrieves business names, physical addresses, direct phone numbers, website status, verified decision-maker emails, social links, opening hours, and precise geo-coordinates.',
      },
      {
        q: 'Is web scraping and lead generation with FindB legal?',
        a: 'Yes. FindB strictly collects publicly available business information and public commercial registry data. All data collection follows responsible crawling best practices, rate limits, GDPR public directory standards, and CAN-SPAM regulations.',
      },
      {
        q: 'Can I export my leads into my CRM or email sequencer?',
        a: 'Yes! FindB supports one-click CSV export with UTF-8 BOM encoding and spreadsheet formula injection protection. You can export filtered leads straight into tools like Instantly, Lemlist, Apollo, HubSpot, or Excel.',
      },
    ],
    billing: [
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
        q: 'Is my credit card information secure with FindB?',
        a: 'Yes, absolutely. All payments are encrypted with 256-bit SSL encryption via trusted, PCI-compliant payment gateways. We never store raw payment details on our servers.',
      },
    ],
    account: [
      {
        q: 'How do I cancel my subscription?',
        a: 'Visit the Cancel Subscription page in the top menu, enter your registered email address, and click Cancel Subscription. You will receive immediate confirmation.',
      },
      {
        q: 'I forgot the credentials associated with my account. How can I reset them?',
        a: 'Click "Login" in the header, then click "Forgot Password?". Enter your email address to receive a secure credentials reset link.',
      },
    ],
  };

  const currentCategoryObj = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-[#0F172A] flex flex-col justify-between selection:bg-[#4F46E5] selection:text-white">
      {/* Hero Section with Tracelo Organic Curved Shape */}
      <section className="relative w-full bg-white lg:lf-hero-shape-container min-h-[100dvh] lg:min-h-[780px] xl:min-h-[820px] flex flex-col justify-between overflow-hidden">
        {/* Mobile Full Covered View Background (Only on < lg screens) */}
        <div className="block lg:hidden absolute inset-0 w-full h-full lf-hero-gradient z-0 pointer-events-none" />

        {/* Razor-Sharp Mathematical Vector Curved Shape & Gradient for Desktop (lg+) */}
        <svg
          className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none select-none z-0"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lfHeroSharpGradient" x1="0%" y1="35%" x2="100%" y2="5%">
              <stop offset="0%" stopColor="var(--lf-hero-stop-1, #4e46f6)" />
              <stop offset="22%" stopColor="var(--lf-hero-stop-2, #7032ea)" />
              <stop offset="50%" stopColor="var(--lf-hero-stop-3, #b625d9)" />
              <stop offset="75%" stopColor="var(--lf-hero-stop-4, #ed368d)" />
              <stop offset="90%" stopColor="var(--lf-hero-stop-5, #f66c7a)" />
              <stop offset="100%" stopColor="var(--lf-hero-stop-6, #f99e94)" />
            </linearGradient>
          </defs>
          <path
            d="M 0,0 L 0,798 L 380,798 C 600,798 760,680 880,480 C 1000,280 1140,80 1296,0 L 0,0 Z"
            fill="url(#lfHeroSharpGradient)"
          />
        </svg>

        {/* FindB Navbar */}
        <div className="relative z-20">
          <MarketingHeader onOpenLogin={() => setIsLoginOpen(true)} activePath="/" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12 flex-1 flex flex-col justify-center pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-48 lg:pb-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Heading + Lead Search Widget */}
            <div className="lg:col-span-6 xl:col-span-7 text-left !text-white max-w-2xl mx-auto lg:mx-0">
              <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.12] drop-shadow-sm !text-white mb-4">
                Find Local Leads, Close More Clients
              </h1>

              <p className="text-base sm:text-lg !text-white/90 font-normal leading-relaxed mb-6">
                Search any city or niche to uncover local businesses without a website, verified emails, and direct phone numbers.
              </p>

              {/* Plain Long White Search Widget matching Tracelo */}
              <form
                onSubmit={handleSearchSubmit}
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                className="w-full max-w-2xl rounded-2xl sm:rounded-full bg-white p-1.5 sm:p-2 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 shadow-none border-none outline-none ring-0 select-none"
              >
                {/* Custom Category Dropdown Trigger */}
                <div className="relative w-full sm:w-auto shrink-0" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-label="Select Category"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                    className="cursor-pointer w-full sm:w-auto h-[48px] sm:h-[50px] flex items-center justify-between gap-2.5 px-4 sm:px-5 rounded-full hover:bg-slate-50 transition-colors text-slate-800 border-none outline-none focus:outline-none focus:ring-0 select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-blue-50 text-[#2563EB]">
                        {(() => {
                          const IconComp = currentCategoryObj.icon;
                          return <IconComp className="w-3.5 h-3.5" />;
                        })()}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
                        {currentCategoryObj.id}
                      </span>
                    </div>
                    <DownOutlined
                      className={`text-[10px] text-slate-400 transition-transform duration-200 shrink-0 ${
                        isDropdownOpen ? 'rotate-180 text-[#2563EB]' : ''
                      }`}
                    />
                  </button>

                  {/* Custom Dropdown Floating Menu */}
                  {isDropdownOpen && (
                    <div
                      role="listbox"
                      className="absolute left-0 top-full mt-3 w-full max-w-[280px] sm:w-80 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto"
                    >
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Target Niche
                      </div>
                      <div className="space-y-1">
                        {CATEGORIES.map((cat) => {
                          const isSelected = category === cat.id;
                          const CatIcon = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              role="option"
                              aria-selected={isSelected}
                              type="button"
                              onClick={() => {
                                setCategory(cat.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors text-xs font-semibold ${
                                isSelected
                                  ? 'bg-blue-50 text-[#2563EB] font-bold'
                                  : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${cat.bg}`}>
                                  <CatIcon className="w-3.5 h-3.5" />
                                </span>
                                <span className="truncate">{cat.label}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                                  {cat.tag}
                                </span>
                                {isSelected && <CheckOutlined className="text-[#2563EB] text-xs font-black" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Vertical Divider for desktop / Horizontal for mobile */}
                <div className="hidden sm:block h-7 w-[1px] bg-slate-200 shrink-0 mx-1" />
                <div className="block sm:hidden w-full h-[1px] bg-slate-100" />

                {/* City / Location Input - Completely Proper & Clean */}
                <div
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  className="w-full sm:flex-1 h-[48px] sm:h-[50px] flex items-center px-3 sm:px-4 rounded-full bg-transparent border-none outline-none ring-0"
                >
                  <MapPinIcon className="mr-2.5 shrink-0 pointer-events-none" />
                  <input
                    ref={locationInputRef}
                    type="text"
                    placeholder="City or Area (e.g. New York, NY)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className="lf-search-input w-full h-full bg-transparent text-xs sm:text-sm font-normal text-slate-900 placeholder:text-slate-400 placeholder:font-normal border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-none shadow-none ring-0 p-0"
                  />
                  {location && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocation('');
                        locationInputRef.current?.focus();
                      }}
                      className="cursor-pointer text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded-full transition-colors ml-1 focus:outline-none flex items-center justify-center"
                      aria-label="Clear location input"
                    >
                      <CloseOutlined className="text-[10px]" />
                    </button>
                  )}
                </div>

                {/* Find Leads Action Button - Crisp White Pill with Blue Border and Liquid Blob Hover Animation */}
                <button
                  type="submit"
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className="blob-btn blob-btn--blue w-full sm:w-auto h-[46px] sm:h-[48px] cursor-pointer shrink-0 rounded-full border-2 border-[#2563EB] bg-white text-[#2563EB] px-6 sm:px-8 text-xs sm:text-sm font-bold shadow-none transition-all flex items-center justify-center gap-2 select-none outline-none"
                >
                  <span className="blob-btn__inner" aria-hidden="true">
                    <span className="blob-btn__blobs">
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                      <span className="blob-btn__blob"></span>
                    </span>
                  </span>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <SearchOutlined className="text-sm transition-colors duration-300" />
                    <span>Find Leads</span>
                  </span>
                </button>
              </form>

              {/* Live Intelligence Stats Notice */}
              <p className="mt-4 text-xs sm:text-[13px] !text-white/85 max-w-xl leading-relaxed">
                Over 2.5M+ local places indexed. Filter businesses without websites &amp; export clean CSVs.
              </p>
            </div>

            {/* Right Column: Tilted Device Mockup displaying FindB Lead Scanner (Desktop only) */}
            <div className="hidden lg:flex lg:col-span-6 xl:col-span-5 justify-center items-center relative pt-4 pb-8 lg:pb-12 z-20">
              {/* Outer Phone Wrapper: Tilted matching reference screenshot (~9.5deg), 100% Razor Sharp Vector Chassis */}
              <div 
                className="relative w-[310px] xs:w-[325px] sm:w-[340px] lg:w-[350px] xl:w-[365px] aspect-[9/18.8] rounded-[52px] bg-[#16181D] p-[9px] shadow-[0_32px_80px_-16px_rgba(15,23,42,0.48),0_0_0_1.5px_rgba(255,255,255,0.18)_inset,0_0_0_1px_rgba(0,0,0,0.8)] select-none transition-transform duration-300"
                style={{
                  transform: 'rotate(9.5deg)',
                  transformOrigin: 'center center',
                }}
              >
                {/* Screen Container Layer: Crisp, high-contrast, zero mask, zero blur */}
                <div className="w-full h-full rounded-[43px] bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#EFF6FF] flex flex-col text-slate-800 overflow-hidden relative shadow-inner">
                  
                  {/* 1. iOS Status Bar with Dynamic Island and Frame.svg */}
                  <div className="relative w-full pt-2.5 pb-1 px-3 flex flex-col items-center select-none shrink-0 z-30">
                    {/* Native Frame.svg (Time 9:41 on left, Cellular + Wifi + Battery on right) */}
                    <div className="w-full px-1">
                      <img 
                        src="/images/Frame.svg" 
                        alt="iPhone Status Bar" 
                        className="w-full h-auto block select-none pointer-events-none" 
                      />
                    </div>

                    {/* Sleek Dynamic Island Pill (Leaves ~2px clearance below Island before screen design) */}
                    <div className="absolute top-2 w-[105px] h-[26px] bg-black rounded-full mx-auto flex items-center justify-between px-3 shadow-sm pointer-events-none">
                      {/* Left TrueDepth camera sensor */}
                      <div className="w-2.5 h-2.5 rounded-full bg-[#18181b] border border-neutral-800/80 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-blue-950/80" />
                      </div>
                      {/* Right ambient light sensor */}
                      <div className="w-2 h-2 rounded-full bg-[#141416]" />
                    </div>
                  </div>

                  {/* 2. App Brand Header with Original FindB Logo & "FindB" (starts exactly 2px below Island clearance) */}
                  <div className="px-3.5 pt-2 pb-2 flex items-center justify-between border-b border-slate-200/90 bg-white/95 shrink-0 z-20">
                    <div className="flex items-center gap-2">
                      {/* Original FindB Logo in Circular Badge */}
                      <div className="w-7 h-7 rounded-full bg-white shadow-xs border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                        <img 
                          src="/logo/logo.svg" 
                          alt="FindB Logo" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <div>
                        <span className="text-sm font-black tracking-tight text-slate-900 leading-none block">FindB</span>
                        <div className="text-[9.5px] text-slate-500 font-semibold mt-0.5 truncate max-w-[130px]">
                          {location || 'New York, NY'} &middot; {category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[9.5px] font-extrabold text-emerald-700 tracking-tight">142 Leads</span>
                    </div>
                  </div>

                  {/* 3. Live Metrics Ticker Chips */}
                  <div className="px-3 py-1.5 flex items-center justify-between gap-1.5 bg-slate-100/90 border-b border-slate-200 text-[9px] font-bold text-slate-800 shrink-0 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center gap-1 font-extrabold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      87 No Website
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1 font-extrabold">
                      <CheckOutlined className="text-[8px]" />
                      94 Verified
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1 font-extrabold">
                      <PhoneOutlined className="text-[8px]" />
                      142 Direct
                    </span>
                  </div>

                  {/* 4. Rich Product Preview Lead Cards Stream */}
                  <div className="p-2.5 space-y-2 flex-1 overflow-hidden z-10">
                    
                    {/* Lead Card 1: Lone Star Dental Care */}
                    <div className="p-2.5 rounded-2xl bg-white border border-rose-200 shadow-xs">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="text-xs font-black text-slate-900 leading-tight">Lone Star Dental Care</div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                            <span>Downtown Austin &middot;</span>
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                              ★ 4.8
                            </span>
                            <span className="text-slate-400">(124)</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
                          No Website
                        </span>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[9px] text-slate-700 font-semibold">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold truncate">
                          <PhoneOutlined className="text-[#2563EB] shrink-0 text-[10px]" />
                          <span>(512) 839-4401</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 truncate text-right justify-end font-medium">
                          <span>Dr. Sarah Jenkins</span>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[8.5px]">
                        <span className="text-rose-600 font-extrabold bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded">🔥 Missing Google Site</span>
                        <span className="text-emerald-700 font-black">98% Fit Score</span>
                      </div>
                    </div>

                    {/* Lead Card 2: Apex Plumbing & HVAC */}
                    <div className="p-2.5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="text-xs font-black text-slate-900 leading-tight">Apex Plumbing &amp; HVAC</div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                            <span>South Congress &middot;</span>
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                              ★ 4.9
                            </span>
                            <span className="text-slate-400">(88)</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[8px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
                          Verified Email
                        </span>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[9px] text-slate-800 font-bold truncate">
                        <MailOutlined className="text-emerald-600 shrink-0 text-[10px]" />
                        <span className="truncate">office@apexplumbing.com</span>
                        <span className="text-slate-400 ml-auto font-medium shrink-0">&middot; Mike Vance</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[8.5px]">
                        <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">Direct Outreach Ready</span>
                        <span className="text-slate-500 font-semibold">Decision Maker</span>
                      </div>
                    </div>

                    {/* Lead Card 3: Austin Premier Roofing */}
                    <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="text-xs font-black text-slate-900 leading-tight">Austin Premier Roofing</div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                            <span>North Austin &middot; ★ 5.0 (42)</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
                          No Website
                        </span>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[9px] text-slate-700 font-semibold">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold truncate">
                          <PhoneOutlined className="text-[#2563EB] shrink-0 text-[10px]" />
                          <span>(512) 490-1122</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 truncate text-right justify-end font-medium">
                          <span>David Miller</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Bottom Action Bar with High-Contrast Primary Button */}
                  <div className="p-3 pt-2 pb-2.5 bg-white border-t border-slate-200 mt-auto shrink-0 flex flex-col items-center z-20">
                    <button
                      type="button"
                      onClick={() => setIsLoginOpen(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black shadow-md shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                    >
                      <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 16 16">
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                      </svg>
                      <span className="text-white font-black tracking-tight">Export 142 Leads (CSV)</span>
                    </button>

                    {/* iPhone Home Indicator Pill */}
                    <div className="w-28 h-1 bg-slate-900 rounded-full mt-2" aria-hidden="true" />
                  </div>
                </div>

                {/* 6. Floating "142 Leads Discovered!" Badge Card (High-Contrast, Crisp Vector Rendering) */}
                <div 
                  className="absolute top-[42%] -left-6 sm:-left-12 lg:-left-16 xl:-left-20 w-[220px] xs:w-[250px] sm:w-[285px] rounded-2xl bg-white p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] border border-slate-200/90 z-40 transition-transform duration-200 hover:scale-105"
                  style={{
                    transform: 'rotate(-9.5deg)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <CheckOutlined className="text-[#2563EB] text-[10px] font-black" />
                    </div>
                    <span className="text-sm font-black tracking-tight text-slate-900">142 Leads Discovered!</span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-700 leading-snug">
                    {location || 'New York, NY'} &middot; <span className="font-bold text-rose-600">87 Without Website</span> &middot; <span className="font-bold text-emerald-600">94 Verified Emails</span> ready for outreach.
                  </p>
                  <div className="mt-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => setIsLoginOpen(true)}
                      className="cursor-pointer text-xs font-black text-[#2563EB] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View in Dashboard</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* 3. The 3 Pricing Cards Row - Stacked on Mobile & md Screens, Side-by-Side on Desktop (lg+) matching Tracelo */}
        <section id="pricing" className="w-full bg-white pt-6 sm:pt-10 pb-16 sm:pb-20 relative z-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr_1fr] xl:grid-cols-[1.38fr_1fr_1fr] gap-6 items-stretch">
              {/* Card 1: Special offer! (Bigger, Wider & Taller Card on Desktop) */}
              <div className="lg:row-span-2 w-full max-w-2xl lg:max-w-none mx-auto rounded-3xl bg-[#0B0F19] p-5 sm:p-7 md:p-9 !text-white flex flex-col justify-between shadow-2xl border border-slate-800/80 relative overflow-hidden group min-h-[480px] lg:min-h-[580px] h-full">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight !text-white drop-shadow-sm">
                    Special offer!
                  </h3>
                  <p className="mt-3 text-base sm:text-lg font-bold !text-white leading-snug">
                    Test out FindB&apos;s lead generation capabilities for just ₹109!
                  </p>
                  <p className="mt-2 text-xs sm:text-sm !text-slate-300 leading-relaxed">
                    FindB offers its services through an easy-to-manage subscription.
                  </p>
                </div>

                {/* Isometric 3D Analytics & Infrastructure Showcase */}
                <div className="mt-8 pt-4 relative flex items-center justify-center min-h-[260px] md:min-h-[300px]">
                  {/* Ambient Soft Radial Glow */}
                  <div className="absolute inset-x-4 bottom-2 h-44 bg-gradient-to-t from-indigo-600/25 via-violet-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                  {/* Vector Image */}
                  <div className="relative z-10 w-full flex items-center justify-center">
                    <Image
                      src="/images/special-offer-vector.png"
                      alt="FindB Lead Intelligence & Server Architecture"
                      width={380}
                      height={300}
                      className="w-full max-w-[310px] sm:max-w-[350px] h-auto object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-105 select-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Trial period (Refined Slate Card with Crisp Indigo Accent) */}
              <div className="w-full max-w-2xl lg:max-w-none mx-auto rounded-3xl bg-white p-5 sm:p-7 md:p-8 flex flex-col justify-between shadow-xl shadow-slate-200/50 border border-slate-200/90 relative min-h-[460px] lg:min-h-[490px] h-full">
                <div>
                  <span
                    style={{ color: '#ffffff' }}
                    className="inline-block px-3.5 py-1 text-xs font-bold !text-white bg-[#0B0F19] rounded-full shadow-xs"
                  >
                    Trial period
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] mt-4 tracking-tight">
                    ₹109
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">
                    Trial price
                  </div>
                  <p className="text-xs text-slate-600 mt-5 leading-relaxed">
                    FindB operates on a subscription basis. Your initial payment grants unrestricted access to all platform
                    lead discovery tools, website audits, and lead exports. After that period, the subscription fee applies.
                  </p>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsLoginOpen(true)}
                    className="cursor-pointer w-full h-[52px] rounded-2xl border-2 border-transparent bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    Start Trial
                  </button>
                </div>
              </div>

              {/* Card 3: Subscription (Luminous Indigo-Sapphire Gradient) */}
              <div className="w-full max-w-2xl lg:max-w-none mx-auto rounded-3xl bg-gradient-to-br from-[#3730A3] via-[#4338CA] to-[#4F46E5] p-5 sm:p-7 md:p-8 text-white flex flex-col justify-between shadow-2xl shadow-indigo-900/30 border border-indigo-300/30 relative overflow-hidden min-h-[460px] lg:min-h-[490px] h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3.5 py-1 text-xs font-bold !text-[#4338CA] bg-white rounded-full shadow-sm">
                      Subscription
                    </span>
                    {durationPricing[selectedDuration].save && (
                      <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/40 rounded-full border border-emerald-400/30">
                        {durationPricing[selectedDuration].save}
                      </span>
                    )}
                  </div>

                  <div className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
                    {durationPricing[selectedDuration].price}
                  </div>
                  <div className="text-xs font-medium text-indigo-100 mt-1">
                    {durationPricing[selectedDuration].perMonth}
                  </div>

                  {/* Plan options Step Slider */}
                  <div className="mt-5">
                    <div className="text-xs font-bold text-indigo-100 mb-2">Plan options</div>
                    <div className="relative py-2.5 px-3 sm:px-4">
                      {/* Track Container */}
                      <div
                        ref={sliderTrackRef}
                        onPointerDown={handleSliderPointerDown}
                        onPointerMove={handleSliderPointerMove}
                        onPointerUp={handleSliderPointerUp}
                        onPointerCancel={handleSliderPointerUp}
                        className="h-3.5 w-full rounded-full bg-white/20 p-0.5 flex items-center relative border border-white/25 cursor-pointer touch-none select-none"
                      >
                        {/* Active Progress Fill */}
                        <div
                          className={`h-full rounded-full bg-white/60 ${
                            isDraggingDuration ? '' : 'transition-all duration-200'
                          }`}
                          style={{
                            width: `${isDraggingDuration && dragPercent !== null ? dragPercent : ((selectedDuration - 1) / 3) * 100}%`,
                          }}
                        />

                        {/* Concentric Double-Ring Thumb */}
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 -ml-[22px] w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg pointer-events-none ${
                            isDraggingDuration ? 'scale-105' : 'transition-all duration-200'
                          }`}
                          style={{
                            left: `${isDraggingDuration && dragPercent !== null ? dragPercent : ((selectedDuration - 1) / 3) * 100}%`,
                          }}
                        >
                          {/* Inner Ring with matching card color border and white center */}
                          <div className="w-7 h-7 rounded-full border-[3px] border-[#4338CA] bg-white shadow-xs" />
                        </div>
                      </div>

                      {/* Step Numbers / Buttons precisely aligned underneath each stop */}
                      <div className="relative h-6 mt-6 select-none">
                        {[1, 2, 3, 4].map((num) => {
                          const isSelected = selectedDuration === num;
                          const labelText = isSelected
                            ? num === 1
                              ? '1 Month'
                              : `${num} Months`
                            : `${num}`;
                          const percent = ((num - 1) / 3) * 100;

                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setSelectedDuration(num)}
                              style={{ left: `${percent}%` }}
                              className={`absolute top-0 -translate-x-1/2 cursor-pointer transition-all duration-200 whitespace-nowrap text-xs ${
                                isSelected
                                  ? 'text-white font-bold'
                                  : 'text-indigo-200/80 hover:text-white font-medium'
                              }`}
                            >
                              {labelText}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-indigo-100 mt-6 leading-relaxed">
                    Once the trial period has ended, the offer will automatically renew to a subscription. Remember that you
                    can cancel the subscription whenever you want.
                  </p>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsLoginOpen(true)}
                    className="blob-btn blob-btn--white cursor-pointer w-full h-[52px] rounded-2xl border-2 border-white bg-transparent text-white font-bold text-sm shadow-sm transition-all duration-200 flex items-center justify-center select-none"
                  >
                    <span className="blob-btn__inner" aria-hidden="true">
                      <span className="blob-btn__blobs">
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                      </span>
                    </span>
                    <span className="relative z-10">
                      Subscribe Now
                    </span>
                  </button>
                </div>
              </div>

              {/* Below space of both second and third cards: Disclaimer Text (Desktop lg+) */}
              <div className="hidden lg:block lg:col-span-2 lg:col-start-2 pt-2 px-1">
                <p className="text-xs text-slate-500 text-left leading-relaxed">
                  *Subscription duration and pricing may vary depending on your country and current promotions.
                </p>
              </div>
            </div>

            {/* Mobile & Tablet (< lg) fallback for disclaimer text */}
            <p className="lg:hidden text-xs text-slate-500 mt-6 text-center leading-relaxed">
              *Subscription duration and pricing may vary depending on your country and current promotions.
            </p>
          </div>
        </section>

        {/* 4. "How Does It Work?" Section (Alternating Shade: Light Gray / #F9FAFB) */}
        <section className="w-full bg-[#F9FAFB] py-14 sm:py-20 lg:py-28 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-bold text-[#111827] tracking-tight leading-tight">
              How Does It Work?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg font-normal text-[#4B5563] mt-3 sm:mt-4 max-w-2xl mx-auto mb-10 sm:mb-14 leading-relaxed">
              Everything you need to discover, qualify, and reach out to local business prospects in minutes.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left max-w-2xl lg:max-w-none mx-auto">
              {/* Step 1 */}
              <div className="group rounded-3xl bg-white p-6 sm:p-8 border border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(79,70,229,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                      <SearchOutlined />
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-400 select-none">
                      1
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">
                    Target Any City &amp; Niche
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Specify any location and business category — from dentists in Dallas to roofers in Miami. FindB queries global commercial directories to index all active local companies.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group rounded-3xl bg-white p-6 sm:p-8 border border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(124,58,237,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 text-[#7C3AED] flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                      <SafetyCertificateOutlined />
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-400 select-none">
                      2
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">
                    Website &amp; Contact Audit
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    FindB automatically identifies high-value businesses that lack a modern website, and safely scrapes public pages to uncover verified emails, phone numbers, and social profiles.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group rounded-3xl bg-white p-6 sm:p-8 border border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(2,132,199,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-[#0284C7] flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                      <SendOutlined />
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-400 select-none">
                      3
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">
                    Export &amp; Close Deals
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Filter prospects by website status, email availability, and phone number. Download formula-safe CSVs or sync straight into your outbound sales campaigns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. "Why choose FindB?" Section (Pure White Background) */}
        <section className="w-full bg-white py-14 sm:py-20 lg:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-bold text-[#111827] tracking-tight leading-tight">
              Why choose FindB?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg font-normal text-[#4B5563] mt-3 sm:mt-4 max-w-2xl mx-auto leading-relaxed">
              The all-in-one sales intelligence platform for digital agencies, marketers, and B2B closers
            </p>

            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-left px-2 sm:px-0">
              {/* Feature 1 */}
              <div className="flex flex-col group">
                <div className="w-14 h-14 rounded-2xl rotate-45 bg-gradient-to-br from-indigo-50 to-indigo-100/90 text-[#4F46E5] border border-indigo-200/60 flex items-center justify-center shadow-xs mb-8 ml-2 group-hover:rotate-[50deg] transition-transform duration-300">
                  <div className="-rotate-45 text-2xl flex items-center justify-center group-hover:-rotate-[50deg] transition-transform duration-300">
                    <SafetyCertificateOutlined />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-3">
                  Businesses Without Websites
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  The highest-converting sales leads are businesses with no online presence. FindB filters companies missing a website so web developers and agencies can pitch high-ticket design services.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col group">
                <div className="w-14 h-14 rounded-2xl rotate-45 bg-gradient-to-br from-emerald-50 to-teal-100/90 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-xs mb-8 ml-2 group-hover:rotate-[50deg] transition-transform duration-300">
                  <div className="-rotate-45 text-2xl flex items-center justify-center group-hover:-rotate-[50deg] transition-transform duration-300">
                    <ThunderboltOutlined />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-3">
                  Deep Web &amp; Email Scraping
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  Our resilient background scraper visits business websites with strict SSRF defenses, extracting verified decision-maker emails, phone numbers, and social links with zero manual effort.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col group">
                <div className="w-14 h-14 rounded-2xl rotate-45 bg-gradient-to-br from-amber-50 to-orange-100/90 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-xs mb-8 ml-2 group-hover:rotate-[50deg] transition-transform duration-300">
                  <div className="-rotate-45 text-2xl flex items-center justify-center group-hover:-rotate-[50deg] transition-transform duration-300">
                    <GlobalOutlined />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-3">
                  Worldwide Geo Coverage
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  Scan local businesses across 190+ countries and thousands of cities. Whether local or international prospecting, FindB delivers fresh place data and category tagging.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col group">
                <div className="w-14 h-14 rounded-2xl rotate-45 bg-gradient-to-br from-purple-50 to-indigo-100/90 text-purple-600 border border-purple-200/60 flex items-center justify-center shadow-xs mb-8 ml-2 group-hover:rotate-[50deg] transition-transform duration-300">
                  <div className="-rotate-45 text-2xl flex items-center justify-center group-hover:-rotate-[50deg] transition-transform duration-300">
                    <CheckOutlined />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-3">
                  Formula-Safe CSV Export
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  Export clean lead lists with UTF-8 BOM encoding and spreadsheet injection protection. Ready to import instantly into Lemlist, Instantly, Apollo, or HubSpot.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="blob-btn blob-btn--indigo cursor-pointer inline-flex items-center justify-center py-3 px-8 rounded-xl border-[1.5px] border-[#4F46E5] bg-transparent text-[#4F46E5] font-bold text-sm shadow-xs select-none"
              >
                <span className="blob-btn__inner" aria-hidden="true">
                  <span className="blob-btn__blobs">
                    <span className="blob-btn__blob"></span>
                    <span className="blob-btn__blob"></span>
                    <span className="blob-btn__blob"></span>
                    <span className="blob-btn__blob"></span>
                  </span>
                </span>
                <span className="relative z-10">
                  Start Finding Leads
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* 6. Frequently Asked Questions Section (Alternating Shade: Light Gray / #F9FAFB) */}
        <section className="w-full bg-[#F9FAFB] py-14 sm:py-20 lg:py-28 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-bold text-[#111827] tracking-tight leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base lg:text-lg font-normal text-[#4B5563] mt-3 sm:mt-4 max-w-2xl mx-auto leading-relaxed">
              Here you can find all the answers to the questions we are most often asked about our lead discovery platform, FindB.
            </p>

            {/* 3 Tab Pills */}
            <div className="mt-8 flex justify-center w-full px-2">
              <div className="inline-flex max-w-full overflow-x-auto p-1 sm:p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveFaqTab('about')}
                  className={`cursor-pointer px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeFaqTab === 'about'
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  <span className="sm:hidden">About</span>
                  <span className="hidden sm:inline">About FindB</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFaqTab('billing')}
                  className={`cursor-pointer px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeFaqTab === 'billing'
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  <span className="sm:hidden">Billing</span>
                  <span className="hidden sm:inline">Payments &amp; Billing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFaqTab('account')}
                  className={`cursor-pointer px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeFaqTab === 'account'
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  <span className="sm:hidden">Account</span>
                  <span className="hidden sm:inline">My Account</span>
                </button>
              </div>
            </div>

            {/* Accordion Rows */}
            <div className="mt-8 space-y-3 text-left">
              {faqData[activeFaqTab].map((item, idx) => {
                const key = `${activeFaqTab}-${idx}`;
                const isOpen = !!openFaq[key];
                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden transition-all hover:border-indigo-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(key)}
                      className="cursor-pointer w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-slate-800 hover:text-[#4F46E5] transition-colors"
                    >
                      <span>{item.q}</span>
                      <span className="text-[#4F46E5] text-lg font-bold">
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
        </section>
      </main>

      {/* 7. Footer */}
      <MarketingFooter onOpenLogin={() => setIsLoginOpen(true)} />

      {/* 8. Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}




