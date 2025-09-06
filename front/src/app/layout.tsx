// front/src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { DotGothic16 } from 'next/font/google';

// 本文用：ドットゴシック
const dot = DotGothic16({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dot',
});

export const metadata: Metadata = {
  title: 'ドライブクエスト',
  description: 'RPG風UIデモ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      {/* 本文フォントを body に適用 */}
      <body className={dot.className}>{children}</body>
    </html>
  );
}