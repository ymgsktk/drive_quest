'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Press_Start_2P } from 'next/font/google';

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
  const [loading, setLoading] = useState(false); // 確定ボタンの送信中判定

  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_KEY) || '';
      if (v) setName(v);
    } catch (_) {}
    setHydrated(true);
  }, []);

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

  const confirmUsername = async () => {
  if (!isValid) return;
  setLoading(true);
  try {
    // 入力中の name を使う
    const username = name.trim();
    if (!username) throw new Error('ユーザー名が入力されていません');

    // バックエンドに POST
    const res = await fetch(`http://localhost:3050/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username }), // body に JSON で送る
    });

    if (!res.ok) {
      throw new Error(`サーバーエラー: ${res.status}`);
    }

    alert('ユーザー名を確定しました！');
  } catch (err) {
    console.error(err);
    alert('確定に失敗しました');
  } finally {
    setLoading(false);
  }
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

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <input
            id="username"
            className="dq-input"
            placeholder="ユーザー名を入力"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="dq-btn"
            onClick={confirmUsername}
            disabled={!isValid || loading}
            style={{ opacity: isValid ? 1 : 0.6, pointerEvents: isValid ? 'auto' : 'none', minWidth: 100 }}
          >
            {loading ? '送信中...' : '確定'}
          </button>
        </div>

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
