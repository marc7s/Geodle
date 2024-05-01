import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/ui/NavBar';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Geodl',
  description: 'Geography minigames',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`p-5 ${inter.className}`}>
        <div className='min-w-full flex justify-center mb-10'>
          <NavBar></NavBar>
        </div>
        <main>{children}</main>
        <Toaster
          toastOptions={{
            style: { background: 'hsl(var(--accent-foreground))' },
          }}
        />
      </body>
    </html>
  );
}
