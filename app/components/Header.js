"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linkClass = (path) =>
    `px-3 py-1 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${pathname === path ? 'bg-black/5 dark:bg-white/5' : ''}`;

  const mobileLinkClass = (path) =>
    `block px-4 py-3 text-base font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${pathname === path ? 'bg-black/5 dark:bg-white/5' : ''}`;

  const navLinks = [
    { href: "/palette", label: "Palette" },
    { href: "/gradient", label: "Gradient" },
    { href: "/text-gradient", label: "Text Gradient" },
    { href: "/shades", label: "Shades" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <>
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur border-b border-black/10 dark:border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-lg font-semibold">Color Studio</Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={linkClass(link.href)} 
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-black/95 backdrop-blur border-r border-black/10 dark:border-white/10 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
              <Link 
                href="/" 
                className="text-lg font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Color Studio
              </Link>
              <button
                className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={mobileLinkClass(link.href)}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={pathname === link.href ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
