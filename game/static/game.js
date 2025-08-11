;(()=>{
const slug=window.__SLUG__||"demo";
const D=document,cvs=D.getElementById('stage'),ctx=cvs.getContext('2d');
const startBtn=D.getElementById('start'),statusEl=D.getElementById('status');
const comboEl=D.getElementById('combo'),accEl=D.getElementById('acc'),offVal=D.getElementById('offv');
let AC,src,gain,buf,startAt=0,offsetMs=0,gameTimeMs=0;
let notes=[],spawnLead=1500,lanes=4,upcoming=[],active=[],combo=0,hits=0,total=0,running=false;
function resize(){cvs.width=innerWidth;cvs.height=innerHeight*0.72} addEventListener('resize',resize); resize();
async function loadChart(slug){const r=await fetch(`/charts/${slug}.json`,{cache:'no-cache'});const chart=await r.json();
offsetMs=chart.offset_ms||0; offVal.textContent=offsetMs|0; lanes=Math.max(4,...chart.notes.map(n=>n.lane));
notes=chart.notes.slice().sort((a,b)=>a.t-b.t); total=notes.length; return chart;}
async function loadAudio(url){AC=AC||new (window.AudioContext||window.webkitAudioContext)(); gain=AC.createGain(); gain.connect(AC.destination);
const r=await fetch(url,{cache:'no-cache'}); const arr=await r.arrayBuffer(); buf=await AC.decodeAudioData(arr);}
function schedulePlay(){src=AC.createBufferSource(); src.buffer=buf; src.connect(gain); const delay=0.8; startAt=AC.currentTime+delay; src.start(startAt);
statusEl.textContent='playing'; upcoming=notes.slice(); active.length=0; combo=0; hits=0; running=true; loop();}
function laneX(l){const w=cvs.width,m=50,col=(w-m*2)/lanes; return m+col*(l-0.5)} function timeToY(t){const H=cvs.height,travel=spawnLead,dt=(t-gameTimeMs+spawnLead); return H-(dt/travel)*(H*0.85)}
function draw(){ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle='#22d3ee'; ctx.fillRect(0,cvs.height*0.9,cvs.width,3); ctx.globalAlpha=.2;
for(let l=1;l<=lanes;l++) ctx.fillRect(laneX(l)-2,0,4,cvs.height); ctx.globalAlpha=1; ctx.fillStyle='#eab308';
for(const n of active){const y=timeToY(n.t); ctx.beginPath(); ctx.arc(laneX(n.lane),y,12,0,Math.PI*2); ctx.fill()}}
function loop(){if(!AC||!src||!running) return; gameTimeMs=(AC.currentTime-startAt)*1000+offsetMs;
while(upcoming.length && upcoming[0].t <= gameTimeMs+spawnLead) active.push(upcoming.shift());
const missLine=gameTimeMs-120; for(let i=0;i<active.length;i++){ if(active[i].t<missLine){ active.splice(i,1); i--; combo=0; comboEl.textContent=`Combo: ${combo}`; } }
draw(); requestAnimationFrame(loop);}
const keyLane={'d':1,'f':2,'j':3,'k':4}; addEventListener('keydown',(e)=>{const l=keyLane[e.key.toLowerCase()]; if(!l) return; judgeLane(l);});
cvs.addEventListener('touchstart',(e)=>{const x=e.changedTouches[0].clientX; const w=cvs.width,m=50,col=(w-m*2)/lanes; const l=Math.min(lanes,Math.max(1,Math.floor((x-m)/col)+1)); judgeLane(l);},{passive:true});
function judgeLane(l){let bi=-1,bd=1e9; for(let i=0;i<active.length;i++){const n=active[i]; if(n.lane!==l) continue; const d=Math.abs(gameTimeMs-n.t); if(d<bd){bd=d; bi=i;}}
if(bi<0) return; const d=bd; let hit=false; if(d<=25) hit=true; else if(d<=45) hit=true; else if(d<=80) hit=true;
if(hit){active.splice(bi,1); combo++; hits++; comboEl.textContent=`Combo: ${combo}`; accEl.textContent=`Acc: ${Math.round(hits/Math.max(1,total)*100)}%`; }}
D.querySelectorAll('[data-off]').forEach(btn=>btn.addEventListener('click',()=>{offsetMs+=parseInt(btn.dataset.off,10); offVal.textContent=offsetMs|0;}));
startBtn.onclick=async()=>{startBtn.disabled=true; const chart=await loadChart(slug); await loadAudio(chart.audio);
AC.resume && AC.resume(); const s=AC.createBufferSource(); s.buffer=AC.createBuffer(1,1,AC.sampleRate); s.connect(AC.destination); s.start(); setTimeout(schedulePlay,100); };
})();
