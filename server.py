import asyncio
import websockets
import os
import json

# دیکشنری برای نگه‌داری ارتباط بین اسم کاربر و اتصالش
connected_clients = {}

async def handler(websocket):
    user_name = None
    try:
        async for message in websocket:
            data = json.loads(message)
            
            # اگر پیام شامل اطلاعات فرستنده است، اسمش رو ثبت کن
            if "from" in data:
                user_name = data["from"]
                connected_clients[user_name] = websocket
                
                # ارسال پیام به گیرنده خاص
                target = data.get("to")
                if target in connected_clients:
                    try:
                        await connected_clients[target].send(message)
                    except:
                        pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        # وقتی کاربر قطع شد، اسمش رو از لیست حذف کن
        if user_name and user_name in connected_clients:
            del connected_clients[user_name]

async def main():
    port = int(os.environ.get("PORT", 8765))
    async with websockets.serve(handler, "0.0.0.0", port):
        print(f"سرور PV روی پورت {port} روشن شد...")
        await asyncio.Future()

if name == "__main__":
    asyncio.run(main())
