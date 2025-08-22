"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const linkClass = (path) =>
    `px-3 py-1 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${pathname === path ? 'bg-accent text-accent-foreground' : ''}`;

  const mobileLinkClass = (path) =>
    `block px-4 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors ${pathname === path ? 'bg-accent text-accent-foreground' : ''}`;

  const navLinks = [
    { href: "/palette", label: "Palette" },
    { href: "/gradient", label: "Gradient" },
    { href: "/gradient/explore", label: "Explore Gradients" },
    { href: "/text-gradient", label: "Text Gradient" },
    { href: "/shades", label: "Shades" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <>
      <header className="bg-background/80 backdrop-blur border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-lg font-semibold text-foreground">Color Studio</Link>
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
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="ml-2 p-2 hover:bg-accent hover:text-accent-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <MdLightMode className="h-5 w-5 text-yellow-500" />
                ) : (
                  <MdDarkMode className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </nav>

            {/* Mobile Menu Button and Theme Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 hover:bg-accent hover:text-accent-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <MdLightMode className="h-5 w-5 text-yellow-500" />
                ) : (
                  <MdDarkMode className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="p-2 hover:bg-accent hover:text-accent-foreground"
              >
                <Menu size={20} />
              </Button>
            </div>
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
          <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-card/95 backdrop-blur border-r border-border shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link 
                href="/" 
                className="text-lg font-semibold text-card-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Color Studio
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 hover:bg-accent hover:text-accent-foreground"
              >
                <X size={20} />
              </Button>
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
