
// DonkMaster: 音楽再生＋歌詞タイミング表示 専用JS
(() => {
  const D = document;
  const startBtn = D.getElementById('start');
  const statusEl = D.getElementById('status');
  const slug = (window.__SLUG__ || new URLSearchParams(location.search).get('slug') || 'demo');

  let AC, src, gain, buf;
  let startAt = 0;
  let chart = null, lyrics = [], running = false;

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
      await loadChart(slug);
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
})();
