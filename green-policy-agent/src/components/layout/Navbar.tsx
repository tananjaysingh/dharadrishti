"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { en: "Home", hi: "होम", href: "/" },
  { en: "Map Dashboard", hi: "मानचित्र डैशबोर्ड", href: "/dashboard" },
  { en: "Schemes", hi: "योजनाएं", href: "#schemes" },
  { en: "Reports", hi: "रिपोर्ट्स", href: "#reports" },
  { en: "Alerts", hi: "अलर्ट्स", href: "#alerts" },
  { en: "Contact", hi: "संपर्क", href: "#contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Indian Tricolor Stripe */}
      <div className="govt-stripe w-full" />

      {/* Top utility bar — like gov.in */}
      <div className="bg-[#1a237e] text-white text-xs">
        <div className="container mx-auto px-4 flex items-center justify-between h-8">
          <div className="flex items-center gap-4">
            <span className="hindi-text">भारत सरकार | Government of India</span>
            <span className="hidden sm:inline opacity-60">|</span>
            <span className="hidden sm:inline opacity-80">Ministry of Environment, Forest and Climate Change</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Skip to Content</button>
            <span className="opacity-40">|</span>
            <button className="hover:underline opacity-80 hover:opacity-100 transition-opacity font-semibold">A+</button>
            <button className="hover:underline opacity-80 hover:opacity-100 transition-opacity">A</button>
            <button className="hover:underline opacity-80 hover:opacity-100 transition-opacity text-[10px]">A-</button>
          </div>
        </div>
      </div>

      {/* Main header with logo */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          {/* Logo row */}
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-3">
              {/* Emblem-style icon */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9933] via-white to-[#138808] flex items-center justify-center shadow-md border border-gray-200">
                <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="#000080" strokeWidth="1.5" fill="none" />
                  <circle cx="20" cy="20" r="6" fill="#000080" />
                  {/* Spokes */}
                  {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((angle) => (
                    <line
                      key={angle}
                      x1="20"
                      y1="20"
                      x2={20 + 18 * Math.cos((angle * Math.PI) / 180)}
                      y2={20 + 18 * Math.sin((angle * Math.PI) / 180)}
                      stroke="#000080"
                      strokeWidth="0.5"
                      opacity="0.4"
                    />
                  ))}
                  {/* Inner leaf */}
                  <path d="M20 8 Q24 14 20 20 Q16 14 20 8Z" fill="#138808" opacity="0.8" />
                  <path d="M20 32 Q24 26 20 20 Q16 26 20 32Z" fill="#138808" opacity="0.6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#1a237e] leading-tight">
                  DharaDrishti
                </h1>
                <p className="text-sm font-semibold hindi-text text-[#FF9933] -mt-0.5">
                  धरादृष्टि
                </p>
                <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">
                  Smart Environmental Policy Mapping Platform
                </p>
              </div>
            </Link>

            {/* Desktop sign in / dashboard */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-[#1a237e] transition-colors px-3 py-2">
                Sign In / साइन इन
              </Link>
              <Link href="/dashboard" className="btn-govt-primary text-sm py-2 px-5 rounded-lg">
                Open Dashboard
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="bg-gradient-to-r from-[#138808] to-[#0E6B06] hidden md:block">
          <div className="container mx-auto px-4">
            <ul className="flex items-center gap-0">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.en}>
                    <Link
                      href={item.href}
                      className={`block px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/90 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {item.en}
                      <span className="hindi-text text-[10px] ml-1.5 opacity-75 font-normal">
                        {item.hi}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile navigation */}
        {mobileOpen && (
          <nav className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <ul className="divide-y divide-gray-100">
              {navItems.map((item) => (
                <li key={item.en}>
                  <Link
                    href={item.href}
                    className="block px-6 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#138808] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.en}
                    <span className="hindi-text text-xs ml-2 text-gray-400">{item.hi}</span>
                  </Link>
                </li>
              ))}
              <li className="p-4">
                <Link href="/dashboard" className="btn-govt-primary w-full text-center text-sm py-2.5 rounded-lg">
                  Open Dashboard / डैशबोर्ड खोलें
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
