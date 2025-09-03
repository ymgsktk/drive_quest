// front/src/app/records/page.tsx
"use client";

import React, { useState } from "react";

export default function RecordsPage() {
  const [records] = useState<any[]>([]);

  return (
    <main className="dq-container">
      {/* ドット風タイトル */}
      <h1 className="dq-title pixel" style={{ fontFamily: "var(--font-pixel)" }}>記録</h1>

      {/* 累計獲得 + pt（ptは小さく） */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span className="dq-title">累計獲得</span>
        <span className="pixel" style={{ fontSize: 20, lineHeight: "1", fontFamily: "var(--font-pixel)" }}>pt</span>
      </div>

      {/* ステータス表示 */}
      <div className="dq-stat">
        <div>
          <div className="label">今回距離</div>
          <div className="value">0.0 <span style={{ fontSize: 14 }}>km</span></div>
        </div>
        <div>
          <div className="label">今回ポイント</div>
          <div className="value">0 <span style={{ fontSize: 14 }}>pt</span></div>
        </div>
        <div>
          <div className="label">今回クエスト数</div>
          <div className="value">0</div>
        </div>
        <div>
          <div className="label">累計距離</div>
          <div className="value">0.0 <span style={{ fontSize: 14 }}>km</span></div>
        </div>
        <div>
          <div className="label">累計ポイント</div>
          <div className="value">0 <span style={{ fontSize: 14 }}>pt</span></div>
        </div>
        <div>
          <div className="label">累計クエスト数</div>
          <div className="value">0</div>
        </div>
      </div>

      {/* これまでのルート（見出しも .pixel） */}
      <h2 className="dq-sub pixel" style={{ fontFamily: "var(--font-pixel)" }}>これまでのルート</h2>

      {records.length === 0 ? (
        <p>まだ記録がありません。</p>
      ) : (
        <ul className="dq-list">
          {records.map((r, idx) => (
            <li key={idx} className="dq-row dq-card">
              <span>{r.distance} km</span>
              <span>{r.points} pt</span>
              <span>{r.quests} クエスト</span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button className="dq-btn">テストデータを追加</button>
        <button className="dq-btn">記録をリセット</button>
        <button className="dq-btn">ホームへ戻る</button>
      </div>
    </main>
  );
}