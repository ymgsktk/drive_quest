"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";



const KEYS = {
  routeHistory: "routeHistory",
  totalPoints: "totalPoints",
  quest: "quest",
} as const;

type LatLng = { lat: number; lng: number };
const center: LatLng = { lat: 35.0116, lng: 135.7681 };
type Quest = { id: number; title: string; points: number };

export default function FinishPage() {
  const [loaded, setLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false); // ← Google Maps script の読み込み完了フラグ
  const [totalPoints, setTotalPoints] = useState(0);
  const [routeHistory, setRouteHistory] = useState<LatLng[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const [distance, setDistance] = useState(0);
  const [sent, setSent] = useState(false);
  const [user, setUser] = useState("ゲスト");


  const sendResult = async () => {
    try {
      const res = await fetch("http://localhost:3050/api/adventure_records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adventure_result: {
            total_points: totalPoints,
            user: user,        
            distance: distance,
            quest_count: quests.length,
          },
        }),
      });

      if (!res.ok) throw new Error("サーバーエラー");
      const data = await res.json();
      console.log("サーバーからのレスポンス:", data);
    } catch (err) {
      console.error("送信に失敗:", err);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ls = window.localStorage;

    // デモデータ
    if (!ls.getItem(KEYS.totalPoints)) {
      ls.setItem(KEYS.totalPoints, "180");
      ls.setItem("user", "ドライバーA"); 
      ls.setItem(
        KEYS.routeHistory,
        JSON.stringify([
          { lat: 35.0, lng: 135.0 },
          { lat: 35.05, lng: 135.1 },
          { lat: 35.1, lng: 135.15 },
        ])
      );
      ls.setItem(
        KEYS.quest,
        JSON.stringify([
          { id: 1, title: "神社に行く", point: 50 },
          { id: 2, title: "カフェに行く", point: 30 },
          { id: 3, title: "駅の写真を撮る", point: 40 },
        ])
      );
    }

    setTotalPoints(Number(ls.getItem(KEYS.totalPoints) ?? 0));

    try {
      setRouteHistory(JSON.parse(ls.getItem(KEYS.routeHistory) ?? "[]"));
    } catch {
      setRouteHistory([]);
    }

    try {
      setQuests(JSON.parse(ls.getItem(KEYS.quest) ?? "[]"));
    } catch {
      setQuests([]);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (routeHistory.length < 2) {
      setDistance(0);
      return;
    }
  
    const R = 6371; // 地球半径 (km)
    let total = 0;
  
    for (let i = 1; i < routeHistory.length; i++) {
      const prev = routeHistory[i - 1];
      const curr = routeHistory[i];
  
      const dLat = ((curr.lat - prev.lat) * Math.PI) / 180;
      const dLng = ((curr.lng - prev.lng) * Math.PI) / 180;
  
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prev.lat * Math.PI) / 180) *
          Math.cos((curr.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
  
    setDistance(total);
  }, [routeHistory]);

  // Google Map 初期化
  // Google Map 初期化
  useEffect(() => {
    if (!loaded || !mapRef.current || !(window as any).google) return;
  
    const g = window.google as typeof google;
    const map = new g.maps.Map(mapRef.current, {
      center: routeHistory[0] ?? center,
      zoom: 14,
    });
    const directions = new g.maps.DirectionsRenderer({ suppressMarkers: false });
    directions.setMap(map);
  
    if (routeHistory.length >= 2) {
      const origin = routeHistory[0];
      const destination = routeHistory[routeHistory.length - 1];
      const waypoints = routeHistory.slice(1, -1).map((loc) => ({ location: loc, stopover: true }));
  
      new g.maps.DirectionsService().route(
        { origin, destination, waypoints, travelMode: g.maps.TravelMode.DRIVING },
        (result, status) => {
          if (status === "OK" && result) directions.setDirections(result);
          else console.error("Directions request failed: ", status);
        }
      );
    } else if (routeHistory.length === 1) {
      new g.maps.Marker({ position: routeHistory[0], map });
    }
  }, [loaded, routeHistory]);
  


 

  useEffect(() => {
    if (loaded && totalPoints > 0 && !sent) {
      sendResult();
      setSent(true); // 1回だけ実行
    }
  }, [loaded, totalPoints, distance, quests, sent]);
  
  
  if (!loaded) return null;

  return (
    <>
      {/* Google Maps API script */}


      <div
        className="min-h-screen w-full"
        style={{ backgroundColor: "#2f5d37", color: "#fff" }}
      >
        <div className="mx-auto max-w-md px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-6">冒険終了</h1>

          {/* 累計ポイント */}
          <div className="text-center mb-6">
            <p className="opacity-80">累計獲得Pt</p>
            <p className="text-5xl font-mono">{totalPoints}pt</p>

            {/* Distance */}
            <p className="mt-3 opacity-80">移動距離</p>
            <p className="text-2xl font-mono">{distance.toFixed(2)} km</p>
          </div>


          {/* 今回の冒険ルート */}
          <section className="mb-6">
            <h2 className="font-semibold mb-2">今回の冒険ルート</h2>
            <div
              ref={mapRef}
              className="mx-auto mb-4"
              style={{ width: "100%", height: "500px", borderRadius: 12 }}
            />
          </section>

          {/* クエスト一覧 */}
          <section className="mb-8">
            <h2 className="font-semibold mb-2">こなしたクエスト一覧</h2>
            {quests.length === 0 ? (
              <p className="opacity-80">記録がありません。</p>
            ) : (
              <ul className="space-y-2">
                {quests.map((q) => (
                  <li
                    key={q.id}
                    style={{
                      background: "linear-gradient(90deg,#4d6bff,#36b4ff)",
                      borderRadius: 18,
                      padding: "10px 14px",
                    }}
                  >
                    {q.title} (+{q.points}pt)
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* フッター */}
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/quest")}
              style={{
                background: "linear-gradient(90deg,#4d6bff,#36b4ff)",
                borderRadius: 18,
                padding: "14px 28px",
                color: "#fff",
              }}
            >
              タイトルに戻る
            </button>
                      {/* データリセット（開発用） */}
                      {/*
            <button
              onClick={() => {
                const ls = window.localStorage;
                ls.setItem(KEYS.totalPoints, "180");
                ls.setItem("user", "ドライバーA"); 
                ls.setItem(
                  KEYS.routeHistory,
                  JSON.stringify([
                    { lat: 35.0, lng: 135.0 },
                    { lat: 35.05, lng: 135.1 },
                    { lat: 35.1, lng: 135.15 },
                  ])
                );
                ls.setItem(
                  KEYS.quest,
                  JSON.stringify([
                    { id: 1, title: "神社に行く", point: 50 },
                    { id: 2, title: "カフェに行く", point: 30 },
                    { id: 3, title: "駅の写真を撮る", point: 40 },
                  ])
                );
                alert("LocalStorageをリセットしました！");
                location.reload(); // ← 再読み込みで即反映
              }}
              style={{
                background: "linear-gradient(90deg,#ff4d4d,#ff944d)",
                borderRadius: 18,
                padding: "10px 20px",
                color: "#fff",
                fontSize: "14px",
              }}
            >
              データをリセット
            </button>
            */}
          </div>
        </div>
      </div>
    </>
  );
}
