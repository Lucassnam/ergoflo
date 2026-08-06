/* Sample data for previewing and test-sending templates.
   Lives in its own module with NO side effects, so importing it cannot
   run anything. preview.ts is a CLI that executes on load; importing the
   fixture from there once ran the whole CLI as a side effect and passed
   it an env-file path as its output directory. Keep data and entry
   points separate. */

import type { PreorderRow } from "./types";

/* Deliberately awkward: an apostrophe in the name to prove HTML
   escaping, and a null line2 to prove the blank-line filter. */
export const SAMPLE_ORDER: PreorderRow = {
  id: "3f2b9c10-8a4d-4f1e-9b77-1c2d3e4f5a6b",
  order_number: "EF-2608-K3M9NQ2T",
  email: "buyer@example.com",
  shipping_name: "Dana O'Brien",
  shipping_line1: "1180 Bayview Ave",
  shipping_line2: null,
  shipping_city: "Oakland",
  shipping_state: "CA",
  shipping_postal_code: "94607",
  shipping_country: "US",
  amount_cents: 4999,
  currency: "usd",
  promised_ship_days: 120,
  promised_ship_date: "2026-12-04",
  terms_snapshot: null,
  status: "paid",
  created_at: "2026-08-06T11:00:00Z",
};
