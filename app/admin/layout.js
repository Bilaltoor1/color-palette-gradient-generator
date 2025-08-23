import AdminSidebar from './components/AdminSidebar';
import AdminAuthGuard from './components/AdminAuthGuard';

export const metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  }
};

export default function AdminLayout({ children }) {
  return (
    <AdminAuthGuard>
      <AdminSidebar>{children}</AdminSidebar>
    </AdminAuthGuard>
  );
}
