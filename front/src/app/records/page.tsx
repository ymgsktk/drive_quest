"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RunStats {
  latest: {
    id: string;
    distanceKm: number;
    pointEarned: number;
    completedQuests: number;
  };
  totals: {
    distanceKm: number;
    pointEarned: number;
    completedQuests: number;
  };
}

export default function RecordsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<RunStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const username = localStorage.getItem("user");
        if (!username) {
          console.error("ユーザー情報が見つかりません");
          return;
        }

        const res = await fetch(`http://localhost:3050/api/runs/stats?username=${username}`);
        if (!res.ok) throw new Error("データ取得に失敗しました");

        const data: RunStats = await res.json();
        setStats(data);
        console.log("サーバーから帰ってきた値：",data)
      } catch (err) {
        console.error("エラー:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p>読み込み中...</p>;
  }

  return (
    <main className="dq-container">
      <h1 className="dq-title pixel" style={{ fontFamily: "var(--font-pixel)" }}>
        記録
      </h1>

      {/* 累計ポイント中央表示 */}
      <div className="dq-totalpoints">
        <span className="dq-title">累計獲得</span>
        <span className="dq-points pixel" style={{ fontFamily: "var(--font-pixel)" }}>
          {stats?.totals.pointEarned ?? 0}
        </span>
        <span className="pixel" style={{ fontSize: 20, lineHeight: "1", fontFamily: "var(--font-pixel)" }}>
          pt
        </span>
      </div>

      <div className="dq-stat">
        <div>
          <div className="label">今回距離</div>
          <div className="value">
            {stats?.latest?.distanceKm ?? 0} <span style={{ fontSize: 14 }}>km</span>
          </div>
        </div>
        <div>
          <div className="label">今回ポイント</div>
          <div className="value">
            {stats?.latest?.pointEarned ?? 0} <span style={{ fontSize: 14 }}>pt</span>
          </div>
        </div>
        <div>
          <div className="label">今回クエスト数</div>
          <div className="value">{stats?.latest?.completedQuests ?? 0}</div>
        </div>
        <div>
          <div className="label">累計距離</div>
          <div className="value">
            {stats?.totals.distanceKm ?? 0} <span style={{ fontSize: 14 }}>km</span>
          </div>
        </div>
        <div>
          <div className="label">累計ポイント</div>
          <div className="value">
            {stats?.totals.pointEarned ?? 0} <span style={{ fontSize: 14 }}>pt</span>
          </div>
        </div>
        <div>
          <div className="label">累計クエスト数</div>
          <div className="value">{stats?.totals.completedQuests ?? 0}</div>
        </div>
      </div>

      <h2 className="dq-sub pixel" style={{ fontFamily: "var(--font-pixel)" }}>
        これまでのルート
      </h2>

      {/* ルート履歴は別 API が必要かも？ */}
      <p>まだ履歴のリスト表示部分は未実装です。</p>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button className="dq-btn">テストデータを追加</button>
        <button className="dq-btn">記録をリセット</button>
        <button className="dq-btn" onClick={() => router.push("/")}>
          ホームへ戻る
        </button>
      </div>
    </main>
  );
}
