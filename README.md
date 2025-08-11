# DonkMaster (Django + JavaScript Rhythm Game)

This is a minimal working example of a rhythm game using **Django** for backend file serving and **WebAudio API + Canvas** for timing-accurate gameplay.

## Features

* **Django minimal API**:

  * `/` → Game HTML template (`game.html`)
  * `/charts/demo.json` → Sample chart JSON
  * `/static/audio/demo.wav` → Test audio (150BPM click track)
* **Accurate timing control**:

  * Uses `AudioBufferSourceNode.start(when)` for scheduled playback
  * Uses `AudioContext.currentTime` for sync reference
* **Judgement system**:

  * Perfect ±25ms
  * Great ±45ms
  * Good ±80ms
* **Offset adjustment UI** (+/- 5ms per click)
* **4-lane layout**

## Installation & Run

```bash
pip install django
python manage.py runserver
```

Then open:

```
http://127.0.0.1:8000/
```

Click **START** to begin the game.

## File Structure

```
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
```

## Chart Format

Example (`charts/demo.json`):

```json
{
  "bpm": 150,
  "audio": "/static/audio/demo.wav",
  "notes": [
    {"time": 1000, "lane": 0},
    {"time": 2000, "lane": 1},
    {"time": 3000, "lane": 2},
    {"time": 4000, "lane": 3}
  ]
}
```

* `time` = when note should be hit (ms from song start)
* `lane` = 0 to 3 (4 lanes)

## Customization

* Replace `demo.wav` with your own track
* Edit `demo.json` with your song BPM & note timings
* Add more charts and point the view to load them

## License

MIT License

##　音源保存形式について
推奨は .ogg または .mp3
.mp3 → 広く再生できるが、ブラウザによってはデコードが若干重い
.ogg → 軽量・ループ精度が高い（特にFirefoxやChromeで有利）
音ゲーは遅延がシビアなので、できれば 44.1kHz / 16bit / ステレオでエクスポートするとズレが少ないです。


