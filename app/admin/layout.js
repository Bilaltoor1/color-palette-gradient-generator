"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (path) =>
    `block px-3 py-2 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${pathname === path ? 'bg-black/5 dark:bg-white/5' : ''}`;

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/shades", label: "Color Shades" },
    { href: "/admin/users", label: "Users (Coming Soon)", disabled: true },
    { href: "/admin/settings", label: "Settings (Coming Soon)", disabled: true },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white/80 dark:bg-black/80 backdrop-blur border-r border-black/10 dark:border-white/10">
        <div className="p-6 w-full">
          <h1 className="text-xl font-semibold mb-6">Admin Dashboard</h1>
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`${linkClass(link.href)} ${link.disabled ? 'text-foreground/50' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/80 dark:bg-black/80 backdrop-blur border-b border-black/10 dark:border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <button
              className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-black/95 backdrop-blur border-r border-black/10 dark:border-white/10 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <button
                className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                onClick={() => setSidebarOpen(false)}
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
                    className={`${linkClass(link.href)} ${link.disabled ? 'text-foreground/50' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
