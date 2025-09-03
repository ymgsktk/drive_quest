"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuestStartPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const u = localStorage.getItem("dq_username") || "";
    if (u !== "nttdata_001") {
      router.push("/"); // 未ログイン扱いでホームへ
      return;
    }
    setUsername(u);
  }, [router]);

  return (
    <div style={{ background: "var(--dq-green)", minHeight: "100vh" }}>
      <div className="dq-container" style={{ maxWidth: 720 }}>
        <h1 className="dq-title">冒険を開始</h1>

        <div className="dq-card" style={{ marginTop: 12, padding: 16 }}>
          <div className="label">ユーザー名</div>
          <div className="value" style={{ fontSize: 24, fontWeight: 700 }}>
            {username}
          </div>
        </div>

        <p className="dq-meta" style={{ marginTop: 12 }}>
          ※ここは仮ページです。最終的には本番ページに遷移させます。
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button className="dq-btn" onClick={() => router.push("/")}>ホーム</button>
          <button className="dq-btn" onClick={() => router.push("/records")}>記録ページへ</button>
        </div>
      </div>
    </div>
  );
}