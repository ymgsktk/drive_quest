"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [usernameDisplay, setUsernameDisplay] = useState("");
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();

  const FORCED = "nttdata_001";

  useEffect(() => {
    setIsValid(usernameDisplay.trim() === FORCED);
  }, [usernameDisplay]);

  const saveAnd = (path: string) => {
    if (!isValid) return;
    localStorage.setItem("dq_username", FORCED);
    router.push(path);
  };

  return (
    <div
      style={{
        background: "var(--dq-green)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="dq-container"
        style={{ maxWidth: 480, width: "100%", textAlign: "center" }}
      >
        <h1 className="dq-title">〜ドライブクエスト〜</h1>

        {/* 入力 */}
        <div style={{ marginTop: 24 }}>
          <label
            className="dq-sub"
            style={{ display: "block", marginBottom: 8, textAlign: "left" }}
          >
            ユーザー名
          </label>
          <input
            value={usernameDisplay}
            onChange={(e) => setUsernameDisplay(e.target.value)}
            placeholder="例: nttdata_001"
            className="dq-input"
            style={{ width: "100%", textAlign: "center" }}
          />
          {!isValid && usernameDisplay.length > 0 && (
            <div className="dq-meta" style={{ marginTop: 8, color: "#f88" }}>
              正しいユーザー名を入力してください
            </div>
          )}
        </div>

        {/* ボタン（横並び） */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 32,
            justifyContent: "center",
          }}
        >
          <button
            className="dq-btn"
            onClick={() => saveAnd("/quest")}
            disabled={!isValid}
            style={{
              opacity: isValid ? 1 : 0.5,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            冒険を開始する
          </button>

          <button
            className="dq-btn"
            onClick={() => saveAnd("/records")}
            disabled={!isValid}
            style={{
              opacity: isValid ? 1 : 0.5,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            記録ページへ
          </button>
        </div>
      </div>
    </div>
  );
}