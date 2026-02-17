import type { Metadata } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { WhatsappButton } from '@/components/whatsapp-button';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'AurumLuz Digital - Alta Joyería en Montevideo',
  description: 'Descubra joyas que capturan los momentos efímeros de la luz. Diseñadas para la musa moderna.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          manrope.variable,
          playfair.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
        <WhatsappButton />
        <Toaster />
      </body>
    </html>
  );
}
