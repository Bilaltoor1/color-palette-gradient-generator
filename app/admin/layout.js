"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Home, Palette, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors ${
      pathname === path 
        ? 'bg-primary/10 text-primary' 
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`;

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/shades", label: "Color Shades", icon: Palette },
    { href: "/admin/gradients", label: "Gradients", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <h1 className="text-xl font-semibold text-card-foreground">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
          <div className="border-t border-border pt-4 mt-6">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
              <Home size={18} />
              Back to Site
            </Link>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-card border-b border-border px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {pathname.split('/').pop() || 'Dashboard'}
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="bg-background min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
