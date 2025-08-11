rhythm_mvp/
├── game/
│   ├── templates/
│   │   └── game.html      # Game UI
│   ├── charts/
│   │   └── demo.json      # Sample chart data
│   ├── static/
│   │   ├── game.js        # Game logic (JS)
│   │   └── audio/
│   │       └── demo.wav   # Sample audio
├── manage.py
└── README.md

# DonkMaster (Django + JS ロシア語歌詞付き音楽再生サイト)

このプロジェクトは「音楽再生＋ロシア語歌詞のタイミング表示」に特化したWebアプリです。
Djangoで音源・歌詞データを配信し、フロントエンドで音楽再生と歌詞のシンクロ表示を行います。

## 主な特徴

- **Django最小API**
  - `/` → 再生ページ (game.html)
  - `/static/audio/` → 音源ファイル
  - `/charts/<slug>.json` → 歌詞タイミングデータ（JSON）
- **WebAudio APIで高精度再生**
- **ロシア語歌詞をタイミング付きで表示**
- **歌詞データはWhisper等で自動生成も可能**

## セットアップ・起動方法

```bash
pip install django
python manage.py runserver
```

ブラウザで `http://127.0.0.1:8000/` を開いてください。

## ファイル構成

```
donkmaster/
├── game/
│   ├── templates/
│   │   └── game.html      # 再生＋歌詞表示UI
│   ├── charts/
│   │   └── no_way.json   # 歌詞タイミングデータ（例）
│   ├── static/
│   │   ├── game_lets_csharp.js  # 再生・歌詞表示ロジック
│   │   └── audio/
│   │       └── no_way.ogg      # 音源ファイル
├── manage.py
└── README.md
```

## 歌詞データ（JSON形式例）

```json
{
  "bpm": 150,
  "audio": "/static/audio/no_way.ogg",
  "lyrics": [
    { "t": 1000, "text": "Привет!" },
    { "t": 2500, "text": "Как дела?" },
    { "t": 4000, "text": "Я люблю музыку!" }
  ]
}
```

- `t` = 歌詞表示タイミング（ms）
- `text` = ロシア語歌詞

## 歌詞データの自動生成（Whisper等）

OpenAI Whisper等の音声認識ツールを使えば、音源ファイルから自動でロシア語歌詞＋タイムスタンプを抽出できます。
抽出したデータを上記JSON形式に変換し、`charts/`配下に配置してください。

## カスタマイズ

- 音源ファイルを差し替えるだけでOK
- 歌詞データも自由に編集・追加可能

## ライセンス

MIT License


