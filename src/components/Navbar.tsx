"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "VOX Wallet", href: "/wallet" },
  { label: "Creator", href: "/creator" },
  { label: "Business", href: "/business" },
  { label: "Safety", href: "/safety" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-vox-bg/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-vox-bg/50 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ---- Logo ---- */}
        <Link href="/" className="flex items-center gap-0 shrink-0">
          <span className="text-xl font-bold tracking-tight select-none">
            {/* V */}
            <span className="text-white">V</span>
            {/* O with orange circle / play accent */}
            <span className="relative inline-block">
              <span
                className="inline-flex items-center justify-center rounded-full"
                style={{
                  width: "1.1em",
                  height: "1.1em",
                  background:
                    "linear-gradient(135deg, #FF8A34 0%, #FF6A1A 100%)",
                  verticalAlign: "middle",
                  lineHeight: 0,
                  position: "relative",
                  top: "-0.05em",
                }}
              >
                {/* Play triangle */}
                <svg
                  width="0.45em"
                  height="0.5em"
                  viewBox="0 0 10 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginLeft: "0.08em" }}
                >
                  <path
                    d="M1 1.5V10.5C1 11.1667 1.6 11.5 2 11.5L9 6.5C9.66667 6 9.66667 5.5 9 5L2 0.5C1.5 0.166667 1 0.5 1 1.5Z"
                    fill="white"
                  />
                </svg>
              </span>
            </span>
            {/* X with gradient */}
            <span
              className="bg-clip-text text-transparent"
              style={{
                background: "linear-gradient(135deg, #FF2C91, #FF8A34)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              X
            </span>
            {/* el */}
            <span className="text-white">el</span>
          </span>
        </Link>

        {/* ---- Desktop Nav Links ---- */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="nav-link px-3 py-2 rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ---- Right Section ---- */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Language Selector */}
          <button
            type="button"
            className="flex items-center gap-1.5 text-vox-muted hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            <Globe className="h-4 w-4" />
            <span>EN</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>

          {/* CTA */}
          <Link
            href="/download"
            className="btn-gradient inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white whitespace-nowrap"
          >
            Download App
          </Link>
        </div>

        {/* ---- Mobile Hamburger ---- */}
        <button
          type="button"
          aria-label="Toggle menu"
          className="lg:hidden flex items-center justify-center h-10 w-10 rounded-lg text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* ---- Mobile Menu ---- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-vox-bg/95 backdrop-blur-2xl border-b border-white/10"
          >
            <div className="mx-auto max-w-7xl px-4 pb-6 pt-2 sm:px-6">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="nav-link block px-3 py-2.5 rounded-lg hover:bg-white/5"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
                {/* Language Selector */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-vox-muted hover:text-white transition-colors duration-200 text-sm font-medium px-3"
                >
                  <Globe className="h-4 w-4" />
                  <span>EN</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>

                {/* CTA */}
                <Link
                  href="/download"
                  onClick={() => setMobileOpen(false)}
                  className="btn-gradient flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Download App
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
