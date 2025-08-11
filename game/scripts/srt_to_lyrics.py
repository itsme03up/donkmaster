# srt_to_lyrics.py
# Whisper等のSRT出力をWeb用lyrics配列(JSON)に変換
import re
import json
import sys

def srt_time_to_ms(s):
    h, m, rest = s.split(':')
    sec, ms = rest.split(',')
    return (int(h)*3600 + int(m)*60 + int(sec))*1000 + int(ms)

def srt_to_lyrics(srt_path, out_path=None):
    with open(srt_path, encoding='utf-8') as f:
        lines = f.read().splitlines()
    lyrics = []
    i = 0
    while i < len(lines):
        if re.match(r'^\d+$', lines[i]):
            # index
            i += 1
            if i >= len(lines): break
            m = re.match(r'^(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})', lines[i])
            if m:
                t = srt_time_to_ms(m.group(1))
                i += 1
                text = ''
                while i < len(lines) and lines[i].strip():
                    text += lines[i] + ' '
                    i += 1
                lyrics.append({"t": t, "text": text.strip()})
            else:
                i += 1
        else:
            i += 1
    if out_path:
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(lyrics, f, ensure_ascii=False, indent=2)
    else:
        print(json.dumps(lyrics, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python srt_to_lyrics.py input.srt [output.json]')
        sys.exit(1)
    srt_to_lyrics(sys.argv[1], sys.argv[2] if len(sys.argv)>2 else None)
