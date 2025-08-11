
// DonkMaster: 音楽再生＋歌詞タイミング表示 専用JS
(() => {
  const D = document;
  const startBtn = D.getElementById('start');
  const statusEl = D.getElementById('status');

  let AC, src, gain, buf;
  let startAt = 0;
  let chart = null, lyrics = [], running = false;
  let currentSlug = (window.__SLUG__ || new URLSearchParams(location.search).get('slug') || 'demo');

  // 曲リストを取得してセレクトに反映
  async function setupSongSelect() {
    const sel = D.getElementById('song-select');
    if (!sel) return;
    const res = await fetch('/static/songlist.json');
    const songs = await res.json();
    sel.innerHTML = '';
    for (const s of songs) {
      const opt = D.createElement('option');
      opt.value = s.slug;
      opt.textContent = s.title.replace(/\.[a-z0-9]+$/i, '');
      if (s.slug === currentSlug) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.onchange = () => {
      currentSlug = sel.value;
      statusEl.textContent = 'READY';
      startBtn.disabled = false;
    };
  }

  // 歌詞データと音声をロード
  async function loadChart(slug){
    const r = await fetch(`/charts/${slug}.json`, {cache:'no-cache'});
    chart = await r.json();
    lyrics = (chart.lyrics || []).slice().sort((a,b)=>a.t-b.t);
  }
  async function loadAudio(url){
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    gain = AC.createGain(); gain.connect(AC.destination);
    const r = await fetch(url, {cache:'no-cache'});
    const arr = await r.arrayBuffer();
    buf = await AC.decodeAudioData(arr);
  }

  // 再生＋歌詞表示
  function play(){
    src = AC.createBufferSource(); src.buffer = buf; src.connect(gain);
    const delay = 0.8;
    startAt = AC.currentTime + delay;
    src.start(startAt);
    running = true;
    statusEl.textContent = 'playing';
    showLyricsLoop();
  }

  // 歌詞表示ループ
  function showLyricsLoop(){
    if (!running) return;
    const gms = (AC.currentTime - startAt) * 1000;
    let cur = null;
    for (let i = 0; i < lyrics.length; i++) {
      if (gms >= lyrics[i].t) cur = lyrics[i];
      else break;
    }
    const lyricsText = document.getElementById('lyrics-text');
    if (lyricsText) lyricsText.textContent = cur ? cur.text : '';
    requestAnimationFrame(showLyricsLoop);
  }

  // 起動フロー
  startBtn.onclick = async ()=>{
    startBtn.disabled = true;
    try {
      await loadChart(currentSlug);
      await loadAudio(chart.audio);
      if (AC.state !== 'running') await AC.resume();
      // iOS解放（無音1サンプル）
      const s=AC.createBufferSource(); s.buffer=AC.createBuffer(1,1,AC.sampleRate);
      s.connect(AC.destination); s.start();
      setTimeout(play, 100);
    } catch(e) {
      alert('音声再生エラー: ' + (e.message || e));
      statusEl.textContent = 'audio error';
    }
  };

  // 翻訳API呼び出し
  async function translateText(text, targetLang) {
    const form = new FormData();
    form.append('text', text);
    form.append('target', targetLang);
    const res = await fetch('/api/translate', { method: 'POST', body: form });
    const data = await res.json();
    if (data.translated) return data.translated;
    throw new Error(data.error || '翻訳失敗');
  }

  // 翻訳UIイベント
  function setupTranslateUI() {
    const src = document.getElementById('trans-src');
    const lang = document.getElementById('trans-lang');
    const btn = document.getElementById('trans-btn');
    const result = document.getElementById('trans-result');
    if (!src || !lang || !btn || !result) return;
    btn.onclick = async () => {
      btn.disabled = true;
      result.textContent = '翻訳中...';
      try {
        const translated = await translateText(src.value, lang.value);
        result.textContent = translated;
      } catch(e) {
        result.textContent = e.message;
      }
      btn.disabled = false;
    };
  }

  // 初期化
  setupSongSelect();
  setupTranslateUI();
})();
