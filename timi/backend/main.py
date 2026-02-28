import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from core.deriv_client import DerivClient
import json

app = FastAPI(title="TIMI Trading Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_clients = []

@app.get("/")
def root():
    return {"status": "TIMI ONLINE", "version": "1.0.0"}

@app.get("/balance")
async def get_balance():
    client = DerivClient()
    await client.connect()
    balance = await client.get_balance()
    await client.disconnect()
    return balance

@app.get("/tick/{symbol}")
async def get_tick(symbol: str):
    client = DerivClient()
    await client.connect()
    tick = await client.get_tick(symbol)
    await client.disconnect()
    return tick

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    client = DerivClient()
    await client.connect()
    try:
        symbols = ["frxEURUSD", "R_75", "cryBTCUSD"]
        for symbol in symbols:
            await client.subscribe_ticks(symbol)
        while True:
            tick = await client.receive()
            if tick:
                await websocket.send_text(json.dumps(tick))
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
    finally:
        await client.disconnect()
