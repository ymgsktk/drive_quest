'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Press_Start_2P } from 'next/font/google';

type LatLng = { lat: number; lng: number };

const press = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press',
});

const LS_KEY = 'user';
const ROUTE_KEY = 'routeHistory';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<LatLng>({ lat: 35.0116, lng: 135.7681 });
  const [routeHistory, setRouteHistory] = useState<LatLng[]>([]);

  /** --- Google Maps API 読み込み確認（ポーリング） --- */
  useEffect(() => {
    const checkGoogle = () => {
      if ((window as any).google?.maps) {
        setMapsLoaded(true);
      } else {
        setTimeout(checkGoogle, 100);
      }
    };
    checkGoogle();
  }, []);

  /** --- localStorage から routeHistory を復元 --- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ROUTE_KEY);
      if (stored) setRouteHistory(JSON.parse(stored));
    } catch (_) {}
  }, []);

  /** --- Google Maps 初期化 --- */
  useEffect(() => {
    if (!confirmed || !mapsLoaded || !mapRef.current) return;

    const g = window.google as typeof google;

    if (!mapInstance.current) {
      mapInstance.current = new g.maps.Map(mapRef.current, {
        center,
        zoom: 14,
      });
    } else {
      mapInstance.current.setCenter(center);
    }

    const listener = mapInstance.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const loc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setSelectedLocation(loc);

      // マーカーは選択中の地点のみ
      if (markerInstance.current) {
        markerInstance.current.setMap(null);
      }
      markerInstance.current = new g.maps.Marker({
        position: loc,
        map: mapInstance.current!,
      });
    });

    return () => {
      if (mapInstance.current) {
        g.maps.event.clearInstanceListeners(mapInstance.current);
        if (markerInstance.current) markerInstance.current.setMap(null);
        mapInstance.current = null;
      }
    };
  }, [confirmed, mapsLoaded, mapRef, center]);

  /** --- LocalStorage から名前復元 --- */
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

  /** --- 冒険開始ボタン押下 --- */
  const handleStart = () => {
    if (!confirmed || !selectedLocation) {
      alert('地図上で座標を選択してください');
      return;
    }

    const newRoute = [...routeHistory, selectedLocation];
    setRouteHistory(newRoute);
    try {
      localStorage.setItem(ROUTE_KEY, JSON.stringify(newRoute));
    } catch (_) {}

    persistAnd(() => router.push('/drive-quest'));
  };

  const goRecords = () => {
    if (!confirmed) return;
    persistAnd(() => router.push('/records'));
  };

  const confirmUsername = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const username = name.trim();
      if (!username) throw new Error('ユーザー名が入力されていません');

      const res = await fetch(`http://localhost:3050/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username }),
      });

      if (!res.ok) throw new Error(`サーバーエラー: ${res.status}`);

      setConfirmed(true);
    } catch (err) {
      console.error(err);
      alert('確定に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="dq-container"
      style={{ minHeight: '72vh', display: 'grid', placeItems: 'center' }}
    >
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

        <label
          className="dq-sub"
          htmlFor="username"
          style={{ display: 'block', marginTop: 24 }}
        >
          ユーザー名
        </label>

        <div
          className="dq-username-row"
          style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}
        >
          <input
            id="username"
            className="dq-input"
            placeholder="ユーザー名を入力"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="dq-confirm-btn dq-btn"
            onClick={confirmUsername}
            disabled={!isValid || loading}
            style={{ minWidth: 100 }}
          >
            {loading ? '送信中...' : '確定'}
          </button>
        </div>

        {/* GoogleMap */}
        {confirmed && (
          <div
            style={{
              width: '100%',
              height: '400px',
              marginTop: 24,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {!mapsLoaded ? <span>Loading map...</span> : <div ref={mapRef} style={{ width: '100%', height: '100%' }} />}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 24,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            className="dq-btn"
            onClick={handleStart}
            disabled={!confirmed || !selectedLocation}
            style={{
              opacity: confirmed && selectedLocation ? 1 : 0.6,
              pointerEvents: confirmed && selectedLocation ? 'auto' : 'none',
              minWidth: 220,
            }}
          >
            冒険を開始する
          </button>

          <button
            className="dq-btn"
            onClick={goRecords}
            disabled={!confirmed}
            style={{
              opacity: confirmed ? 1 : 0.6,
              pointerEvents: confirmed ? 'auto' : 'none',
              minWidth: 220,
            }}
          >
            記録ページへ
          </button>
        </div>

        {/* routeHistory デバッグ用 */}
        {confirmed && (
          <div
            style={{
              marginTop: 16,
              fontSize: 12,
              color: '#ccc',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <p>routeHistory:</p>
            <pre>{JSON.stringify(routeHistory, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  );
}
