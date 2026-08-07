/**
 * Shape of a record returned by `GET /businesses`.
 *
 * The backend currently serialises: id, name, phone, email, website, city, status.
 * `category` and `address` exist on the SQLAlchemy model but are not part of the
 * JSON payload yet — they are typed as optional so the UI renders them the moment
 * the API starts sending them, without any frontend change.
 */
export interface Business {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  city?: string | null;
  status?: string | null;
  category?: string | null;
  address?: string | null;
}

/** Derived, client-side website state used for badges and filtering. */
export type WebsiteState = "has-website" | "no-website";

export interface BusinessStats {
  total: number;
  noWebsite: number;
  hasWebsite: number;
  emails: number;
  phones: number;
  todayScan: number;
}

export interface BusinessFilters {
  city?: string;
  category?: string;
  status?: string;
  search: string;
}

export interface ScanRequest {
  city: string;
  category: string;
}

/** Body returned by POST /scan. */
export interface ScanResponse {
  success: boolean;
  message: string;
}
