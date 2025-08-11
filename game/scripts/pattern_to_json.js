// pattern_to_json.js
const fs = require('fs');

const PATTERNS = {
  easy:   [0, null, 1, null, 2, null, 3, null],
  normal: [0, null, 1, 2, null, 3, 0, 1],
  hard:   [0, 1, null, 2, 3, null, [0,2], 1]
};

function applyPattern(pattern, bpm, startTime = 0) {
  const interval = 60000 / bpm / 4; // 16分音符間隔
  return pattern.map((p, i) => {
    if (p === null) return null;
    const time = Math.round(startTime + i * interval);
    if (Array.isArray(p)) {
      // 同時押し
      return p.map(lane => ({ t: time, lane: lane + 1, type: "tap" }));
    }
    return { t: time, lane: p + 1, type: "tap" };
  }).filter(Boolean).flat();
}

// 音源の長さ（秒）を仮に90秒とする（必要に応じて調整）
const bpm = 150;
const pattern = PATTERNS.normal;
const audioLengthSec = 90; // ここを音源の長さに合わせて調整
const interval = 60000 / bpm / 4;
const repeat = Math.floor((audioLengthSec * 1000) / (pattern.length * interval));
const notes = applyPattern(pattern, bpm, 1000, repeat);

const chart = {
  title: "No Way",
  bpm: 150,
  audio: "/static/audio/no_way.ogg",
  offset_ms: 0,
  fall_ms: 1600,
  lanes: 4,
  notes,
  markers: [ { t: 900, label: "intro" } ]
};

fs.writeFileSync('../charts/no_way.json', JSON.stringify(chart, null, 2));
console.log('no_way.json updated!');
