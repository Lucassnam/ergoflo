"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND, NAV } from "@/lib/site";
import WaitlistButton from "./WaitlistButton";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page while the mobile sheet is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen
          ? "bg-white/80 backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent"
      }`}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-neutral-200 transition-opacity duration-300"
        style={{ opacity: scrolled || menuOpen ? 1 : 0 }}
      />

      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="headline text-[19px] tracking-tight text-black"
        >
          {BRAND}
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[13.5px] text-neutral-600 transition-colors hover:text-black"
            >
              {n.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <WaitlistButton size="sm" className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-black lg:hidden"
          >
            <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
              <path
                d={menuOpen ? "M2 2 L14 10 M14 2 L2 10" : "M1 2h14M1 6h14M1 10h14"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="bg-white/95 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1 px-5 pt-2 pb-6 sm:px-8">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-[15px] text-neutral-600 transition-colors hover:text-black"
              >
                {n.label}
              </Link>
            ))}
            <WaitlistButton size="md" className="mt-3 w-full sm:hidden" />
          </div>
        </div>
      )}
    </header>
  );
}
