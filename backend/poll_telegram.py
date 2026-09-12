import httpx
import time
import os

TELEGRAM_TOKEN = "8690338878:AAHgk4evg0GVcymblk84HrqFmXnT1eOiKVM"
LOCAL_WEBHOOK_URL = "http://localhost:8000/telegram/webhook"
API_URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"

print(f"Starting local long-polling bridge for Telegram Bot...")

# 1. Delete any existing webhook so getUpdates can work
try:
    httpx.post(f"{API_URL}/deleteWebhook")
    print("Deleted existing webhook to allow long polling.")
except Exception as e:
    print(f"Warning: could not delete webhook: {e}")

last_update_id = 0

while True:
    try:
        response = httpx.get(f"{API_URL}/getUpdates", params={"offset": last_update_id, "timeout": 30}, timeout=40)
        data = response.json()
        
        if data.get("ok"):
            for update in data.get("result", []):
                print(f"Received update {update['update_id']} from Telegram")
                last_update_id = update["update_id"] + 1
                
                # Forward to FastAPI webhook
                try:
                    res = httpx.post(LOCAL_WEBHOOK_URL, json=update)
                    print(f"Forwarded to FastAPI, status: {res.status_code}")
                except Exception as fe:
                    print(f"Failed to forward to local server: {fe}")
                    
    except httpx.ReadTimeout:
        # Expected on long poll timeout, just continue
        pass
    except Exception as e:
        print(f"Polling error: {e}")
        time.sleep(5)
