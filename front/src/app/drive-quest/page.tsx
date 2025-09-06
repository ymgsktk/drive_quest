"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Quest = { id: number; title: string; points: number };
type TouristSpot = { id: string | number; name: string; description: string; url: string; image: string };
type LatLng = { lat: number; lng: number };

const mapContainerStyle: React.CSSProperties = { width: "100%", height: "500px", borderRadius: "12px" };
const center: LatLng = { lat: 35.0116, lng: 135.7681 };

// --- モックAPI関数 ---
async function fetchTotalPoints(): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(0), 500));
}

async function fetchQuests(): Promise<Quest[]> {
  try {
    const res = await fetch("http://localhost:3050/api/quests");
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.items;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function fetchTouristSpots(): Promise<TouristSpot[]> {
  try {
    const history: LatLng[] = JSON.parse(localStorage.getItem("routeHistory") || "[]");
    const lastLocation = history.length > 0 ? history[history.length - 1] : center;

    const res = await fetch(
      `http://localhost:3050/api/tourist_spots?lat=${lastLocation.lat}&lng=${lastLocation.lng}&radius=3000`
    );

    if (!res.ok) throw new Error("Failed to fetch tourist spots");

    const data = await res.json();
    return Array.isArray(data) ? data : data.items ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default function QuestSelectionScreen() {
  const router = useRouter();
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const didFetchData = useRef(false);

  // データ取得 (一回だけ)
  useEffect(() => {
    if (didFetchData.current) return;
    didFetchData.current = true;

    const loadData = async () => {
      const savedPoints = localStorage.getItem("totalPoints");
      if (savedPoints) setTotalPoints(Number(savedPoints));
      else {
        const points = await fetchTotalPoints();
        setTotalPoints(points);
      }

      const [questList, spotList] = await Promise.all([fetchQuests(), fetchTouristSpots()]);
      setQuests(questList);
      setSpots(spotList);
    };
    loadData();
  }, []);

  // Google Maps 初期化
  useEffect(() => {
    if (!mapRef.current || mapInstance.current || !(window as any).google) return;

    const g = window.google as typeof google;
    mapInstance.current = new g.maps.Map(mapRef.current, { center, zoom: 14 });
    directionsRenderer.current = new g.maps.DirectionsRenderer({ suppressMarkers: false });
    directionsRenderer.current.setMap(mapInstance.current);

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
      localStorage.setItem("totalPoints", newPoints.toString());
      return newPoints;
    });

    const savedQuests = JSON.parse(localStorage.getItem("quest") || "[]") as Quest[];
    localStorage.setItem("quest", JSON.stringify([...savedQuests, quest]));
    router.push("/drive-quest/arrival");
  };

  return (
    <div className="dq-container bg-dq-green min-h-screen px-4 py-8 flex flex-col items-center">
      {/* 見出し */}
      <h1 className="dq-title text-center text-10xl sm:text-4xl mb-6">〜ドライブクエスト〜</h1>

      {/* 累計獲得ポイント */}
      <div className="text-center my-6 sticky top-20 z-10">
        <p className="dq-totalpoints">累計獲得Pt</p>
        <p className="dq-points">{totalPoints ?? "..."}pt</p>
      </div>

      {/* クエスト一覧 */}
      <div className="w-full max-w-xl mb-8">
        <h2 className="dq-sub mb-4 text-center">クエスト選択</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quests.map((quest) => (
            <button
              key={quest.id}
              onClick={() => handleQuestSelect(quest)}
              disabled={loading}
              className="dq-questbtn"
            >
              <span>{quest.title}</span>
              <span className="bg-yellow-400 text-gray-800 rounded px-2 py-1 text-sm font-bold">{quest.points}pt</span>
            </button>
          ))}
        </div>
      </div>

      {/* ルートマップ */}
      <div className="w-full max-w-3xl mb-8">
        <h2 className="dq-sub mb-4 text-center">これまでのルート</h2>
        <div className="rounded-2xl overflow-hidden shadow-xl">
          <div ref={mapRef} style={mapContainerStyle} />
        </div>
      </div>

      {/* 観光地 */}
      <div className="w-full max-w-3xl">
        <h2 className="dq-sub mb-4 text-center">近くの観光地・カフェ</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {spots.length > 0 ? (
            spots.map((spot) => (
              <a
                key={spot.id}
                href={spot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="dq-card flex flex-col md:flex-row items-center p-4 shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-transform"
              >
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="h-28 w-28 flex-shrink-0 rounded-xl object-cover mb-2 md:mb-0 md:mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-bold mb-1">{spot.name}</h3>
                  <p className="text-sm text-gray-800">{spot.description}</p>
                  <p className="mt-2 text-sm text-blue-500 hover:underline">{spot.url}</p>
                </div>
              </a>
            ))
          ) : (
            <p className="text-center text-gray-400">Loading spots...</p>
          )}
        </div>
      </div>
    </div>
  );
}
