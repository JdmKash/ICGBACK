from http.server import BaseHTTPRequestHandler
import os
import json
import asyncio
import requests
import datetime
from urllib.parse import parse_qs
from telebot.async_telebot import AsyncTeleBot
import firebase_admin
from firebase_admin import credentials, firestore, storage
from telebot import types
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = os.environ.get('BOT_TOKEN')
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN enviroment variable missing")
bot = AsyncTeleBot(BOT_TOKEN)

firebase_config = json.loads(os.environ.get('FIREBASE_SERVICE_ACCOUNT'))
if not firebase_config:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT enviroment variable missing")
cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred, {'storageBucket': 'immigrantcoin-5b00f.firebasestorage.app'})
db = firestore.client()
bucket = storage.bucket()

def generate_start_keyboard():
    keyboard = InlineKeyboardMarkup()
    keyboard.add(InlineKeyboardButton("Open ImmigrantCoin App", web_app=WebAppInfo(url="https://immigrantcoins.netlify.app/")))
    return keyboard

@bot.message_handler(commands=['start'])
async def start(message):
    user_id = str(message.from_user.id)
    user_first_name = str(message.from_user.first_name)
    user_last_name = message.from_user.last_name
    user_username = message.from_user.username
    user_language_code = str(message.from_user.language_code)
    is_premium = message.from_user.is_premium
    text = message.text.split()
    welcome_message = (
        f"Hi, {user_first_name}!\n\n"
        f"Welcome to Immigrant Coin\n\n"
        f"Here you can earn Immigrant Coins \n\n" 
        f"Invite friends to earn more coins together, and level up faster!"
    )

    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            photos = await bot.get_user_profile_photos(user_id, limit=1)
            user_image = None
            if photos.total_count > 0:
                file_id = photos.photos[0][-1].file_id
                file_info = await bot.get_file(file_id)
                file_path = file_info.file_path
                file_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"

                response = requests.get(file_url)
                if response.status_code == 200:
                    blob = bucket.blob(f"user_images/{user_id}.jpeg")
                    blob.upload_from_string(response.content, content_type='image/jpeg')
                    user_image = blob.generate_signed_url(datetime.timedelta(days=365), method='GET')

            user_data = {
                'userimage': user_image,
                'firstname': user_first_name,
                'lastname': user_last_name,
                'username': user_username,
                'languageCode': user_language_code,
                'isPremium': is_premium,
                'referrals': {},
                'balance': 0,
                'mineRate': 0.001,
                'isMining': False,
                'miningStartedTime': None,
                'daily': {
                    'claimedTime': None,
                    'claimedDay': 0,
                },
                'links': None,
            }

            user_ref.set(user_data)
        
        keyboard = generate_start_keyboard()
        await bot.reply_to(message, welcome_message, reply_markup=keyboard)
    except Exception as e:
        error_message = "Error, Man WTF"
        await bot.reply_to(message, error_message)
        print(f"Error: {str(e)}")

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        path = self.path

        if path == "/api/ad-complete":
            data = json.loads(post_data.decode('utf-8'))
            user_id = data.get('user_id')
            if user_id:
                asyncio.run(self.reward_user(user_id))
                self.send_response(200)
            else:
                self.send_response(400)
            self.end_headers()
        else:
            update_dict = json.loads(post_data.decode('utf-8'))
            asyncio.run(self.process_update(update_dict))
            self.send_response(200)
            self.end_headers()

    async def reward_user(self, user_id):
        # Example: Update Firestore user balance (add 100 coins for watching ad)
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if user_doc.exists:
            current_balance = user_doc.to_dict().get('balance', 0)
            user_ref.update({'balance': current_balance + 100})
            await bot.send_message(user_id, "✅ You've earned 100 coins for watching the ad!")

    async def process_update(self, update_dict):
        update = types.Update.de_json(update_dict)
        await bot.process_new_updates([update])

    def do_GET(self):
        path = self.path
        if path.startswith("/view-ad"):
            query = parse_qs(path[9:])
            user_id = query.get('user_id', [None])[0]
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f'''
                <html>
                <head><title>Watch Ad</title></head>
                <body>
                    <h2>Watch this ad to earn rewards!</h2>
                    <button onclick="completeAd()">Simulate Ad Completion</button>
                    <script>
                        function completeAd() {{
                            fetch('/api/ad-complete', {{
                                method: 'POST',
                                headers: {{ 'Content-Type': 'application/json' }},
                                body: JSON.stringify({{ user_id: "{user_id}" }})
                            }}).then(response => {{
                                if (response.ok) {{
                                    alert('Ad watched successfully!');
                                    window.close();
                                }}
                            }});
                        }}
                    </script>
                </body>
                </html>
            '''.encode())
        else:
            self.send_response(200)
            self.end_headers()
            self.wfile.write("Bot is running".encode())
