import { Metadata } from 'next';

export const metadata = {
  title: 'Admin Login - Color Palette Generator',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  }
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
