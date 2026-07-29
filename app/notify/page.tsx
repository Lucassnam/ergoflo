import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import NotifyForm from "@/components/NotifyForm";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Notify me",
  description: `Get an email the moment the next ${BRAND} product is ready to order.`,
};

const PRODUCT_LABELS: Record<string, string> = {
  "passive-panel": "the Passive Panel",
  "complete-backpack": "the Complete Backpack",
};

export default async function Notify({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  const productLabel = product ? PRODUCT_LABELS[product] : undefined;

  return (
    <section className="relative px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-md text-center">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
            Notify me
          </p>
          <h1 className="mt-4 headline text-[clamp(2rem,5vw,3rem)] text-black">
            Be first to know.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-neutral-600">
            {productLabel
              ? `Leave your email and we'll let you know the moment ${productLabel} is ready to order.`
              : "Leave your email and we'll let you know the moment it's ready to order."}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10">
            <NotifyForm product={product ?? null} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
