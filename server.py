import asyncio
import websockets
import os

# لیست کاربرانی که به سرور وصل هستند
connected_clients = set()

async def handler(websocket):
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            for client in connected_clients:
                if client != websocket:
                    await client.send(message)
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)

async def main():
    # Render به صورت خودکار پورت رو تعیین میکنه
    port = int(os.environ.get("PORT", 8765))
    async with websockets.serve(handler, "0.0.0.0", port):
        print(f"سرور چت روی پورت {port} روشن شد...")
        await asyncio.Future()

if name == "__main__":
    asyncio.run(main())
