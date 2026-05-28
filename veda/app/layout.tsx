import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Sidebar from '../Components/layout/Sidebar';
import Navbar from '../Components/layout/Navbar';
import MobileNav from '../Components/layout/MobileNav';
import { ToastProvider } from '../Components/ui/Toast';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'VedaAI - AI Assessment Creator',
  description: 'Create high-fidelity CBSE school assessments and exam sheets powered by Gemini AI.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="flex font-sans min-h-screen bg-slate-50 antialiased">
        <ToastProvider>
          {/* Sidebar — hidden on mobile/tablet, visible on lg+ */}
          <Sidebar />

          {/* Main Workspace Frame */}
          <main className="flex-1 flex flex-col min-h-screen overflow-y-auto relative">
            {/* Floating Rounded Navbar Header */}
            <Navbar />

            {/* Scrollable Children Body — bottom padding on mobile for the tab bar */}
            <div className="flex-1 pb-16 lg:pb-0">
              {children}
            </div>
          </main>

          {/* Mobile bottom tab navigation */}
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  );
}
