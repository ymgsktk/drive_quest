"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* ===== 型 ===== */
type Run = {
  id: string;
  distanceKm: number;
  pointsEarned: number;
  completedQuests: number;
};

type RunStats = {
  latest: Run | null;
  totals: {
    count?: number;
    distanceKm: number;
    pointsEarned: number;
    completedQuests: number;
  };
};

/* ===== localStorage 操作 ===== */
const LS_KEY = "routeHistory";

function readLocalRuns(): Run[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((r: any, i: number) => ({
      id: r.id ?? `run_${i + 1}`,
      distanceKm: Number(r.distanceKm ?? 0),
      pointsEarned: Number(r.pointsEarned ?? 0),
      completedQuests: Number(r.completedQuests ?? 0),
    })) as Run[];
  } catch {
    return [];
  }
}

function writeLocalRuns(runs: Run[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(runs));
}

function addTestRun() {
  const runs = readLocalRuns();
  const n = runs.length + 1;
  runs.push({
    id: `run_${n}`,
    distanceKm: 5.2,
    pointsEarned: 30,
    completedQuests: 3,
  });
  writeLocalRuns(runs);
}

function resetRuns() {
  writeLocalRuns([]);
}

/* ===== API（あれば使う）===== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

async function fetchRunStats(username: string): Promise<RunStats> {
  const base = API_BASE.replace(/\/$/, "");
  const url = `${base}/api/runs/stats?username=${encodeURIComponent(username)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`stats ${res.status}`);
  return res.json();
}

/* ===== UI パーツ ===== */
function Card({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="dq-card" style={{ padding: 20 }}>
      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
      <div className="value" style={{ fontSize: 36, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

/* ===== ページ本体 ===== */
export default function RecordsPage() {
  const router = useRouter();

  // 未ログイン（ホームでユーザー確定していない）を弾く
  useEffect(() => {
    const u = localStorage.getItem("dq_username");
    if (u !== "nttdata_001") {
      router.push("/");
    }
  }, [router]);

  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("dq_username") || "nttdata_001"
      : "nttdata_001";

  const [stats, setStats] = useState<RunStats | null>(null);
  const [loading, setLoading] = useState<boolean>(!!API_BASE);
  const [error, setError] = useState<string | null>(null);

  // データのロード（API→失敗時/未設定はローカル計算）
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (API_BASE) {
          setLoading(true);
          const s = await fetchRunStats(username);
          if (cancelled) return;

          // API が count を返さない時はローカル件数で補完
          if (s && (s.totals as any).count == null) {
            const runs = readLocalRuns();
            setStats({
              latest: s.latest,
              totals: {
                distanceKm: s.totals.distanceKm,
                pointsEarned: s.totals.pointsEarned,
                completedQuests: s.totals.completedQuests,
                count: runs.length,
              },
            });
          } else {
            setStats(s);
          }
        } else {
          const runs = readLocalRuns();
          const latest = runs.length ? runs[runs.length - 1] : null;
          const totals = runs.reduce(
            (a, r) => {
              a.distanceKm += r.distanceKm || 0;
              a.pointsEarned += r.pointsEarned || 0;
              a.completedQuests += r.completedQuests || 0;
              return a;
            },
            { distanceKm: 0, pointsEarned: 0, completedQuests: 0 }
          );
          setStats({ latest, totals: { ...totals, count: runs.length } });
        }
      } catch (e: any) {
        const runs = readLocalRuns();
        const latest = runs.length ? runs[runs.length - 1] : null;
        const totals = runs.reduce(
          (a, r) => {
            a.distanceKm += r.distanceKm || 0;
            a.pointsEarned += r.pointsEarned || 0;
            a.completedQuests += r.completedQuests || 0;
            return a;
          },
          { distanceKm: 0, pointsEarned: 0, completedQuests: 0 }
        );
        setStats({ latest, totals: { ...totals, count: runs.length } });
        setError(e?.message ?? "failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const latest = stats?.latest ?? null;
  const totals = stats?.totals ?? {
    distanceKm: 0,
    pointsEarned: 0,
    completedQuests: 0,
    count: 0,
  };

  const historyRuns = useMemo(() => {
    const runs = readLocalRuns();
    return runs.slice().reverse();
  }, [stats]);

  return (
    <div style={{ background: "var(--dq-green)", minHeight: "100vh" }}>
      <div className="dq-container" style={{ maxWidth: 1100 }}>
        <h1 className="dq-title">記録</h1>

        {/* 累計獲得Pt（大きく） */}
        <div className="dq-sub">累計獲得Pt</div>
        <div className="pixel" style={{ fontSize: 96, lineHeight: 1, marginBottom: 18 }}>
          {totals.pointsEarned ?? 0} <span style={{ fontSize: 48 }}>pt</span>
        </div>

        {/* 今回（最新） */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <Card label="今回距離" value={`${(latest?.distanceKm ?? 0).toFixed(1)} km`} />
          <Card label="今回ポイント" value={`${latest?.pointsEarned ?? 0} pt`} />
          <Card label="今回クエスト数" value={latest?.completedQuests ?? 0} />
        </div>

        {/* 累計（完了した冒険の回数=走行回数も表示） */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <Card label="累計距離" value={`${(totals.distanceKm ?? 0).toFixed(1)} km`} />
          <Card label="累計ポイント" value={`${totals.pointsEarned ?? 0} pt`} />
          <Card label="累計クエスト数" value={totals.completedQuests ?? 0} />
          <Card label="完了した冒険の回数" value={totals.count ?? 0} />
        </div>

        <h2 className="dq-title" style={{ fontSize: 36, marginTop: 8 }}>
          これまでのルート
        </h2>

        {/* 履歴 */}
        <ul className="dq-list" style={{ marginTop: 12 }}>
          {loading && <li className="dq-meta">読み込み中…</li>}
          {error && (
            <li className="dq-meta" style={{ color: "#f88" }}>
              {error}（ローカルにフォールバック）
            </li>
          )}
          {historyRuns.length === 0 ? (
            <li className="dq-meta">まだ記録がありません。</li>
          ) : (
            historyRuns.map((r) => (
              <li key={r.id} className="dq-card" style={{ padding: 14 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span className="dq-badge">{r.distanceKm.toFixed(1)} km</span>
                  <span className="dq-badge">{r.pointsEarned} pt</span>
                  <span className="dq-badge">{r.completedQuests} quest</span>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* テスト用ボタン */}
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          <button
            className="dq-btn"
            onClick={() => {
              addTestRun();
              const runs = readLocalRuns();
              const latest = runs.length ? runs[runs.length - 1] : null;
              const t = runs.reduce(
                (a, r) => {
                  a.distanceKm += r.distanceKm || 0;
                  a.pointsEarned += r.pointsEarned || 0;
                  a.completedQuests += r.completedQuests || 0;
                  return a;
                },
                { distanceKm: 0, pointsEarned: 0, completedQuests: 0 }
              );
              setStats({ latest, totals: { ...t, count: runs.length } });
            }}
          >
            テストデータを追加
          </button>

          <button
            className="dq-btn"
            onClick={() => {
              resetRuns();
              setStats({
                latest: null,
                totals: { distanceKm: 0, pointsEarned: 0, completedQuests: 0, count: 0 },
              });
            }}
          >
            記録をリセット
          </button>
        </div>
      </div>
    </div>
  );
}