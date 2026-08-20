import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";

const POLLING_INTERVAL = 1000;

async function getLatestMessage(sender) {
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender, message, created_at")
    .eq("sender", sender)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export default function DisplayPage() {
  const [hyukminMessage, setHyukminMessage] = useState("불러오는 중...");
  const [iroiMessage, setIroiMessage] = useState("불러오는 중...");
  const [status, setStatus] = useState("연결 중...");
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("messageFontSize");

    if (!saved) {
      return 60;
    }

    const parsed = Number(saved);

    return Number.isFinite(parsed) ? parsed : 60;
  });

  useEffect(() => {
    let active = true;
    let loading = false;

    async function loadMessages() {
      if (loading) {
        return;
      }

      loading = true;

      try {
        const [hyukmin, iroi] = await Promise.all([
          getLatestMessage("혁민"),
          getLatestMessage("이로이")
        ]);

        if (!active) {
          return;
        }

        setHyukminMessage(
          hyukmin && hyukmin.message
            ? hyukmin.message
            : "메시지 없음"
        );

        setIroiMessage(
          iroi && iroi.message
            ? iroi.message
            : "메시지 없음"
        );

        setStatus("연결 완료");
      } catch (error) {
        console.error("메시지 조회 오류:", error);

        if (active) {
          setStatus("연결 오류");
        }
      } finally {
        loading = false;
      }
    }

    loadMessages();

    const timer = window.setInterval(
      loadMessages,
      POLLING_INTERVAL
    );

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  function handleFontSize(event) {
    const size = Number(event.target.value);

    setFontSize(size);

    localStorage.setItem(
      "messageFontSize",
      String(size)
    );
  }

  return (
    <main className="display-page">
      <div className="display-status">
        {status}
      </div>

      <section
        className="display-messages"
        style={{ fontSize: fontSize + "px" }}
      >
        <div className="display-row">
          <span className="display-label">
            혁민 메시지 :
          </span>

          <span>
            {hyukminMessage}
          </span>
        </div>

        <div className="display-row">
          <span className="display-label">
            이로이 메시지 :
          </span>

          <span>
            {iroiMessage}
          </span>
        </div>
      </section>

      <div className="display-controls">
        <span>글자 크기</span>

        <input
          type="range"
          min="10"
          max="200"
          step="1"
          value={fontSize}
          onChange={handleFontSize}
        />

        <strong>
          {fontSize}px
        </strong>
      </div>
    </main>
  );
}
