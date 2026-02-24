import type { ReactNode } from 'react';
import '../../globals.css';

export const metadata = { title: 'Smart Realtor Agent Chat' };

/** Minimal layout — no sidebar, no dashboard chrome. */
export default function WidgetLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: 'transparent', fontFamily: 'inherit' }}>
        {children}
      </body>
    </html>
  );
}
