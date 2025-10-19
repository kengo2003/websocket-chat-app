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


clients: set[WebSocket] = set()


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    clients.add(ws)
    try:
        while True:
            data = await ws.receive_text()

            if len(data.encode("utf-8")) > 4096:
                await ws_close(ws, 1009, "Message Too Big (>4KB)")
                break

            try:
                msg = ChatMessage.model_validate_json(data)
            except ValidationError as e:
                await ws_close(ws, 1003, "Invalid payload schema")
                break

            payload = msg.model_dump_json()
            for c in list(clients):
                try:
                    await c.send_text(payload)
                except Exception:
                    clients.discard(c)
    except WebSocketDisconnect:
        pass
    finally:
        clients.discard(ws)


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
