import os
import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path

import httpx

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
CHANNEL_USERNAME = os.environ["TELEGRAM_CHANNEL_USERNAME"].lstrip("@")
MAX_MEDIA_POSTS = int(os.environ.get("MAX_MEDIA_POSTS", 50))
MAX_FILE_SIZE_MB = int(os.environ.get("MAX_FILE_SIZE_MB", 30))

BASE_DIR = Path(".")
POSTS_DIR = BASE_DIR / "posts"
POSTS_JSON = BASE_DIR / "data" / "posts.json"

POSTS_DIR.mkdir(exist_ok=True)

TG_API = f"https://api.telegram.org/bot{BOT_TOKEN}"


def call_tg(method, params=None, data=None, files=None):
    url = f"{TG_API}/{method}"
    with httpx.Client(timeout=60.0) as client:
        resp = client.post(url, params=params, data=data, files=files)
        resp.raise_for_status()
        return resp.json()


def download_file(file_id, file_path: Path):
    info = call_tg("getFile", {"file_id": file_id})
    file_info = info.get("result", {})
    file_path_tg = file_info.get("file_path")
    if not file_path_tg:
        return None

    url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path_tg}"
    with httpx.Client(timeout=120.0, follow_redirects=True) as client:
        with client.stream("GET", url) as r:
            r.raise_for_status()
            with open(file_path, "wb") as f:
                for chunk in r.iter_bytes(chunk_size=8192):
                    f.write(chunk)
    return file_path


def get_media_from_message(msg):
    if "photo" in msg:
        photos = msg["photo"]
        if not photos:
            return None
        p = max(photos, key=lambda x: x.get("file_size", 0))
        return "photo", p["file_id"], p.get("file_size", 0)

    if "video" in msg:
        v = msg["video"]
        return "video", v["file_id"], v.get("file_size", 0)

    if "document" in msg:
        d = msg["document"]
        mime = d.get("mime_type", "")
        if mime.startswith("video/"):
            return "video", d["file_id"], d.get("file_size", 0)

    return None


def is_from_our_channel(msg):
    chat = msg.get("chat", {})
    sender_chat = msg.get("sender_chat", {})

    chat_user = chat.get("username", "")
    sender_user = sender_chat.get("username", "")

    return chat_user == CHANNEL_USERNAME or sender_user == CHANNEL_USERNAME


def main():
    # Fetch recent updates
    resp = call_tg("getUpdates", {
        "offset": -1,
        "limit": 100,
        "timeout": 10
    })
    updates = resp.get("result", [])

    messages = []
    for u in updates:
        # Channel posts
        if "channel_post" in u:
            msg = u["channel_post"]
            if is_from_our_channel(msg):
                messages.append(msg)

        # Also handle normal messages (in case you test in a group)
        if "message" in u:
            msg = u["message"]
            if is_from_our_channel(msg):
                messages.append(msg)

    # Sort by message_id ascending
    messages.sort(key=lambda m: m["message_id"])

    # Load existing posts
    if POSTS_JSON.exists():
        with open(POSTS_JSON, "r", encoding="utf-8") as f:
            posts = json.load(f)
    else:
        posts = []

    existing_ids = {p["id"] for p in posts}

    max_file_size_bytes = MAX_FILE_SIZE_MB * 1024 * 1024

    for msg in messages:
        msg_id = msg["message_id"]
        post_id = str(msg_id)

        if post_id in existing_ids:
            continue

        caption = msg.get("caption", "") or msg.get("text", "")
        date_str = datetime.fromtimestamp(msg["date"], tz=timezone.utc).isoformat().replace("+00:00", "Z")
        telegram_link = f"https://t.me/{CHANNEL_USERNAME}/{msg_id}"

        media_info = get_media_from_message(msg)

        post_entry = {
            "id": post_id,
            "date": date_str,
            "type": "text",
            "caption": caption,
            "telegramLink": telegram_link,
        }

        if media_info:
            mtype, file_id, file_size = media_info
            if file_size > max_file_size_bytes:
                posts.append(post_entry)
                continue

            post_entry["type"] = mtype

            ext = ".jpg" if mtype == "photo" else ".mp4"
            hash_part = hashlib.sha256(f"{post_id}-{file_id}".encode()).hexdigest()[:8]
            filename = f"{date_str[:19].replace(':', '-')}-{post_id}-{hash_part}{ext}"
            file_path = POSTS_DIR / filename

            download_file(file_id, file_path)

            post_entry["file"] = f"posts/{filename}"

        posts.append(post_entry)
        existing_ids.add(post_id)

    # Sort posts by date descending (newest first)
    posts.sort(key=lambda p: p["date"], reverse=True)

    # Determine which posts get media stored
    media_posts_with_file = [p for p in posts if "file" in p]
    if len(media_posts_with_file) > MAX_MEDIA_POSTS:
        to_keep = media_posts_with_file[:MAX_MEDIA_POSTS]
        to_remove = media_posts_with_file[MAX_MEDIA_POSTS:]

        keep_files = {p["file"] for p in to_keep}

        for p in to_remove:
            if "file" in p:
                del p["file"]

        for f in POSTS_DIR.iterdir():
            rel = f"posts/{f.name}"
            if rel not in keep_files:
                f.unlink()

    # Write posts.json
    with open(POSTS_JSON, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
