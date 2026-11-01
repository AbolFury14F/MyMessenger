import asyncio
import websockets
import os
import json
import aiosqlite

connected_clients = {}

async def init_db():
    async with aiosqlite.connect("chat_history.db") as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT, sender TEXT, receiver TEXT, text TEXT
            )
        """)
        await db.commit()

async def save_message(data):
    async with aiosqlite.connect("chat_history.db") as db:
        await db.execute(
            "INSERT INTO messages (type, sender, receiver, text) VALUES (?, ?, ?, ?)",
            (data.get("type"), data.get("from"), data.get("to"), data.get("text"))
        )
        await db.commit()

async def get_history(user_name):
    async with aiosqlite.connect("chat_history.db") as db:
        async with db.execute(
            "SELECT type, sender, receiver, text FROM messages WHERE type='public' OR (type='private' AND (sender=? OR receiver=?)) ORDER BY id ASC",
            (user_name, user_name)
        ) as cursor:
            rows = await cursor.fetchall()
            return [{"type": r[0], "from": r[1], "to": r[2], "text": r[3]} for r in rows]

async def handler(websocket):
    user_name = None
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get("type") == "init":
                user_name = data.get("from")
                connected_clients[user_name] = websocket
                history = await get_history(user_name)
                for msg in history:
                    await websocket.send(json.dumps(msg))
                continue

            await save_message(data)

            if data.get("type") == "public":
                for client_name, client_ws in connected_clients.items():
                    if client_name != data.get("from"):
                        try: await client_ws.send(message)
                        except: pass
            elif data.get("type") == "private":
                target = data.get("to")
                if target in connected_clients:
                    try: await connected_clients[target].send(message)
                    except: pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        if user_name and user_name in connected_clients:
            del connected_clients[user_name]

async def main():
    await init_db()
    port = int(os.environ.get("PORT", 8765))
    async with websockets.serve(handler, "0.0.0.0", port):
        print(f"سرور دیتابیس روی پورت {port} روشن شد...")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
