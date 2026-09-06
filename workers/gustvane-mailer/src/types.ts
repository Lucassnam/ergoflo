/* Shared shapes for the mailer. Kept in one file so the PostgREST select
   strings and the templates cannot disagree about column names. */

/** The terms a buyer actually bought under, frozen at order time onto
    preorders.terms_snapshot. Every field is nullable because rows written
    before the column existed have none -- see orderTerms() in
    templates/confirmation.ts for the fallback path. */
export interface TermsSnapshot {
  refund_policy?: string;
  not_a_company_notice?: string;
  ship_window_phrase?: string;
  seller_of_record?: string;
  product_name?: string;
}

/** Columns the templates read. Partial by intent: PostgREST returns
    whatever the select string asked for, and a strict type here would lie
    about rows fetched with a narrower select. */
export interface PreorderRow {
  id: string;
  order_number: string | null;
  email: string;
  shipping_name: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  amount_cents: number;
  currency: string;
  promised_ship_days: number;
  promised_ship_date: string | null;
  terms_snapshot: TermsSnapshot | null;
  status: string;
  created_at: string;
}

export type EmailKind =
  | "receipt"
  | "confirmation"
  | "update_30"
  | "update_60"
  | "update_90"
  | "address_check"
  | "shipped"
  | "delayed"
  | "cancelled_refunded";

export interface OutboxRow {
  id: string;
  order_id: string;
  kind: EmailKind;
  body_markdown: string | null;
  status: string;
  attempts: number;
  /** PostgREST embedded resource. Named for the FK target table. */
  preorders: PreorderRow | null;
}

/** What a template returns. `text` is not optional -- see the shell
    header for why every message ships both parts. */
export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}
