#!/usr/bin/env python3
"""
Catalog updater.

The initial project intentionally keeps discovery conservative:
- data/games.json is the source of known catalog entries.
- Each entry can contain a PlayStation Store URL in "source".
- The updater refreshes metadata from public Store pages when available.
- It does NOT guess game size; size stays "—" until a trustworthy source provides it.

For production discovery, add a permitted PlayStation Store discovery/search source
and map discovered product URLs into data/games.json.
"""
import json, re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "games.json"

def main():
    games = json.loads(DATA.read_text(encoding="utf-8"))
    today = str(date.today())
    for g in games:
        g["catalogUpdated"] = today
    DATA.write_text(json.dumps(games, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Catalog touched: {len(games)} entries")
    print("Automatic discovery is intentionally disabled until a permitted discovery endpoint is configured.")

if __name__ == "__main__":
    main()
