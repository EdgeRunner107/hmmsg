import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase.js";

const POLLING_INTERVAL = 1000;

async function getLatestMessage(sender, signal) {
  if (!supabase) {
    throw new Error("Supabase 환경 변수를 확인하세요.");
  }
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender, message, created_at")
    .eq("sender", sender)
    .order("created_at", { ascending: false })
    .limit(1)
    .abortSignal(signal)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export default function DisplayPage() {
  const messagePanel = useRef(null);
  const [iroiMessage, setIroiMessage] = useState("불러오는 중...");
  const [status, setStatus] = useState("연결 중...");
  const [fontSize] = useState(() => {
    let saved;
    try {
      saved = localStorage.getItem("messageFontSize");
    } catch {
      return 60;
    }

    if (!saved) {
      return 60;
    }

    const parsed = Number(saved);

    return Number.isFinite(parsed) ? parsed : 60;
  });

  useEffect(() => {
    let active = true;
    let loading = false;
    let initialized = false;
    let latestTimestamp = null;
    const seenMessages = new Set();
    const controller = new AbortController();

    async function loadMessages() {
      if (loading) {
        return;
      }

      loading = true;

      try {
        // The director uses the existing "이로이" sender value.
        const iroi = await getLatestMessage("이로이", controller.signal);

        if (!active) {
          return;
        }

        if (iroi && (iroi.sender !== "이로이" ||
          typeof iroi.message !== "string" || !iroi.message.trim())) {
          setStatus("메시지 데이터 오류");
          return;
        }

        if (iroi) {
          const identity = iroi.id != null
            ? "id:" + iroi.id
            : JSON.stringify([iroi.created_at ?? null, iroi.message]);
          const parsedTimestamp = Date.parse(iroi.created_at);
          const timestamp = Number.isFinite(parsedTimestamp) ? parsedTimestamp : null;
          const stale = timestamp !== null && latestTimestamp !== null &&
            timestamp < latestTimestamp;

          if (!seenMessages.has(identity) && !stale) {
            setIroiMessage(iroi.message);
            seenMessages.add(identity);
            if (timestamp !== null) {
              latestTimestamp = timestamp;
            }

            if (initialized && messagePanel.current) {
              // Restart even if the previous message is still flashing.
              const panel = messagePanel.current;
              panel.classList.remove("new-message-flash");
              void panel.offsetWidth;
              panel.classList.add("new-message-flash");
            }
          }
        } else if (!initialized) {
          setIroiMessage("메시지 없음");
        }

        // Only a successful response establishes the initial baseline.
        initialized = true;

        setStatus("연결 완료");
      } catch (error) {
        if (active) {
          console.error("메시지 조회 오류:", error);
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
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="display-page">
      <div className="display-status">
        {status}
      </div>

      <section
        ref={messagePanel}
        className="display-messages"
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) {
            event.currentTarget.classList.remove("new-message-flash");
          }
        }}
        style={{ fontSize: fontSize + "px" }}
      >

        <div className="display-row">
          <span className="display-label">
            이사 :
          </span>

          <span>
            {iroiMessage}
          </span>
        </div>
      </section>


    </main>
  );
}
