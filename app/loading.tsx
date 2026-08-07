import PageSkeleton from "@/components/feedback/PageSkeleton";

/**
 * Route-level loading UI for the whole app.
 *
 * Wraps every segment in a Suspense boundary, so a navigation shows the page
 * frame immediately instead of blocking on the previous route. A Server
 * Component — it renders once and is replaced.
 */
export default function Loading() {
  return <PageSkeleton />;
}
