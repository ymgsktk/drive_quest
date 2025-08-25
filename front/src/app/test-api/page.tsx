"use client";
import { useEffect, useState } from "react";

export default function ApiTest() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("http://localhost:3050/api/ping") // フロントからバックエンドへのリクエスト
      .then(res => res.json())
      .then(data => setMsg(data.message))
      .catch(err => setMsg(err.message));
  }, []);

  return <div>APIからのレスポンスです！: {msg}</div>;
}
