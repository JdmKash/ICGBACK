from http.server import BaseHTTPRequestHandler
import os
import json
import asyncio
import requests
import datetime
from telebot.async_telebot import AsyncTeleBot
import firebase_admin
from firebase_admin import credentials, firestore, storage
from telebot import types

# Initialize outside handler for cold start optimization
BOT_TOKEN = os.environ.get('BOT_TOKEN')
bot = AsyncTeleBot(BOT_TOKEN)

# Firebase initialization
if not firebase_admin._apps:
    firebase_config = json.loads(os.environ.get('FIREBASE-SERVICE-ACCOUNT'))
    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred, {'storageBucket': 'immigrantcoin-5b00f.appspot.com'})
db = firestore.client()
bucket = storage.bucket()

class Handler(BaseHTTPRequestHandler):  # <- Capital 'H' in Handler
    def do_POST(self):
        if self.path == '/api/webhook':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                update = types.Update.de_json(json.loads(post_data.decode('utf-8')))
                
                # Process update
                asyncio.run(bot.process_new_updates([update]))
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
                
            except Exception as e:
                self.send_error(500, message=str(e))
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write("Bot is running".encode())
        else:
            self.send_error(404)

def generate_start_keyboard():
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(types.InlineKeyboardButton(
        "Open ImmigrantCoin App", 
        web_app=types.WebAppInfo(url="https://immigrantcoins.netlify.app")
    ))
    return keyboard

@bot.message_handler(commands=['start'])
async def start(message):
    # [Keep your existing start handler code unchanged]
    # ... (same as your original code) ...

# Vercel requires this named export
def main(request, response):
    handler = Handler(request, response)
    handler.handle()