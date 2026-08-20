import { useState } from "react";
import { supabase } from "../supabase.js";

export default function SenderPage({ sender, title }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function sendMessage() {
    const text = message.trim();

    if (!text || sending) {
      return;
    }

    setSending(true);
    setStatus("전송 중...");

    try {
      const { error } = await supabase
        .from("messages")
        .insert([
          {
            sender: sender,
            message: text
          }
        ]);

      if (error) {
        throw error;
      }

      setMessage("");
      setStatus("전송 완료");
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      setStatus("전송 실패");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="sender-page">
      <section className="sender-card">
        <div className="sender-badge">{sender}</div>

        <h1>{title}</h1>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요"
          autoFocus
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={sending || !message.trim()}
        >
          {sending ? "전송 중..." : "전송"}
        </button>

        <div className="send-status">{status}</div>
      </section>
    </main>
  );
}
