import json
import httpx
import asyncio
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from schemas import ChatMessage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def ws_close(ws: WebSocket, code: int, reason: str):
    try:
        await ws.close(code=code, reason=reason)
    except Exception:
        pass


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/")
def read_root():
    return {"Hello": "World"}


# clients: set[WebSocket] = set()
clients: dict[str, WebSocket] = {}


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket, user: str):
    await ws.accept()
    clients[user] = ws

    try:
        while True:
            data = await ws.receive_text()
            msg_dict = json.loads(data)

            target = msg_dict.get("target_user")
            sender = msg_dict.get("user")

            if sender in clients and sender != target:
                await clients[sender].send_text(data)

            if target == "ai@local":

                async def ask_ai(user_text, sender_email):
                    try:
                        async with httpx.AsyncClient() as client:
                            res = await client.post(
                                "http://localhost:11434/api/chat",
                                json={
                                    "model": "mistral:7b-instruct",
                                    "messages": [
                                        {"role": "user", "content": user_text}
                                    ],
                                    "stream": False,
                                },
                                timeout=60,
                            )
                            ai_text = res.json()["message"]["content"]

                        ai_reply = {
                            "type": "chat",
                            "user": target,
                            "target_user": sender_email,
                            "text": ai_text,
                            "ts": int(time.time() * 1000),
                        }
                        if sender_email in clients:
                            await clients[sender_email].send_text(json.dumps(ai_reply))

                    except Exception as e:
                        print("AI通信エラー:", e)

                asyncio.create_task(ask_ai(msg_dict.get("text"), sender))

            elif target in clients:
                await clients[target].send_text(data)

            if len(data.encode("utf-8")) > 4096:
                await ws_close(ws, 1009, "Message Too Big (>4KB)")
                break

            try:
                msg = ChatMessage.model_validate_json(data)
            except ValidationError as e:
                await ws_close(ws, 1003, "Invalid payload schema")
                break

            # payload = msg.model_dump_json()
            # for c in list(clients):
            #     try:
            #         await c.send_text(payload)
            #     except Exception:
            #         clients.discard(c)
    except WebSocketDisconnect:
        if user in clients:
            del clients[user]


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
