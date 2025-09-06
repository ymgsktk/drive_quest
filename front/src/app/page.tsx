'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Press_Start_2P } from 'next/font/google';

// タイトル用：Press Start 2P
const press = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press',
});

const LS_KEY = 'user';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_KEY) || '';
      if (v) setName(v);
    } catch (_) {}
    setHydrated(true);
  }, []);

  // 空文字でなければボタン押せるように
  const isValid = name.trim() !== '';

  const persistAnd = (next: () => void) => {
    try {
      localStorage.setItem(LS_KEY, name.trim());
    } catch (_) {}
    next();
  };

  const handleStart = () => {
    if (!isValid) return;
    persistAnd(() => router.push('/drive-quest'));
  };

  const goRecords = () => {
    if (!isValid) return;
    persistAnd(() => router.push('/records'));
  };

  return (
    <main className="dq-container" style={{ minHeight: '72vh', display: 'grid', placeItems: 'center' }}>
      <div
        style={{
          width: 'min(760px, 92vw)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <h1 className="dq-title">〜ドライブクエスト〜</h1>
        <div className="dq-title-sub">DRIVE QUEST</div>

        <label className="dq-sub" htmlFor="username" style={{ display: 'block', marginTop: 24 }}>
          ユーザー名
        </label>

        <input
          id="username"
          className="dq-input"
          placeholder="ユーザー名を入力"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="dq-btn"
            onClick={handleStart}
            disabled={!isValid}
            style={{ opacity: isValid ? 1 : 0.6, pointerEvents: isValid ? 'auto' : 'none', minWidth: 220 }}
          >
            冒険を開始する
          </button>

          <button
            className="dq-btn"
            onClick={goRecords}
            disabled={!isValid}
            style={{ opacity: isValid ? 1 : 0.6, pointerEvents: isValid ? 'auto' : 'none', minWidth: 220 }}
          >
            記録ページへ
          </button>
        </div>
      </div>
    </main>
  );
}