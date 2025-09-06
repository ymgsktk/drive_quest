'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  // 表示名は自由に入力できるが、実際に送るのは nttdata_001 に固定
  const forcedUsername = 'nttdata_001';

  useEffect(() => {
    // 既に保存済みなら反映（見た目は自由入力欄として表示してOK）
    const saved = localStorage.getItem('dq_username');
    if (saved) setInput(saved);
  }, []);

  useEffect(() => {
    setIsValid(input.trim().length > 0); // 入力があれば有効化
  }, [input]);

  const handleStart = () => {
    // ここで実際に保存するのは固定ユーザー名
    localStorage.setItem('dq_username', forcedUsername);
    router.push('/quest'); // クエスト選択へ
  };

  const handleRecords = () => {
    // ユーザー名が保存されていないときは入場不可
    const saved = localStorage.getItem('dq_username');
    if (!saved) {
      alert('先にユーザー名を決定してください。');
      return;
    }
    router.push('/records');
  };

  return (
    <main className="dq-container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ width: 720, maxWidth: '90%' }}>
        <h1 className="dq-title pixel" style={{ textAlign: 'center', marginBottom: 24 }}>
          ～ドライブクエスト～
        </h1>

        <label style={{ display: 'block', marginBottom: 8, opacity: .85 }}>ユーザー名</label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例: nttdata_001"
          className="dq-card"
          style={{
            width: '100%',
            height: 56,
            fontSize: 18,
            padding: '0 16px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(0,0,0,.25)',
            color: '#fff',
            outline: 'none',
            marginBottom: 24,
          }}
        />

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button
            className="dq-btn"
            onClick={handleStart}
            disabled={!isValid}
            style={{
              minWidth: 260,
              opacity: isValid ? 1 : .5,
              cursor: isValid ? 'pointer' : 'not-allowed'
            }}
          >
            冒険を開始する
          </button>

          <button
            className="dq-btn"
            onClick={handleRecords}
            style={{ minWidth: 260 }}
          >
            記録ページへ
          </button>
        </div>

        <p style={{ marginTop: 16, opacity: .85 }}>
          実際にサーバへ送るユーザー名は <b className="pixel">nttdata_001</b> に固定です。
        </p>
      </div>
    </main>
  );
}
