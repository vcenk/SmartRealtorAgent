import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Smart Realtor Agent - AI Chatbot for Real Estate Agents',
  description: 'Deploy an embeddable AI chatbot for your real estate website. Citation-backed responses, automatic lead qualification, and tenant-isolated architecture.',
  keywords: 'real estate ai chatbot, ai assistant for realtors, lead generation chatbot, embeddable chatbot',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
