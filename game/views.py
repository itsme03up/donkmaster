
"""
Views for DonkMaster rhythm game.
"""
import os
import json
from pathlib import Path
from django.http import JsonResponse, Http404
from django.shortcuts import render

def get_chart(request, slug):
    """譜面データを返す薄いAPI"""
    path = os.path.join(os.path.dirname(__file__), 'charts', f'{slug}.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return JsonResponse(data)

BASE_DIR = Path(__file__).resolve().parent
CHARTS_DIR = BASE_DIR / "charts"

def index(request):
    """曲選択画面"""
    return render(request, "select.html")
def play(request, slug):
    """プレイ画面（既存のgame.htmlを流用）"""
    return render(request, "game.html", {"slug": slug})

def chart(request, slug):
    """譜面データを返す（旧API）"""
    f = CHARTS_DIR / f"{slug}.json"
    if not f.exists():
        raise Http404()
    with open(f, "r", encoding="utf-8") as fp:
        data = json.load(fp)
    return JsonResponse(data)
