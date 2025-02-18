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
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Telegram Bot (outside handler for cold starts)
BOT_TOKEN = os.environ.get('BOT_TOKEN')
bot = AsyncTeleBot(BOT_TOKEN)

# Initialize Firebase once
if not firebase_admin._apps:
    try:
        firebase_config = json.loads(os.environ.get('FIREBASE-SERVICE-ACCOUNT'))
        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'immigrantcoin-5b00f.appspot.com'
        })
        logger.info("Firebase initialized successfully")
    except Exception as e:
        logger.error(f"Firebase init error: {str(e)}")

db = firestore.client()
bucket = storage.bucket()

class VercelHandler(BaseHTTPRequestHandler):
    def handle_request(self):
        try:
            logger.debug(f"Received {self.command} request at {self.path}")
            
            if self.path == '/api/webhook' and self.command == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                update = types.Update.de_json(json.loads(post_data))
                
                # Process update
                asyncio.run(bot.process_new_updates([update]))
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
                
            elif self.path == '/' and self.command == 'GET':
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b"Bot is running")
                
            else:
                self.send_error(404, "Endpoint not found")
                
        except Exception as e:
            logger.error(f"Handler error: {str(e)}", exc_info=True)
            self.send_error(500, f"Server error: {str(e)}")

    def do_GET(self):
        self.handle_request()

    def do_POST(self):
        self.handle_request()

# Vercel-specific export (MUST BE NAMED 'app')
def app(request, response):
    handler = VercelHandler(request, response, directory=None)
    handler.handle()
    return response