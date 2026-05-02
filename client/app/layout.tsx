import type { Metadata } from 'next';
import { AuthGuard } from './components/AuthGuard';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

// Using system font stacks as fallbacks to avoid build failures in restricted environments
const montserrat = { variable: '--font-montserrat' };
const geistMono = { variable: '--font-geist-mono' };

export const metadata: Metadata = {
  title: 'PDF RAG Chat',
  description: 'Chat with your PDF documents using Retrieval-Augmented Generation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${montserrat.variable} ${geistMono.variable} dark bg-background text-foreground antialiased`}
      >
        <AuthGuard>
          {children}
          <Toaster richColors position='top-center' />
        </AuthGuard>
      </body>
    </html>
  );
}
