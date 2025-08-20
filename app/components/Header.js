"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white/80 dark:bg-black/80 backdrop-blur border-b border-black/10 dark:border-white/10 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold">Color Studio</Link>
          </div>

          <nav className="flex items-center gap-2">
            <Link href="/palette" className="px-3 py-1 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5">Palette</Link>
            <Link href="/gradient" className="px-3 py-1 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5">Gradient</Link>
            <Link href="/text-gradient" className="px-3 py-1 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5">Text Gradient</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
