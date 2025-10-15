import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  type: "chat";
  user: string;
  text: string;
  ts: number;
};

export default function App() {
  const [log, setLog] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const user = useRef(`user-${Math.floor(Math.random() * 1000)}`);
  const wsRef = useRef<WebSocket | null>(null);

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

  const send = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const msg: ChatMessage = {
      type: "chat",
      user: user.current,
      text: trimmed,
      ts: Date.now(),
    };
    wsRef.current.send(JSON.stringify(msg));
    setText("");
  };

  return (
    <>
      <section id="chat" className="h-80 overflow-auto p-4 space-y-2">
        {log.map((m, i) => {
          const mine = m.user === user.current;
          return (
            <div
              key={i}
              className={`${mine ? "justify-end" : "justify-start"}`}
            >
              <p className="text-gray-600 mb-0.5">{m.user}</p>
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
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          send
        </button>
      </section>
    </>
  );
}
