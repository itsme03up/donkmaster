from django.http import JsonResponse, Http404
from django.shortcuts import render
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent
CHARTS_DIR = BASE_DIR / "charts"

def index(request):
    # 曲選択画面
    return render(request, "select.html")
def play(request, slug):
    # プレイ画面（既存のgame.htmlを流用）
    return render(request, "game.html", {"slug": slug})

def chart(request, slug):
    f = CHARTS_DIR / f"{slug}.json"
    if not f.exists():
        raise Http404()
    with open(f, "r", encoding="utf-8") as fp:
        data = json.load(fp)
    return JsonResponse(data)
