;(() => {
  // ====== 基本設定 ======
  const D = document;
  const cvs = D.getElementById('stage'), ctx = cvs.getContext('2d');
  const startBtn = D.getElementById('start');
  const comboEl = D.getElementById('combo'), accEl = D.getElementById('acc');
  const statusEl = D.getElementById('status');
  const slug = (window.__SLUG__ || new URLSearchParams(location.search).get('slug') || 'demo');

  let AC, src, gain, buf, analyser;
  let startAt = 0;                // 再生開始のAC時刻（秒）
  let offsetMs = 0;               // 体感補正
  let fallMs = 1600;              // 落下時間
  let lanes = 4;

  let chart = null, lyrics = [], running = false;

  // 画面
  function resize(){ cvs.width = innerWidth; cvs.height = innerHeight*0.72 }
  addEventListener('resize', resize); resize();

  // キーガイド表示
  const guide = D.createElement('div');
  guide.style.position = 'fixed';
  guide.style.left = '50%';
  guide.style.bottom = '24px';
  guide.style.transform = 'translateX(-50%)';
  guide.style.background = 'rgba(0,0,0,0.7)';
  guide.style.color = '#ffe900';
  guide.style.fontSize = '1.2em';
  guide.style.padding = '8px 24px';
  guide.style.borderRadius = '12px';
  guide.style.zIndex = 10;
  guide.innerHTML = '判定キー: <b>D F J K</b>（左→右）';
  D.body.appendChild(guide);

  // ====== 1) 譜面と音声をロード ======
  async function loadChart(slug){
    const r = await fetch(`/charts/${slug}.json`, {cache:'no-cache'});
    chart = await r.json();
    lyrics = (chart.lyrics || []).slice().sort((a,b)=>a.t-b.t);
  }
  async function loadAudio(url){
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    gain = AC.createGain(); gain.connect(AC.destination);
    analyser = AC.createAnalyser(); analyser.fftSize = 256;
    gain.connect(analyser);
    const r = await fetch(url, {cache:'no-cache'});
    const arr = await r.arrayBuffer();
    buf = await AC.decodeAudioData(arr);
  }

  // ====== 2) 未来時刻に再生予約 ======
  function play(){
    src = AC.createBufferSource(); src.buffer = buf; src.connect(gain);
    const delay = 0.8; // 秒：スタート演出用ディレイ
    startAt = AC.currentTime + delay;
    src.start(startAt);          // ← 予約再生（ズレ小）
    running = true;
    statusEl.textContent = 'playing';
    showLyricsLoop();
  }

  // ====== 3) 落下式の座標計算 ======
  function gameTimeMs(){ return (AC.currentTime - startAt)*1000 + offsetMs }
  function laneX(l){ const w=cvs.width, m=50, col=(w-m*2)/lanes; return m + col*(l-0.5) }
  function noteY(t){
    // t に判定ライン到達（= 画面下部 90%）
    // 出現は t - fallMs の時点で画面上（0%）に現れる
    const H = cvs.height, judgeY = H*0.9;
    const gms = gameTimeMs();
    const progress = 1 - (t - gms)/fallMs; // 0→1で落下
    return judgeY * Math.min(1, Math.max(0, progress));
  }

  // ====== 4) スポーン・ミス処理・描画 ======

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
    // 進捗バー
    if (window.DonkSkin && buf) DonkSkin.setProgress(Math.max(0, Math.min(1, (AC.currentTime-startAt)/buf.duration)));
    requestAnimationFrame(showLyricsLoop);
  }

  // ====== 5) 判定：レーンの最も近いノーツ1個 ======
  const keyLane = { 'd':1, 'f':2, 'j':3, 'k':4 };
  addEventListener('keydown', (e)=>{
    const l = keyLane[e.key.toLowerCase()];
    if (!l || !running) return;
    judge(l);
  });
  cvs.addEventListener('touchstart', (e)=>{
    if(!running) return;
    const x = e.changedTouches[0].clientX;
    const w=cvs.width, m=50, col=(w-m*2)/lanes;
    const l = Math.min(lanes, Math.max(1, Math.floor((x-m)/col)+1));
    judge(l);
  }, {passive:true});

  function judge(l){
    const gms = gameTimeMs();
    const judgeY = cvs.height*0.9;
    // lane一致のうち最も近い
    let bi=-1, bd=1e9;
    for (let i=0;i<active.length;i++){
      const n=active[i]; if(n.lane!==l) continue;
      const d=Math.abs(gms - n.t);
      if(d<bd){ bd=d; bi=i; }
    }
    if (bi<0) return;
    const d = bd;
    // しきい値（lets-csharpと同等の感覚に寄せる）
    let hit=false, score=0;
    if (d<=25){ hit=true; score=100; }       // Perfect
    else if (d<=45){ hit=true; score=70; }   // Great
    else if (d<=80){ hit=true; score=40; }   // Good

    if (hit){
      const n = active[bi];
      active.splice(bi,1);
      combo++; hits++;
      // 中央コンボUI
      const bigCombo = document.getElementById('big-combo');
      if (bigCombo) bigCombo.textContent = combo;
      accEl.textContent = `ACC ${Math.round(hits/Math.max(1,total)*100)}%`;
      // FAST/SLOW/エフェクト
      const delta = gms - active[bi]?.t ?? 0;
      if (window.DonkSkin) DonkSkin.onHit(gms-n.t, laneX(l), judgeY, combo, (hits/Math.max(1,total)));
    }
  }

  // ====== 起動フロー ======
  startBtn.onclick = async ()=>{
    startBtn.disabled = true;
    try {
      await loadChart(slug);
      await loadAudio(chart.audio);
      // AudioContextを必ずユーザー操作直後にresume
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
