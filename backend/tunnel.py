import subprocess
import time
import re
import httpx
import os

TELEGRAM_TOKEN = "8690338878:AAHgk4evg0GVcymblk84HrqFmXnT1eOiKVM"
PORT = 8000

print(f"Starting localtunnel on port {PORT}...")
process = subprocess.Popen(
    ["npx", "localtunnel", "--port", str(PORT)],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    shell=True
)

public_url = None

for line in iter(process.stdout.readline, ""):
    print(f"[lt] {line.strip()}")
    match = re.search(r'your url is:\s*(https?://[^\s]+)', line)
    if match:
        public_url = match.group(1)
        print(f"Found Public URL: {public_url}")
        
        webhook_url = f"{public_url}/telegram/webhook"
        print(f"Setting Telegram Webhook to: {webhook_url}")
        
        api_url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/setWebhook"
        try:
            response = httpx.post(api_url, json={"url": webhook_url}, timeout=30.0)
            print("Telegram Response:", response.json())
        except Exception as e:
            print(f"Failed to set Telegram Webhook automatically: {e}")
            print(f"Please manually visit: {api_url}?url={webhook_url}")
        
        break

# Keep the tunnel open
if public_url:
    print("Tunnel is active. Press Ctrl+C to stop.")
    process.wait()
else:
    print("Failed to start tunnel.")
