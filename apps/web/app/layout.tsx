import './globals.css';
import { Space_Grotesk, Manrope } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const heading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

const body = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'SmartRealtorAgent',
  description: 'Multi-tenant RAG chatbot platform for real estate agents.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
