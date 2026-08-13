#!/usr/bin/env python3

import json
import re
import time
from datetime import date
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "games.json"

STORE = "https://store.playstation.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 PlayStationGameCatalog/2.0"
}

CATEGORIES = [
    "https://store.playstation.com/de-de/category/30e3fe35-8f2d-4496-95bc-844f56952e3c/1"
]


def fetch(url):
    request = Request(url, headers=HEADERS)

    with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", "ignore")


def get_title(html):
    match = re.search(
        r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)',
        html,
        re.I
    )

    if not match:
        return ""

    title = match.group(1).strip()

    return re.sub(
        r"\s*\|\s*PlayStation.*$",
        "",
        title,
        flags=re.I
    )


def make_id(name):
    return re.sub(
        r"[^a-z0-9]+",
        "-",
        name.lower()
    ).strip("-")[:70]


def find_product_links(html):

    links = re.findall(
        r'href=["\']([^"\']+(?:/product/|/concept/)[^"\']*)',
        html,
        re.I
    )

    result = []

    for link in links:
        link = urljoin(STORE, link)
        link = link.split("?")[0]

        if link not in result:
            result.append(link)

    return result


games = json.loads(
    DATA.read_text(encoding="utf-8")
)

known_sources = {
    game.get("source")
    for game in games
}

found_links = []


for category in CATEGORIES:

    try:
        html = fetch(category)

        found_links.extend(
            find_product_links(html)
        )

    except Exception as error:
        print("Category error:", error)


found_links = list(dict.fromkeys(found_links))


for url in found_links[:100]:

    if url in known_sources:
        continue

    try:

        html = fetch(url)

        name = get_title(html)

        if not name:
            continue

        platforms = []

        if re.search(r"\bPS5\b", html, re.I):
            platforms.append("PS5")

        if re.search(r"\bPS4\b", html, re.I):
            platforms.append("PS4")

        game = {
            "id": make_id(name),
            "name": name,
            "platforms": platforms or ["PS5"],
            "size": "—",
            "release": "",
            "genre": [],
            "developer": "",
            "publisher": "",
            "description": "",
            "cover": "",
            "screenshots": [],
            "trailer": "",
            "source": url,
            "catalogUpdated": str(date.today())
        }

        if not any(
            g.get("id") == game["id"]
            for g in games
        ):
            games.append(game)

            print("Added:", name)

        time.sleep(0.15)

    except Exception as error:

        print("Product error:", error)


DATA.write_text(
    json.dumps(
        games,
        ensure_ascii=False,
        indent=2
    ) + "\n",
    encoding="utf-8"
)

print("Total games:", len(games))
