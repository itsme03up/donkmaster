from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import requests

# Google Translate APIキー（環境変数やsettings.pyで管理推奨）
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')

@csrf_exempt
@require_POST
def translate_api(request):
    text = request.POST.get('text')
    target_lang = request.POST.get('target')
    if not text or not target_lang:
        return JsonResponse({'error': 'Missing text or target'}, status=400)
    # Google Translate API呼び出し
    url = 'https://translation.googleapis.com/language/translate/v2'
    params = {
        'q': text,
        'target': target_lang,
        'format': 'text',
        'key': GOOGLE_API_KEY,
    }
    try:
        resp = requests.post(url, data=params)
        data = resp.json()
        translated = data['data']['translations'][0]['translatedText']
        return JsonResponse({'translated': translated})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
