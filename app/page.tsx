import LandingPage from '@/components/marketing/LandingPage';

export const metadata = {
  title: 'FindB - Fast Local Business Lead Generation Platform',
  description: 'Instantly find, verify, and convert local business leads with direct phone numbers, emails, and website audits.',
};

export default function HomePage() {
  return <LandingPage initialLoginOpen={false} />;
}
