"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Quest = { id: number; title: string; points: number };
type TouristSpot = { id: number; name: string; description: string; url: string; image: string };
type LatLng = { lat: number; lng: number };

const mapContainerStyle: React.CSSProperties = { width: "100%", height: "400px", borderRadius: "12px" };
const center: LatLng = { lat: 35.0116, lng: 135.7681 };

// --- モックAPI関数 ---
const fetchTotalPoints = async (): Promise<number> => new Promise((resolve) => setTimeout(() => resolve(130), 500));
const fetchQuests = async (): Promise<Quest[]> => new Promise((resolve) => setTimeout(() => resolve([{ id: 1, title: "2km進む", points: 30 }, { id: 2, title: "神社に行く", points: 50 }]), 500));
const fetchTouristSpots = async (): Promise<TouristSpot[]> => new Promise((resolve) => setTimeout(() => resolve([{ id: 1, name: "〇〇喫茶店", description: "〇〇が有名な喫茶店。〜〜", url: "#", image: "https://placehold.co/100x100/A0AEC0/ffffff?text=Image" }, { id: 2, name: "〇〇神社", description: "〇〇が司る神社。〜〜", url: "#", image: "https://placehold.co/100x100/A0AEC0/ffffff?text=Image" }]), 500));

export default function QuestSelectionScreen() {
  const router = useRouter();
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);

  // データ取得 (モックAPI)
  useEffect(() => {
    const loadData = async () => {
      // localStorageから累計ポイントを取得
      const savedPoints = localStorage.getItem("totalPoints");
      if (savedPoints) {
        setTotalPoints(Number(savedPoints));
      } else {
        const points = await fetchTotalPoints();
        setTotalPoints(points);
      }
  
      const [questList, spotList] = await Promise.all([fetchQuests(), fetchTouristSpots()]);
      setQuests(questList);
      setSpots(spotList);
    };
    loadData();
  }, []);

  // Google Maps 初期化＆Route描画
  useEffect(() => {
    if (!mapRef.current || mapInstance.current || !(window as any).google) return;
    const g = window.google as typeof google;
    mapInstance.current = new g.maps.Map(mapRef.current, { center, zoom: 14 });
    directionsRenderer.current = new g.maps.DirectionsRenderer({ suppressMarkers: false });
    directionsRenderer.current.setMap(mapInstance.current);

    // localStorageから過去ルートを取得
    const history: LatLng[] = JSON.parse(localStorage.getItem("routeHistory") || "[]");
    if (history.length >= 2) {
      const origin = history[0];
      const destination = history[history.length - 1];
      const waypoints = history.slice(1, -1).map((loc) => ({ location: loc, stopover: true }));

      new g.maps.DirectionsService().route(
        { origin, destination, waypoints, travelMode: g.maps.TravelMode.DRIVING },
        (result, status) => {
          if (status === "OK" && result) directionsRenderer.current?.setDirections(result);
          else console.error("Directions request failed: ", status);
        }
      );
    }
  }, [mapRef.current]);

  const handleQuestSelect = (quest: Quest) => {
    if (loading) return;
    setLoading(true);
    setTotalPoints((prev) => {
      const newPoints = prev !== null ? prev + quest.points : quest.points;
      // localStorage に保存
      localStorage.setItem("totalPoints", newPoints.toString());
      return newPoints;
    });
    // Arrival ページに遷移
    router.push("/drive-quest/arrival");
  };

  return (
    <div
      className="mx-auto max-w-2xl space-y-8 px-4 py-8"
      style={{
        //backgroundImage: "url('/img/冒険背景.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-black text-4xl font-bold text-center mt-8 mb-6">
          〜ドライブクエスト〜
        </h1>

        {/* 累計ポイント */}
        <div className="text-center">
          <p className="text-lg font-medium">累計獲得Pt</p>
          <p className="mt-1 text-8xl font-bold text-white">
            {totalPoints !== null ? (
              <>
                {totalPoints}
                <span className="text-5xl align-baseline">pt</span>
              </>
            ) : (
              "Loading..."
            )}
          </p>
        </div>

        {/* クエスト一覧 */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">クエスト選択</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quests.map((quest) => (
              <button
                key={quest.id}
                onClick={() => handleQuestSelect(quest)}
                disabled={loading}
                className={`
        relative flex h-24 w-full items-center justify-between
        bg-gradient-to-r from-blue-400 to-indigo-500
        text-white font-misaki text-lg font-bold
        border border-black rounded-md
        px-4 transition-transform duration-150
        hover:scale-105 hover:shadow-lg active:scale-95
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
      `}
              >
                <span>{quest.title}</span>
                <span className="rounded-sm bg-yellow-400 px-2 py-1 text-sm font-bold text-gray-800">
                  {quest.points}pt
                </span>
              </button>
            ))}
          </div>


        </div>

        {/* これまでのルート */}
        <div>
          <h2 className="text-xl font-semibold">これまでのルート</h2>
          <div className="mt-4 overflow-hidden rounded-2xl shadow-xl">
            <div ref={mapRef} style={mapContainerStyle} className="bg-gray-100"></div>
          </div>
        </div>


        {/* 観光地 */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">近くの観光地・カフェ</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {spots.length > 0 ? (
              spots.map((spot) => (
                <a
                  key={spot.id}
                  href={spot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex cursor-pointer flex-col md:flex-row items-center rounded-2xl bg-white p-4 shadow-lg transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl"
                >
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="h-28 w-28 flex-shrink-0 rounded-xl object-cover mb-2 md:mb-0 md:mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold mb-1">{spot.name}</h3>
                    <p className="text-sm text-gray-600">{spot.description}</p>
                    <p className="mt-2 text-sm text-blue-500 hover:underline">URL: {spot.url}</p>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-center text-gray-500">Loading spots...</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
