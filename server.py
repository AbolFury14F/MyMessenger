import asyncio
import websockets
import os
import json

connected_clients = {}

async def handler(websocket):
    user_name = None
    try:
        async for message in websocket:
            data = json.loads(message)
            sender = data.get("from")
            if sender:
                user_name = sender
                connected_clients[user_name] = websocket

            if data.get("type") == "public":
                for client in connected_clients.values():
                    try:
                        await client.send(message)
                    except:
                        pass
            elif data.get("type") == "private":
                target = data.get("to")
                if target in connected_clients:
                    try:
                        await connected_clients[target].send(message)
                    except:
                        pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        if user_name and user_name in connected_clients:
            del connected_clients[user_name]

async def main():
    port = int(os.environ.get("PORT", 8765))
    async with websockets.serve(handler, "0.0.0.0", port):
        print(f"سرور ساده روی پورت {port} روشن شد...")
        await asyncio.Future()

if name == "__main__":
    asyncio.run(main())
