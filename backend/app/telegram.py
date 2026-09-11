import os
import httpx
from pydantic import BaseModel
from fastapi import APIRouter, Request, BackgroundTasks, HTTPException

router = APIRouter()
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "dummy_token")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

# A simple in-memory store for binding tokens (in production, use Supabase or Redis)
# token -> user_id
BINDING_TOKENS: dict[str, str] = {}

class GenerateTokenIn(BaseModel):
    user_id: str

@router.post("/telegram/generate-binding-token")
def generate_binding_token(payload: GenerateTokenIn):
    import uuid
    token = str(uuid.uuid4())
    BINDING_TOKENS[token] = payload.user_id
    # Deep link to open Telegram and start the bot with the token
    # e.g., t.me/YourBotName?start=token
    bot_username = os.environ.get("TELEGRAM_BOT_USERNAME", "LepakSantaiBroBot")
    return {"token": token, "deep_link": f"https://t.me/{bot_username}?start={token}"}

@router.post("/telegram/webhook")
async def telegram_webhook(request: Request):
    update = await request.json()
    if "message" in update and "text" in update["message"]:
        chat_id = update["message"]["chat"]["id"]
        text = update["message"]["text"]
        
        # Check if it's a start command with a token
        if text.startswith("/start "):
            token = text.split(" ")[1]
            if token in BINDING_TOKENS:
                user_id = BINDING_TOKENS.pop(token)
                # Here we would update the 'members' table in Supabase with this chat_id
                # For this scaffold, we just log it
                print(f"Bound Telegram chat_id {chat_id} to user_id {user_id}")
                
                # Send confirmation
                async with httpx.AsyncClient() as client:
                    await client.post(
                        f"{TELEGRAM_API_URL}/sendMessage",
                        json={"chat_id": chat_id, "text": "Successfully linked your account! You will receive itinerary updates here."}
                    )
            else:
                async with httpx.AsyncClient() as client:
                    await client.post(
                        f"{TELEGRAM_API_URL}/sendMessage",
                        json={"chat_id": chat_id, "text": "Invalid or expired binding token."}
                    )
    return {"status": "ok"}

async def notify_users(chat_ids: list[str], message: str):
    """Called by the cron job to ping users 30 mins before Anchor Node."""
    async with httpx.AsyncClient() as client:
        for chat_id in chat_ids:
            await client.post(
                f"{TELEGRAM_API_URL}/sendMessage",
                json={"chat_id": chat_id, "text": message}
            )

@router.post("/telegram/trigger-reconvene")
async def trigger_reconvene(background_tasks: BackgroundTasks):
    """
    Simulates the scheduled cron job triggering 30 minutes before an Anchor Node.
    In reality, this would be an APScheduler job or pg_cron in Supabase.
    """
    # Fetch chat_ids for the next Anchor Node from Supabase
    # Dummy chat_ids for demo
    chat_ids = ["dummy_chat_id_1", "dummy_chat_id_2"]
    message = "Anchor Node in 30 mins! Tap here to route to Basecamp: grab://open"
    background_tasks.add_task(notify_users, chat_ids, message)
    return {"status": "Reconvene notifications queued."}
