import asyncio
import websockets
import os
import json
from supabase import create_client

# اتصال به Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase environment variables are missing")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

connected_clients = {}


# ذخیره پیام در دیتابیس
def save_message(data):
    result = supabase.table("messages").insert({
        "type": data["type"],
        "sender": data["from"],
        "receiver": data.get("to"),
        "message": data["text"]
    }).execute()

    return result


# دریافت تاریخچه پیام‌ها
def get_history(username):
    public_messages = (
        supabase.table("messages")
        .select("id,type,sender,receiver,message")
        .eq("type", "public")
        .order("id")
        .execute()
        .data
    )

    private_messages = (
        supabase.table("messages")
        .select("id,type,sender,receiver,message")
        .eq("type", "private")
        .or_(f"sender.eq.{username},receiver.eq.{username}")
        .order("id")
        .execute()
        .data
    )

    messages = public_messages + private_messages
    messages.sort(key=lambda x: x["id"])

    return [
        {
            "type": msg["type"],
            "from": msg["sender"],
            "to": msg["receiver"],
            "text": msg["message"],
            "history": True
        }
        for msg in messages
    ]


async def handler(websocket):
    user_name = None

    try:
        async for message in websocket:
            data = json.loads(message)

            if data.get("type") == "init":
                user_name = data.get("from")

                if not user_name:
                    continue

                connected_clients[user_name] = websocket

                history = await asyncio.to_thread(
                    get_history, user_name
                )

                for msg in history:
                    await websocket.send(json.dumps(msg))

                continue

            if data.get("type") not in ("public", "private"):
                continue

            if not data.get("from") or not data.get("text"):
                continue

            if data.get("from") != user_name:
                continue

            if data["type"] == "private" and not data.get("to"):
                continue

            await asyncio.to_thread(save_message, data)

            if data["type"] == "public":
                for client_name, client_ws in list(connected_clients.items()):
                    if client_name != user_name:
                        try:
                            await client_ws.send(message)
                        except websockets.exceptions.ConnectionClosed:
                            pass

            elif data["type"] == "private":
                target = data.get("to")

                if target in connected_clients:
                    try:
                        await connected_clients[target].send(message)
                    except websockets.exceptions.ConnectionClosed:
                        pass

    except websockets.exceptions.ConnectionClosed:
        pass

    except Exception as error:
        print("Server error:", error)

    finally:
        if user_name and connected_clients.get(user_name) is websocket:
            del connected_clients[user_name]


async def main():
    port = int(os.environ.get("PORT", 8765))

    async with websockets.serve(
        handler,
        "0.0.0.0",
        port
    ):
        print("MyMessenger connected to Supabase!")

        await asyncio.Future()


if name == "__main__":
    asyncio.run(main())
