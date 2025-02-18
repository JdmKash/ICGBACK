from flask import Flask, request, jsonify
import os
import json
import asyncio
import requests
import datetime
from telebot.async_telebot import AsyncTeleBot
import firebase_admin
from firebase_admin import credentials, firestore, storage
from telebot import types
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
import logging

# Initialize Flask app first
app = Flask(__name__)

# Enable logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Firebase and Telegram Bot after Flask
BOT_TOKEN = os.environ.get('BOT_TOKEN')
bot = AsyncTeleBot(BOT_TOKEN)

firebase_config = json.loads(os.environ.get('FIREBASE-SERVICE-ACCOUNT'))
cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred, {'storageBucket': 'immigrantcoin-5b00f.appspot.com'})
db = firestore.client()
bucket = storage.bucket()

def generate_start_keyboard():
    keyboard = InlineKeyboardMarkup()
    keyboard.add(InlineKeyboardButton("Open ImmigrantCoin App", web_app=WebAppInfo(url="https://immigrantcoins.netlify.app")))  # Fix URL if needed
    return keyboard

@bot.message_handler(commands=['start'])
async def start(message):
    # ... [rest of your start handler code] ...

@app.route('/api/webhook', methods=['POST'])
def webhook():
    try:
        logger.debug("Received webhook request")
        update = request.json
        asyncio.run(bot.process_new_updates([types.Update.de_json(update)]))
        return jsonify(success=True)
    except Exception as e:
        logger.error(f"Error in webhook: {str(e)}", exc_info=True)
        return jsonify(success=False, error=str(e)), 500

@app.route('/')
def index():
    return "Bot is Running"

if __name__ == "__main__":
    app.run()