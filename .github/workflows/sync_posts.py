import hashlib
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import httpx

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
CHANNEL_USERNAME = os.environ["TELEGRAM_CHANNEL_USERNAME"].lstrip("@")

def _int_env(name: str, default: int) -> int:
    value = os.environ.get(name, "")
    if not value:
        return default
    try:
        return int(value)
    except ValueError:
        return default

MAX_MEDIA_POSTS = _int_env("MAX_MEDIA_POSTS", 50)
MAX_FILE_SIZE_MB = _int_env("MAX_FILE_SIZE_MB", 30)

BASE_DIR = Path(".")
POSTS_DIR = BASE_DIR / "posts"
POSTS_JSON = BASE_DIR / "data" / "posts.json"
POSTS_DIR.mkdir(exist_ok=True)

TG_API = f"https://api.telegram.org/bot{BOT_TOKEN}"
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

CATEGORY_TAGS = {
    "clip": "clips",
    "audio": "audio",
    "sound": "audio",
    "template": "templates",
    "overlay": "templates",
    "tutorial": "tutorials",
    "update": "tutorials"
}


def call_tg(method, params=None):
    with httpx.Client(timeout=60.0) as client:
        response = client.post(f"{TG_API}/{method}", params=params or {})
        response.raise_for_status()
        data = response.json()

    if not data.get("ok"):
        raise RuntimeError(f"Telegram {method} failed: {data}")

    return data["result"]


def is_from_our_channel(message):
    chat = message.get("chat", {})
    sender_chat = message.get("sender_chat", {})
    return (
        chat.get("username", "").lower() == CHANNEL_USERNAME.lower()
        or sender_chat.get("username", "").lower() == CHANNEL_USERNAME.lower()
    )


def extract_category_and_caption(caption: str):
    caption = (caption or "").strip()

    # Correct regex: ^s*[([a-zA-Z]+)]s*
    pattern = r"^s*$$([a-zA-Z]+)$$s*"
    match = re.match(pattern, caption)

    if not match:
        return "other", caption

    tag = match.group(1).lower()
    clean_caption = caption[match.end():].strip()
    return CATEGORY_TAGS.get(tag, "other"), clean_caption


def get_media_from_message(message):
    if message.get("photo"):
        photo = max(message["photo"], key=lambda item: item.get("file_size", 0))
        return "photo", photo["file_id"], photo.get("file_size", 0), ".jpg"

    if message.get("video"):
        video = message["video"]
        return "video", video["file_id"], video.get("file_size", 0), ".mp4"

    if message.get("audio"):
        audio = message["audio"]
        mime = audio.get("mime_type", "")
        extension = ".mp3" if "mpeg" in mime or "mp3" in mime else ".m4a"
        return "audio", audio["file_id"], audio.get("file_size", 0), extension

    if message.get("voice"):
        voice = message["voice"]
        return "audio", voice["file_id"], voice.get("file_size", 0), ".ogg"

    if message.get("document"):
        document = message["document"]
        mime = document.get("mime_type", "").lower()

        if mime.startswith("video/"):
            return "video", document["file_id"], document.get("file_size", 0), ".mp4"

        if mime.startswith("audio/"):
            extension = Path(document.get("file_name", "")).suffix or ".mp3"
            return "audio", document["file_id"], document.get("file_size", 0), extension

        if mime.startswith("image/"):
            extension = Path(document.get("file_name", "")).suffix or ".jpg"
            return "photo", document["file_id"], document.get("file_size", 0), extension

    return None


def download_file(file_id, destination):
    file_info = call_tg("getFile", {"file_id": file_id})
    telegram_path = file_info.get("file_path")

    if not telegram_path:
        raise RuntimeError("Telegram returned no file path.")

    url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{telegram_path}"

    with httpx.Client(timeout=120.0, follow_redirects=True) as client:
        with client.stream("GET", url) as response:
            response.raise_for_status()
            with open(destination, "wb") as output:
                for chunk in response.iter_bytes(chunk_size=8192):
                    output.write(chunk)


def load_posts():
    if not POSTS_JSON.exists():
        return []

    with open(POSTS_JSON, "r", encoding="utf-8") as file:
        return json.load(file)


def save_posts(posts):
    POSTS_JSON.parent.mkdir(exist_ok=True)

    with open(POSTS_JSON, "w", encoding="utf-8") as file:
        json.dump(posts, file, ensure_ascii=False, indent=2)


def cleanup_old_media(posts):
    media_posts = [post for post in posts if post.get("file")]
    keep_posts = media_posts[:MAX_MEDIA_POSTS]
    keep_files = {post["file"] for post in keep_posts}

    for post in media_posts[MAX_MEDIA_POSTS:]:
        post.pop("file", None)

    for local_file in POSTS_DIR.iterdir():
        if local_file.is_file() and f"posts/{local_file.name}" not in keep_files:
            local_file.unlink()


def main():
    updates = call_tg(
        "getUpdates",
        {
            "offset": -1,
            "limit": 100,
            "timeout": 10,
            "allowed_updates": json.dumps(["channel_post"])
        }
    )

    messages = []

    for update in updates:
        message = update.get("channel_post")
        if message and is_from_our_channel(message):
            messages.append(message)

    messages.sort(key=lambda message: message["message_id"])

    posts = load_posts()
    existing_ids = {str(post["id"]) for post in posts}

    for message in messages:
        message_id = str(message["message_id"])

        if message_id in existing_ids:
            continue

        raw_caption = message.get("caption", "") or message.get("text", "")
        category, caption = extract_category_and_caption(raw_caption)

        timestamp = datetime.fromtimestamp(
            message["date"], tz=timezone.utc
        ).isoformat().replace("+00:00", "Z")

        post = {
            "id": message_id,
            "date": timestamp,
            "type": "text",
            "category": category,
            "caption": caption,
            "telegramLink": f"https://t.me/{CHANNEL_USERNAME}/{message_id}"
        }

        media = get_media_from_message(message)

        if media:
            media_type, file_id, file_size, extension = media
            post["type"] = media_type

            if file_size <= MAX_FILE_SIZE_BYTES:
                hash_part = hashlib.sha256(
                    f"{message_id}-{file_id}".encode("utf-8")
                ).hexdigest()[:8]

                filename = (
                    f"{timestamp[:19].replace(':', '-')}-"
                    f"{message_id}-{hash_part}{extension}"
                )

                destination = POSTS_DIR / filename
                download_file(file_id, destination)
                post["file"] = f"posts/{filename}"

        posts.append(post)
        existing_ids.add(message_id)

    posts.sort(key=lambda post: post["date"], reverse=True)
    cleanup_old_media(posts)
    save_posts(posts)


if __name__ == "__main__":
    main()
