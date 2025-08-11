;(()=> {
  const cvs = document.getElementById('stage');
  const fastslow = document.getElementById('fastslow');
  const bigCombo = document.getElementById('big-combo');
  const progbar = document.getElementById('progbar');

  // ---- ヒットスパーク（Canvas上に重ねてフェード） ----
  const bursts = []; // {x,y,t,life}
  function addBurst(x, y){ bursts.push({x,y,t:0,life:240}); }
  function drawBursts(ctx){
    for (let i=bursts.length-1;i>=0;i--){
      const b=bursts[i]; b.t+=16;
      const a = 1 - b.t/b.life;
      if (a<=0){ bursts.splice(i,1); continue; }
      ctx.save(); ctx.globalAlpha = a*0.9; ctx.fillStyle = '#ffe900';
      for(let k=0;k<6;k++){
        const r = 10 + (b.t*0.08) + k*4;
        ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI*2); ctx.strokeStyle='rgba(255,233,0,.35)'; ctx.lineWidth=2; ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ---- 外部からフックするAPI ----
  window.DonkSkin = {
    drawOverlay(ctx){ drawBursts(ctx); },
    onHit(delta, laneX, judgeY, combo, acc){
      // スパーク
      addBurst(laneX, judgeY);
      // FAST / SLOW
      const txt = delta < -2 ? 'FAST' : delta > 2 ? 'SLOW' : 'JUST';
      fastslow.textContent = txt;
      fastslow.style.color = (txt==='JUST') ? '#00fff0' : '#ffe900';
      fastslow.style.opacity = 1;
      clearTimeout(this._fsTimer); this._fsTimer = setTimeout(()=> fastslow.style.opacity = .0, 220);
      // COMBO
      bigCombo.textContent = combo;
      bigCombo.style.transform = 'translateX(-50%) scale(1.1)';
      clearTimeout(this._cbTimer); this._cbTimer = setTimeout(()=> bigCombo.style.transform = 'translateX(-50%) scale(1)', 120);
    },
    setProgress(p){ progbar.style.width = `${Math.max(0,Math.min(1,p))*100}%`; }
  };
})();
