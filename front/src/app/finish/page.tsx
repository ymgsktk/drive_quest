"use client";
import { useEffect, useMemo, useState } from "react";


// ---- Keys / Types ----
const KEYS = {
  nickname: "dq:nickname",
  totalPoints: "dq:totalPoints",
  sessionPoints: "dq:sessionPoints",
  completedQuests: "dq:completedQuests",
  totalDistanceKm: "dq:totalDistanceKm",
  currentDistanceKm: "dq:currentDistanceKm",
  currentQuestCount: "dq:currentQuestCount",
  lastRoute: "dq:lastRoute",
} as const;

type Place = { name: string; lat?: number; lng?: number };

// ---- Component ----
export default function FinishPage() {
  // 表示用 state（SSR回避のため useEffect で詰める）
  const [loaded, setLoaded] = useState(false);
  const [nickname, setNickname] = useState("ゲスト");
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedQuests, setCompletedQuests] = useState(0);
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const [lastRoute, setLastRoute] = useState<Place[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ls = window.localStorage;

    // デモデータ（初回のみ）
    if (!ls.getItem(KEYS.totalPoints)) {
      ls.setItem(KEYS.nickname, "ドライバーA");
      ls.setItem(KEYS.totalPoints, "180");
      ls.setItem(KEYS.completedQuests, "4");
      ls.setItem(KEYS.totalDistanceKm, "12.1");
      ls.setItem(
        KEYS.lastRoute,
        JSON.stringify([
          { name: "神社に行く" },
          { name: "カフェにいく" },
          { name: "駅の写真を撮る" },
          { name: "公園を見つける" },
        ] as Place[])
      );
    }

    setNickname(ls.getItem(KEYS.nickname) ?? "ゲスト");
    setTotalPoints(Number(ls.getItem(KEYS.totalPoints) ?? 0));
    setCompletedQuests(Number(ls.getItem(KEYS.completedQuests) ?? 0));
    setTotalDistanceKm(Number(ls.getItem(KEYS.totalDistanceKm) ?? 0));
    try {
      setLastRoute(JSON.parse(ls.getItem(KEYS.lastRoute) ?? "[]"));
    } catch {
      setLastRoute([]);
    }

    setLoaded(true);
  }, []);

  const summaryText = useMemo(
    () =>
      `冒険終了！\nプレイヤー: ${nickname}\n累計獲得Pt: ${totalPoints}pt\n完了したクエスト数: ${completedQuests}\n合計走行距離: ${totalDistanceKm.toFixed(
        1
      )}km`,
    [nickname, totalPoints, completedQuests, totalDistanceKm]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      alert("結果をコピーしました！");
    } catch {}
  };
  const toTitle = () => (window.location.href = "/");

  if (!loaded) return null;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#2f5d37",
        color: "#fff",
        fontFamily: '"DotGothic16", system-ui, sans-serif',
        fontSize: 13,
      }}
    >
      <div className="mx-auto max-w-md px-4 py-8">
        {/* ① 冒険終了（中央・大きめ） */}
        <h1
          className="font-bold text-center mb-6"
          style={{ fontSize: 40, letterSpacing: 2 }}
        >
          冒険終了
        </h1>

        {/* ② 累計獲得Pt（大） */}
        <div
          className="mb-6 p-6 text-center"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 18,
          }}
        >
          <p className="opacity-80" style={{ fontSize: 14 }}>
            累計獲得Pt
          </p>
          <p
            className="mt-2"
            style={{ fontSize: 56, fontFamily: '"Press Start 2P", monospace' }}
          >
            {totalPoints}pt
          </p>
          <div className="mt-3 flex justify-center gap-8 opacity-90">
            {/* ③ 完了したクエスト数 / ④ 合計走行距離 */}
            <div>
              <p>完了したクエスト数</p>
              <p className="mt-1" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                {completedQuests}
              </p>
            </div>
            <div>
              <p>走行距離</p>
              <p className="mt-1" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                {totalDistanceKm.toFixed(1)}km
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-3">
          </div>
        </div>

        {/* ⑤ 今回の冒険ルート（マップ） */}
        <section
          className="mb-6"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 18,
          }}
        >
          <h2 className="px-5 pt-4 pb-2 font-semibold">今回の冒険ルート</h2>
          <div
            className="mx-5 mb-5 h-44"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 18,
              background: "rgba(255,255,255,0.08)",
              display: "grid",
              placeItems: "center",
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
            }}
          >
            ここに地図を表示（Static Maps / Mapライブラリ）
          </div>
        </section>

        {/* ⑥ こなしたクエスト一覧（chips） */}
        <section
          className="mb-8 p-5"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 18,
          }}
        >
          <h2 className="font-semibold mb-3">こなしたクエスト一覧</h2>
          {lastRoute.length === 0 ? (
            <p className="opacity-80">記録がありません。</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {lastRoute.map((p, i) => (
                <span
                  key={`${p.name}-${i}`}
                  style={{
                    background: "linear-gradient(90deg,#4d6bff,#36b4ff)",
                    borderRadius: 18,
                    padding: "10px 14px",
                    color: "#fff",
                    display: "inline-block",
                  }}
                >
                  {p.name}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* フッター */}
        <div className="flex justify-center">
          <button
            onClick={toTitle}
            className="text-white"
            style={{
              background: "linear-gradient(90deg,#4d6bff,#36b4ff)",
              borderRadius: 18,
              padding: "14px 28px",
            }}
          >
            タイトルに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

