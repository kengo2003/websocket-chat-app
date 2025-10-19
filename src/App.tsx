import { useEffect, useRef, useState } from "react";
import { ChatSchema, type ChatMessage } from "./schemas";

export default function App() {
  const [log, setLog] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const user = useRef(`user-${Math.floor(Math.random() * 1000)}`);
  const wsRef = useRef<WebSocket | null>(null);

  // IME用フラグ
  const composingRaf = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const url = `${location.origin.replace("http", "ws")}/ws`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => console.log("WS connected");
    ws.onmessage = (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        if (msg?.type === "chat") setLog((old) => [...old, msg]);
      } catch {
        // 非JSONは無視（MVP）
      }
    };
    ws.onclose = () => console.log("WS closed");
    ws.onerror = (err) => console.error("WS error", err);

    return () => ws.close();
  }, []);

  const canSend = () =>
    !!wsRef.current &&
    wsRef.current.readyState === WebSocket.OPEN &&
    text.trim().length > 0;

  const send = () => {
    // if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!canSend()) return;
    const trimmed = text.trim();

    const draft: ChatMessage = {
      type: "chat",
      user: user.current,
      text: trimmed,
      ts: Date.now(),
    };

    const v = ChatSchema.safeParse(draft);
    if (!v.success) {
      const issues = v.error.issues;

      const fieldErrors = issues.reduce((acc, issue) => {
        const key = issue.path.length ? issue.path.join(".") : "_form";
        (acc[key] ??= []).push(issue.message);
        return acc;
      }, {} as Record<string, string[]>);

      console.warn("invalid message", fieldErrors);
      return;
    }

    wsRef.current!.send(JSON.stringify(v.data));
    setText("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const isIME = composingRaf.current || e.nativeEvent.isComposing;

    if (e.key === "Enter" && !e.shiftKey && !isIME) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <section id="chat" className="h-80 overflow-auto p-4 space-y-2">
        {log.map((m, i) => {
          const mine = m.user === user.current;
          return (
            <div
              key={i}
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              {!mine && <p className="text-gray-600 mb-0.5">{m.user}</p>}
              <div
                className={`px-2 py-2 rounded-lg max-w-[75%] w-fit ${
                  mine ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                <p className="text-xl">{m.text}</p>
              </div>
            </div>
          );
        })}
      </section>
      <section className="p-3 border-t flex gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring"
          placeholder="メッセージを入力..."
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onCompositionStart={() => (composingRaf.current = true)}
          onCompositionEnd={() => (composingRaf.current = false)}
        />
        <button
          onClick={send}
          disabled={!canSend()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          send
        </button>
      </section>
    </>
  );
}
