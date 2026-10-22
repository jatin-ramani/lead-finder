import DottedSpinner from "@/components/marketing/DottedSpinner";

/**
 * Route-level loading UI for the marketing site.
 * Displays a clean, centered dotted blue spinning loader.
 */
export default function Loading() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]"
      aria-busy="true"
      aria-live="polite"
    >
      <DottedSpinner size="lg" color="#2563EB" />
    </div>
  );
}
