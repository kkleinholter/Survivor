import json
import os
import re
import html as html_lib
from urllib.parse import parse_qs, unquote, urlparse
from urllib.request import Request, urlopen

SOURCE_URL = "https://www.eonline.com/photos/37717/survivor-50-cast-photos"

req = Request(SOURCE_URL, headers={"User-Agent": "Mozilla/5.0"})
html = urlopen(req, timeout=30).read().decode("utf-8", errors="ignore")
html = html_lib.unescape(html)

pattern = re.compile(r'https://www\.pinterest\.com/pin/create/button/\?[^"\s>]+')
links = pattern.findall(html)

seen = set()
cast = []
for link in links:
    parsed = urlparse(link.replace("&amp;", "&"))
    qs = parse_qs(parsed.query)
    media = qs.get("media", [None])[0]
    description = qs.get("description", [""])[0]
    if not media:
        continue

    decoded_desc = unquote(description)
    marker = " from Survivor 50 Cast Photos"
    if marker not in decoded_desc:
        continue

    name = decoded_desc.split(marker)[0].strip()
    if not name or name in seen:
        continue

    seen.add(name)
    cast.append({
        "name": name,
        "imageUrl": unquote(media),
    })

cast = cast[:24]

os.makedirs("assets/images/cast", exist_ok=True)
for idx, person in enumerate(cast, start=1):
    safe = re.sub(r"[^a-z0-9]+", "-", person["name"].lower()).strip("-")
    local_path = f"assets/images/cast/{idx:02d}-{safe}.jpg"
    try:
        img_req = Request(
            person["imageUrl"],
            headers={
                "User-Agent": "Mozilla/5.0",
                "Referer": SOURCE_URL,
            },
        )
        image_data = urlopen(img_req, timeout=30).read()
        with open(local_path, "wb") as img_file:
            img_file.write(image_data)
        person["image"] = local_path
    except Exception:
        person["image"] = None

os.makedirs("assets", exist_ok=True)
with open("assets/cast.json", "w", encoding="utf-8") as manifest:
    json.dump(cast, manifest, indent=2, ensure_ascii=False)

print(f"cast_count={len(cast)}")
missing = [c["name"] for c in cast if not c["image"]]
print(f"missing_images={len(missing)}")
if missing:
    for name in missing:
        print(name)
