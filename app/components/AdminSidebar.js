import Link from 'next/link'
import React from 'react'

const AdminSidebar = () => {
  return (
    <>
      {/* Sidebar */}
      <div className="w-64 bg-white/80 dark:bg-black/80 backdrop-blur border-r border-black/10 dark:border-white/10">
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-6">Admin Dashboard</h1>
          <nav className="space-y-2">
            <Link href="/admin" className="block px-3 py-2 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5">
              Dashboard
            </Link>
            <Link href="/admin/shades" className="block px-3 py-2 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5">
              Color Shades
            </Link>
            <Link href="/admin/users" className="block px-3 py-2 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5 text-foreground/50">
              Users (Coming Soon)
            </Link>
            <Link href="/admin/settings" className="block px-3 py-2 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5 text-foreground/50">
              Settings (Coming Soon)
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar