export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-6 border border-black/5 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-2">Color Shades</h3>
          <p className="text-foreground/70 text-sm mb-4">Manage color shade collections</p>
          <a href="/admin/shades" className="inline-flex px-4 py-2 rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm">
            Manage Shades
          </a>
        </div>
        
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-6 border border-black/5 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-2">Users</h3>
          <p className="text-foreground/70 text-sm mb-4">User management (Coming Soon)</p>
          <button disabled className="inline-flex px-4 py-2 rounded-md border border-black/10 dark:border-white/15 text-sm opacity-50 cursor-not-allowed">
            Coming Soon
          </button>
        </div>
        
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl p-6 border border-black/5 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-2">Settings</h3>
          <p className="text-foreground/70 text-sm mb-4">Site configuration (Coming Soon)</p>
          <button disabled className="inline-flex px-4 py-2 rounded-md border border-black/10 dark:border-white/15 text-sm opacity-50 cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}
