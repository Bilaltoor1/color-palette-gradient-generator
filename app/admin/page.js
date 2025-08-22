export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-foreground">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card/80 backdrop-blur rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-2 text-card-foreground">Color Shades</h3>
          <p className="text-muted-foreground text-sm mb-4">Manage color shade collections</p>
          <a href="/admin/shades" className="inline-flex px-4 py-2 rounded-md border border-border hover:bg-accent hover:text-accent-foreground text-sm">
            Manage Shades
          </a>
        </div>
        
        <div className="bg-card/80 backdrop-blur rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-2 text-card-foreground">Users</h3>
          <p className="text-muted-foreground text-sm mb-4">User management (Coming Soon)</p>
          <button disabled className="inline-flex px-4 py-2 rounded-md border border-border text-sm opacity-50 cursor-not-allowed">
            Coming Soon
          </button>
        </div>
        
        <div className="bg-card/80 backdrop-blur rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-2 text-card-foreground">Settings</h3>
          <p className="text-muted-foreground text-sm mb-4">Site configuration (Coming Soon)</p>
          <button disabled className="inline-flex px-4 py-2 rounded-md border border-border text-sm opacity-50 cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}
