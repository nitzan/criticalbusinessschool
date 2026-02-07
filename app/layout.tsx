import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Critical Business Communication Platform',
  description: 'A platform for students and instructors to communicate, collaborate, and share knowledge',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
