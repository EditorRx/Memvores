import os
import asyncio
from datetime import datetime
from telethon import TelegramClient
from telethon.tl.types import MessageMediaPhoto, MessageMediaDocument, MessageMediaAudio, MessageMediaVoice
import json
import re

api_id = int(os.environ["TELEGRAM_API_ID"])
api_hash = os.environ["TELEGRAM_API_HASH"]
bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
channel_username = os.environ["TELEGRAM_CHANNEL_USERNAME"]

client = TelegramClient('memvores_sync', api_id, api_hash, bot_token=bot_token)

POSTS_FILE = "data/posts.json"

def get_message_type(message):
    if message.media is None:
        return "text"
    if isinstance(message.media, MessageMediaPhoto):
        return "photo"
    if isinstance(message.media, MessageMediaDocument):
        # Document can be video, template, or other file
        # For simplicity, treat as video if mime type starts with video/
        mime = getattr(message.media, 'mime_type', '') or ''
        if mime.startswith('video/'):
            return "video"
        if mime.startswith('audio/'):
            return "audio"
        # Default for templates / other files
        return "video"
    if isinstance(message.media, (MessageMediaAudio, MessageMediaVoice)):
        return "audio"
    return "photo"

def decide_category_from_caption(caption: str) -> str:
    caption = caption or ""
    if re.search(r"\b#clips\b", caption, flags=re.IGNORECASE):
        return "clips"
    if re.search(r"\b#audio\b", caption, flags=re.IGNORECASE):
        return "audio"
    if re.search(r"\b#templates\b", caption, flags=re.IGNORECASE):
        return "templates"
    if re.search(r"\b#tutorials\b", caption, flags=re.IGNORECASE):
        return "tutorials"
    return "other"

def load_posts():
    if not os.path.exists(POSTS_FILE):
        return []
    with open(POSTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_posts(posts):
    with open(POSTS_FILE, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

async def sync_channel():
    await client.start()
    channel = await client.get_entity(channel_username)

    posts = load_posts()
    existing_ids = {p.get("id") for p in posts}

    new_posts = []

    async for message in client.iter_messages(channel, limit=50):
        if message.id in existing_ids:
            continue

        caption = message.text or ""

        post_type = get_message_type(message)

        file_path = None
        if message.media:
            if isinstance(message.media, MessageMediaPhoto):
                file_path = await message.download_media(file=f"posts/{message.date.strftime('%Y-%m-%dT%H-%M-%S')}-{message.id}-photo.jpg")
            elif isinstance(message.media, MessageMediaDocument):
                # Could be video, template, audio, etc.
                file_path = await message.download_media(file=f"posts/{message.date.strftime('%Y-%m-%dT%H-%M-%S')}-{message.id}-file")
            elif isinstance(message.media, (MessageMediaAudio, MessageMediaVoice)):
                file_path = await message.download_media(file=f"posts/{message.date.strftime('%Y-%m-%dT%H-%M-%S')}-{message.id}-audio.mp3")

        telegram_link = f"https://t.me/{channel_username}/{message.id}"

        category = decide_category_from_caption(caption)

        post_entry = {
            "id": str(message.id),
            "date": message.date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "type": post_type,
            "category": category,
            "caption": caption,
            "telegramLink": telegram_link,
            "file": file_path.replace("\\", "/") if file_path else None
        }

        new_posts.append(post_entry)

    # Naye posts ko existing ke saath merge karo
    posts.extend(new_posts)
    save_posts(posts)

    print(f"Synced {len(new_posts)} new posts. Total posts: {len(posts)}")

with client:
    client.loop.run_until_complete(sync_channel())
