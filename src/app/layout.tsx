import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/ui/NavBar';
import { Toaster } from '@/components/ui/sonner';
import Footer from './footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Geodle',
  description: 'Geography minigames',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <div className='p-5 min-h-screen mb-[-6rem]'>
          <div className='min-w-full flex justify-center mb-10'>
            <NavBar></NavBar>
          </div>
          <main className='mb-10'>{children}</main>
          <Toaster
            toastOptions={{
              style: { background: 'hsl(var(--accent-foreground))' },
            }}
          />
        </div>
        <Footer />
      </body>
    </html>
  );
}
