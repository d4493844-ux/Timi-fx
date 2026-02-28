import asyncio
import websockets
import json
import os
from dotenv import load_dotenv

load_dotenv()

DERIV_APP_ID = os.getenv("DERIV_APP_ID", "1089")
DERIV_API_TOKEN = os.getenv("DERIV_API_TOKEN")
DERIV_WS_URL = f"wss://ws.binaryws.com/websockets/v3?app_id={DERIV_APP_ID}"

class DerivClient:
    def __init__(self):
        self.ws = None
        self.authorized = False

    async def connect(self):
        self.ws = await websockets.connect(DERIV_WS_URL)
        await self._authorize()

    async def _authorize(self):
        await self.ws.send(json.dumps({"authorize": DERIV_API_TOKEN}))
        response = json.loads(await self.ws.recv())
        if response.get("msg_type") == "authorize":
            self.authorized = True
            print(f"[TIMI] Authorized as: {response['authorize']['email']}")
        else:
            raise Exception(f"Authorization failed: {response}")

    async def get_balance(self):
        await self.ws.send(json.dumps({"balance": 1, "account": "current"}))
        response = json.loads(await self.ws.recv())
        return {
            "balance": response["balance"]["balance"],
            "currency": response["balance"]["currency"],
            "loginid": response["balance"]["loginid"]
        }

    async def get_tick(self, symbol: str):
        await self.ws.send(json.dumps({"ticks": symbol}))
        response = json.loads(await self.ws.recv())
        return response

    async def get_candles(self, symbol: str, granularity: int = 60, count: int = 100):
        await self.ws.send(json.dumps({
            "ticks_history": symbol,
            "adjust_start_time": 1,
            "count": count,
            "end": "latest",
            "granularity": granularity,
            "style": "candles"
        }))
        response = json.loads(await self.ws.recv())
        return response.get("candles", [])

    async def subscribe_ticks(self, symbol: str):
        await self.ws.send(json.dumps({
            "ticks": symbol,
            "subscribe": 1
        }))

    async def receive(self):
        try:
            msg = await asyncio.wait_for(self.ws.recv(), timeout=10)
            return json.loads(msg)
        except asyncio.TimeoutError:
            return None

    async def buy_contract(self, symbol, contract_type, amount, duration, duration_unit="m"):
        proposal_req = {
            "proposal": 1,
            "amount": amount,
            "basis": "stake",
            "contract_type": contract_type,
            "currency": "USD",
            "duration": duration,
            "duration_unit": duration_unit,
            "symbol": symbol
        }
        await self.ws.send(json.dumps(proposal_req))
        proposal = json.loads(await self.ws.recv())
        if "error" in proposal:
            return {"error": proposal["error"]["message"]}
        proposal_id = proposal["proposal"]["id"]
        await self.ws.send(json.dumps({"buy": proposal_id, "price": amount}))
        result = json.loads(await self.ws.recv())
        return result

    async def disconnect(self):
        if self.ws:
            await self.ws.close()
