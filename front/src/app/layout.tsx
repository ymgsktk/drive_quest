// front/src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

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
      {/* フォントは globals.css で設定済み */}
      <body>{children}</body>
    </html>
  );
}
