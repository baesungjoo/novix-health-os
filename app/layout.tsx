import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NOVIX Health OS | 3H 영도센터',
  description: '3H 영도센터 통합 운영관리 시스템',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
