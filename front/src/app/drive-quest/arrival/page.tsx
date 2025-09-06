"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type LatLng = { lat: number; lng: number };

const mapContainerStyle: React.CSSProperties = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
};

// localStorage に到着地点を保存
const saveArrivalPoint = (loc: LatLng) => {
  if (typeof window === "undefined") return;
  const history: LatLng[] = JSON.parse(localStorage.getItem("routeHistory") || "[]");
  history.push(loc);
  localStorage.setItem("routeHistory", JSON.stringify(history));
};

export default function AdventureScreen() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState<LatLng>({ lat: 35.0116, lng: 135.7681 }); // ← デフォルトは京都駅あたり

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);

  // --- localStorage からルート履歴を読み込んで center を更新 ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const history: LatLng[] = JSON.parse(localStorage.getItem("routeHistory") || "[]");
    if (history.length > 0) {
      setCenter(history[history.length - 1]); // 最後の座標を中心に
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !(window as any).google) return;
    const g = window.google as typeof google;

    if (!mapInstance.current) {
      mapInstance.current = new g.maps.Map(mapRef.current, { center, zoom: 14 });
    } else {
      mapInstance.current.setCenter(center); // center が変わったら地図を更新
    }

    const listener = mapInstance.current.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const loc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setSelectedLocation(loc);

      if (markerInstance.current) {
        markerInstance.current.setMap(null);
      }
      markerInstance.current = new g.maps.Marker({ position: loc, map: mapInstance.current });
    });

    return () => {
      if ((window as any).google) {
        g.maps.event.clearInstanceListeners(mapInstance.current!);
      }
      if (markerInstance.current) {
        markerInstance.current.setMap(null);
      }
      mapInstance.current = null;
    };
  }, [center]); // ← center に依存するように変更

  const handleComplete = () => {
    if (!loading) {
      setLoading(true);
      if (selectedLocation) {
        saveArrivalPoint(selectedLocation);
      }
      router.push("/drive-quest");
    }
  };

  return (
    <div className="dq-container bg-dq-green min-h-screen px-4 py-8 flex flex-col items-center">
      {/* タイトル */}
      <h1 className="dq-title text-center text-10xl sm:text-4xl mb-6">
        ~ドライブクエスト~
      </h1>
      <h2 className="text-black text-xl text-center font-semibold mb-6 font-misaki">
        到着地点を入力
      </h2>

      {/* Google Maps */}
      <div className="overflow-hidden rounded-md shadow-xl">
        <div ref={mapRef} style={mapContainerStyle}></div>
      </div>

      {/* ボタン群 */}
      <div className="dq-button-group flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
        <button
          onClick={handleComplete}
          disabled={loading}
          className={`dq-btn flex-1 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          冒険を進める
        </button>
        <button
          onClick={() => {
            if (!loading) {
              setLoading(true);
              alert("冒険を終了しました。");
              router.push("/finish");
            }
          }}
          disabled={loading}
          className={`dq-finishquest flex-1 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          冒険を終了する
        </button>
      </div>

    </div>
  );
}
