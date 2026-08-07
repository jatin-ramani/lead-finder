"use client";

import { Alert } from "antd";

import BusinessWorkspace from "@/components/BusinessWorkspace";
import { formatNumber, hasWebsite, isPresent } from "@/lib/format";
import { useBusinesses } from "@/providers/BusinessProvider";
import type { Business } from "@/types/business";

/**
 * A lead is a business with no website that can still be contacted — those are
 * the ones worth pitching. Derived client-side; no extra endpoint required.
 */
function isLead(business: Business): boolean {
  return (
    !hasWebsite(business) &&
    (isPresent(business.phone) || isPresent(business.email))
  );
}

export default function LeadsPage() {
  const { businesses, loading } = useBusinesses();

  const unreachable = businesses.filter(
    (business) => !hasWebsite(business) && !isLead(business),
  ).length;

  return (
    <div className="flex flex-col gap-4">
      {!loading && unreachable > 0 && (
        <Alert
          type="info"
          showIcon
          message={`${formatNumber(unreachable)} more businesses have no website but no contact details either — they are hidden from this view.`}
        />
      )}

      {/* `isLead` is module-level, so the reference stays stable. */}
      <BusinessWorkspace baseFilter={isLead} />
    </div>
  );
}
