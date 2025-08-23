import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./auth/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Color Studio - Professional Color Palette & Gradient Generator",
    template: "%s | Color Studio"
  },
  description: "Create stunning color palettes, gradients, and text effects with our professional color tools. Generate CSS, export images, and explore thousands of beautiful gradients.",
  keywords: ["color palette", "gradient generator", "color tools", "CSS gradients", "web design", "color picker"],
  authors: [{ name: "Color Studio" }],
  creator: "Color Studio",
  publisher: "Color Studio",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Color Studio - Professional Color Tools",
    description: "Create stunning color palettes, gradients, and text effects with our professional color tools.",
    siteName: "Color Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Studio - Professional Color Tools",
    description: "Create stunning color palettes, gradients, and text effects with our professional color tools.",
    creator: "@colorstudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider>
          <AuthProvider>
            <Header />
            {children}
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                className: '',
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
