import Image from "next/image";
import Reveal from "@/components/Reveal";

/* ============================================================
   THE "WHO IT'S FOR" IMAGE.

   READ THIS BEFORE CHANGING THE CAPTION OR THE BADGE.

   Two facts about the supplied asset drive everything below, and both
   are easy to lose track of once the picture is just "the hero photo":

     1. IT IS AI-GENERATED. The source file was
        `Gemini_Generated_Image_3ewgor3ewgor3ewg.png`. The person in it
        does not exist. On a site that takes $49.99 from real people,
        presenting a synthetic person as a customer is a
        misrepresentation — the FTC treats fabricated endorsements and
        fabricated depictions of use as deceptive regardless of whether
        a testimonial is quoted alongside them.

     2. THE PRODUCT IS NOT IN IT. The pack in the image is an ordinary
        backpack with no ErgoFlo panel visible. So this image CANNOT be
        captioned "a student using ErgoFlo" — that would be a false
        statement about a product that has never been built, on the same
        page as a buy button.

   What the image can honestly do is show the SITUATION the product is
   for: a student, a loaded pack, a warm walk across campus. That is the
   framing used below, and it is the only framing this asset supports.

   Do not add: a name, a quote, a star rating, "verified buyer", or any
   wording implying the person owns, wears, or endorses the product. If
   a real photo of a real person with a real unit ever exists, replace
   the asset and rewrite this whole file — do not just swap the src and
   leave the disclosure in place, and do not leave the disclosure off.
   ============================================================ */
export default function StudentCarry() {
  return (
    <section className="relative bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <p className="font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
            Who it&rsquo;s for
          </p>
          <h2 className="mt-4 headline text-[clamp(1.9rem,4.2vw,3rem)] text-black">
            The walk across campus.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-neutral-600">
            Fifteen minutes between buildings with a laptop, a water bottle and
            three textbooks on your back. The pack sits flat against your shirt
            the whole way, and by the time you sit down your shirt is wet.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-neutral-600">
            A better strap or a lighter fabric doesn&rsquo;t touch that
            problem. Moving air through the gap does, which is why we are
            building a panel rather than another backpack.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="order-1 lg:order-2">
          <figure className="m-0">
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="/student-carry.webp"
                alt="A student walking across a campus courtyard wearing a loaded backpack, seen from the side"
                width={928}
                height={1152}
                sizes="(max-width: 1024px) 90vw, 520px"
                className="mx-auto h-auto w-full select-none"
              />
              {/* Same treatment as the concept image on ProductRender: a
                  badge for the glance, a sentence for the substance. A
                  viewer must not be able to mistake this for documentary
                  evidence that the product exists and is in use. */}
              <span className="absolute top-3 left-3 rounded-full border border-neutral-300 bg-white/90 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-neutral-600 uppercase backdrop-blur-sm">
                Illustration
              </span>
            </div>

            <figcaption className="mx-auto mt-6 max-w-md border-t border-neutral-200 pt-4 text-[13px] leading-relaxed text-neutral-500">
              <strong className="font-semibold text-neutral-700">
                AI-generated illustration.
              </strong>{" "}
              The person is not real and is not a customer. The pack shown is
              an ordinary backpack with no {""}
              ErgoFlo panel fitted to it, because no unit has been built yet.
              This image shows the situation the product is designed for, not
              the product in use.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
