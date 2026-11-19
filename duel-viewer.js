// 決鬥（PK）對戰畫面（伺服器版專用）：戰鬥由伺服器模擬，這裡只負責把伺服器送來的對戰狀態畫出來。
// 事件：duelStart（開打）、duelFrame（每 0.2 秒的位置血量）、duelPop（傷害數字）、duelLog（戰鬥紀錄）、duelEnd（結果）。
// 按「認輸」會送 duelQuit 給伺服器；其餘都不會從這裡影響勝負。
(function () {
  if (window.__duelViewer) return; window.__duelViewer = 1;
  var LOBBY_CSS = "#mock-duel,#mock-duel-lobby{position:fixed;inset:0;z-index:9000;font-family:inherit;color:#f3e9d2}\n#mock-duel{background:#2a1b10 center bottom/cover no-repeat;overflow:hidden}\n#mock-duel .dtop{position:absolute;top:calc(10px + env(safe-area-inset-top));left:0;right:0;text-align:center;font-weight:700;text-shadow:0 2px 3px #000}\n#mock-duel .dtime{font-size:26px;color:#ffe08a}#mock-duel .dvs{font-size:13px;opacity:.9}\n#mock-duel .df{position:absolute;top:calc(64px + env(safe-area-inset-top));width:38%;text-align:center}\n#mock-duel .df.L{left:3%}#mock-duel .df.R{right:3%}\n#mock-duel .dbar{position:relative;height:17px;border-radius:8px;background:#0008;border:1px solid #000;margin:3px auto;width:88%;overflow:hidden}\n#mock-duel .dbar i{position:absolute;left:0;top:0;bottom:0;z-index:1;transition:width .2s}#mock-duel .dbar b{position:relative;z-index:2;display:block;color:#fff;font-weight:700;font-size:11px;line-height:17px;text-shadow:0 1px 2px #000,0 0 3px #000}\n#mock-duel .dhp i{background:linear-gradient(#ff6b6b,#b91c1c)}#mock-duel .dmp i{background:linear-gradient(#60a5fa,#1d4ed8)}\n#mock-duel .dname{font-weight:700;font-size:14px;text-shadow:0 2px 3px #000}#mock-duel .dcls{font-size:11px;opacity:.9;text-shadow:0 1px 2px #000}\n#mock-duel .dbuf{display:flex;flex-wrap:wrap;justify-content:center;gap:2px;height:40px;overflow:hidden;margin:1px auto 0;width:92%}#mock-duel .dbuf img{width:18px;height:18px;border-radius:3px;background:#0006;object-fit:contain}\n#mock-duel .dspr{height:170px;display:flex;align-items:flex-end;justify-content:center;position:relative}\n#mock-duel .dspr img.body{max-height:160px;max-width:100%;image-rendering:auto;filter:drop-shadow(0 6px 4px #0007)}\n#mock-duel .dspr.flip img.body{transform:scaleX(-1)}\n#mock-duel .dspr.cloaked{opacity:.3;filter:drop-shadow(0 0 5px #8ef);transition:opacity .4s}\n#mock-duel .dspr.dead img.body{filter:grayscale(1) brightness(.6);opacity:.7}\n#mock-duel .dspr{position:relative}#mock-duel .dspr.stun::after{content:'💫';position:absolute;left:50%;top:-4px;margin-left:-16px;font-size:30px;line-height:1;animation:dstun .9s linear infinite;pointer-events:none}#mock-duel .dspr.stun img.body{filter:grayscale(.5) brightness(.85)}@keyframes dstun{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}\n#mock-duel .dspr.poison img.body{filter:sepia(.5) saturate(2.4) hue-rotate(230deg) drop-shadow(0 0 7px #b25aff)}\n#mock-duel .dpop{position:absolute;left:50%;top:30%;transform:translateX(-50%);font-weight:900;font-size:19px;white-space:nowrap;text-shadow:0 0 3px #000,0 1px 2px #000;pointer-events:none;animation:mduelPop 1s ease-out forwards}\n#mock-duel .dpop img{width:17px;height:17px;vertical-align:-3px;margin-right:2px}\n@keyframes mduelPop{0%{opacity:0;margin-top:10px}12%{opacity:1}100%{opacity:0;margin-top:-60px}}\n#mock-duel .dlog{position:absolute;left:8px;width:min(56%,380px);bottom:calc(64px + env(safe-area-inset-bottom));height:17%;overflow-y:auto;font-size:11px;line-height:1.5;background:#0009;border-radius:8px;padding:5px 8px;-webkit-overflow-scrolling:touch}\n#mock-duel .dbtns{position:absolute;left:0;right:0;bottom:calc(14px + env(safe-area-inset-bottom));display:flex;gap:10px;justify-content:center}\n#mock-duel button,#mock-duel-lobby button{background:linear-gradient(#f5c451,#c98f20);color:#241b0f;border:0;border-radius:8px;padding:9px 18px;font-weight:700;font-size:14px}\n#mock-duel button.dark,#mock-duel-lobby button.dark{background:#3a2c1a;color:#f3e9d2;border:1px solid #6e5220}\n#mock-duel .dres{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);font-size:44px;font-weight:900;letter-spacing:4px;text-shadow:0 0 12px #000,0 3px 4px #000;animation:mduelRes .5s ease-out}\n@keyframes mduelRes{from{transform:translate(-50%,-50%) scale(2.2);opacity:0}}\n#mock-duel-lobby{background:#000b;display:flex;align-items:center;justify-content:center;padding:16px}\n#mock-duel-lobby .box{background:#241b10;border:2px solid #8a6d2e;border-radius:12px;width:100%;max-width:420px;max-height:92vh;overflow:auto;padding:14px}\n#mock-duel-lobby h3{margin:0 0 4px;color:#ffd88a;font-size:18px}#mock-duel-lobby .rec{font-size:12px;opacity:.85;margin-bottom:8px}\n#mock-duel-lobby .set{background:#1a130b;border:1px solid #3a2c1a;border-radius:8px;padding:8px;font-size:13px;margin-bottom:10px}\n#mock-duel-lobby .set label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:5px 0}\n#mock-duel-lobby select,#mock-duel-lobby input{background:#0f0b06;color:#f3e9d2;border:1px solid #5a4422;border-radius:6px;padding:4px;max-width:62%}\n#mock-duel-lobby input{width:56px}\n#mock-duel-lobby .opp{display:flex;align-items:center;gap:8px;padding:8px 4px;border-bottom:1px solid #3a2c1a}\n#mock-duel-lobby .opp .nm{font-weight:700}#mock-duel-lobby .opp .ds{font-size:11px;opacity:.75}#mock-duel-lobby .opp .pw{font-size:11px;color:#ffd88a}\n#mock-duel-lobby .opp > div{flex:1}\n#mock-duel .dfield{position:absolute;left:0;right:0;bottom:calc(74px + 17%);height:200px;z-index:3;pointer-events:none}\n#mock-duel .dfield .dspr{position:absolute;bottom:0;width:130px;height:170px;margin-left:-65px;transition:left .1s linear}\n#mock-duel .dfield .dspr.dash{transition:left .12s cubic-bezier(.2,.9,.3,1)}\n#mock-duel .dfield .dspr.dash img.body{filter:drop-shadow(0 0 8px #fffb) brightness(1.25)}\n#mock-duel .dent{position:absolute;translate:0 0;transition:left .1s linear,translate .15s ease-out;filter:drop-shadow(0 4px 3px #0008)}\n#mock-duel .dfield .dspr.run{animation:drunL .26s ease-in-out infinite}\n#mock-duel .dfield .dspr.flip.run{animation:drunR .26s ease-in-out infinite}\n@keyframes drunL{0%,100%{transform:translateY(0) rotate(2deg)}50%{transform:translateY(-10px) rotate(6deg)}}\n@keyframes drunR{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(-6deg)}}\n#mock-duel .ddust{position:absolute;bottom:2px;width:16px;height:10px;margin-left:-8px;border-radius:50%;background:radial-gradient(#e8d9b8cc,#e8d9b800 70%);animation:ddust .5s ease-out forwards}\n@keyframes ddust{from{transform:translateY(0) scale(.6);opacity:.9}to{transform:translateY(-8px) scale(2.2);opacity:0}}\n#mock-duel .dlogtg{position:absolute;left:8px;bottom:calc(64px + 17% + 6px + env(safe-area-inset-bottom));z-index:9;font-size:11px;padding:1px 8px;border-radius:10px;border:1px solid #fff5;background:#000a;color:#ddd}#mock-duel.nolog .dlog{display:none}#mock-duel.nolog .dlogtg{bottom:calc(64px + env(safe-area-inset-bottom))}#mock-duel .dlog{z-index:8}#mock-duel .dbtns{z-index:9}";
  var css = '#srv-duel{position:fixed;inset:0;z-index:9000;font-family:inherit;color:#f3e9d2;background:#2a1b10 center bottom/cover no-repeat;overflow:hidden}' +
    '#srv-duel .dtop{position:absolute;top:calc(10px + env(safe-area-inset-top));left:0;right:0;text-align:center;font-weight:700;text-shadow:0 2px 3px #000}' +
    '#srv-duel .dtime{font-size:26px;color:#ffe08a}#srv-duel .dvs{font-size:13px;opacity:.9}' +
    '#srv-duel .df{position:absolute;top:calc(64px + env(safe-area-inset-top));width:38%;text-align:center}#srv-duel .df.L{left:3%}#srv-duel .df.R{right:3%}' +
    '#srv-duel .dbar{position:relative;height:17px;border-radius:8px;background:#0008;border:1px solid #000;margin:3px auto;width:88%;overflow:hidden}' +
    '#srv-duel .dbar i{position:absolute;left:0;top:0;bottom:0;z-index:1;transition:width .2s}#srv-duel .dbar b{position:relative;z-index:2;display:block;color:#fff;font-weight:700;font-size:11px;line-height:17px;text-shadow:0 1px 2px #000}' +
    '#srv-duel .dhp i{background:linear-gradient(#ff6b6b,#b91c1c)}#srv-duel .dmp i{background:linear-gradient(#60a5fa,#1d4ed8)}' +
    '#srv-duel .dname{font-weight:700;font-size:14px;text-shadow:0 2px 3px #000}#srv-duel .dcls{font-size:11px;opacity:.9;text-shadow:0 1px 2px #000}' +
    '#srv-duel .dfield{position:absolute;left:0;right:0;bottom:calc(74px + 17%);height:200px;z-index:3;pointer-events:none}' +
    '#srv-duel .dspr{position:absolute;bottom:0;width:130px;height:170px;margin-left:-65px;display:flex;align-items:flex-end;justify-content:center;transition:left .2s linear}' +
    '#srv-duel .dspr img{max-height:160px;max-width:130px;filter:drop-shadow(0 6px 4px #0007)}#srv-duel .dspr.flip img{transform:scaleX(-1)}' +
    '#srv-duel .dspr.cloaked{opacity:.3}#srv-duel .dspr.dead img{filter:grayscale(1) brightness(.6);opacity:.7}' +
    '#srv-duel .dspr.stun::after{content:"💫";position:absolute;left:50%;top:-4px;margin-left:-16px;font-size:30px;line-height:1}' +
    '#srv-duel .dspr.poison img{filter:sepia(.5) saturate(2.4) hue-rotate(230deg) drop-shadow(0 0 7px #b25aff)}' +
    '#srv-duel .dpop{position:absolute;left:50%;top:30%;transform:translateX(-50%);font-weight:900;font-size:19px;white-space:nowrap;text-shadow:0 0 3px #000,0 1px 2px #000;pointer-events:none;animation:srvDuelPop 1s ease-out forwards}' +
    '@keyframes srvDuelPop{0%{opacity:0;margin-top:10px}12%{opacity:1}100%{opacity:0;margin-top:-60px}}' +
    '#srv-duel .dlog{position:absolute;left:8px;width:min(56%,380px);bottom:calc(64px + env(safe-area-inset-bottom));height:17%;overflow-y:auto;font-size:11px;line-height:1.5;background:#0009;border-radius:8px;padding:5px 8px;z-index:8;-webkit-overflow-scrolling:touch}' +
    '#srv-duel .dbtns{position:absolute;left:0;right:0;bottom:calc(14px + env(safe-area-inset-bottom));display:flex;gap:10px;justify-content:center;z-index:9}' +
    '#srv-duel button{background:linear-gradient(#f5c451,#c98f20);color:#241b0f;border:0;border-radius:8px;padding:9px 18px;font-weight:700;font-size:14px}#srv-duel button.dark{background:#3a2c1a;color:#f3e9d2;border:1px solid #6e5220}' +
    '#srv-duel .dres{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);font-size:44px;font-weight:900;letter-spacing:4px;text-shadow:0 0 12px #000,0 3px 4px #000;z-index:10}';
  var root = null, fs = {}, timer = null, maxSec = 45, t0 = 0, ended = false;
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sets() { try { return typeof SPRITE_SETS !== 'undefined' ? SPRITE_SETS : {}; } catch (e) { return {}; } }
  function clsName(c) { try { return typeof CLASS_NAME !== 'undefined' && CLASS_NAME[c] || ({ knight: '騎士', mage: '法師', elf: '妖精', dark: '黑暗妖精', dragon: '龍騎士', illusion: '幻術士', warrior: '戰士', fencer: '劍士', lancer: '槍騎' }[c]) || c || ''; } catch (e) { return c || ''; } }
  function panel(side, f) {
    return '<div class="df ' + side + '"><div class="dname">' + esc(f.n) + '</div><div class="dcls">' + esc(clsName(f.cls)) + ' Lv' + f.lv + '</div>' +
      '<div class="dbar dhp"><i></i><b></b></div><div class="dbar dmp"><i></i><b></b></div></div>';
  }
  function close() { if (timer) { clearInterval(timer); timer = null; } if (root) { root.remove(); root = null; } fs = {}; }
  function sprite(side, f) {
    var d = document.createElement('div'); d.className = 'dspr' + (side === 'R' ? ' flip' : '');
    var im = document.createElement('img'); im.alt = ''; d.appendChild(im); root.querySelector('.dfield').appendChild(d);
    fs[side] = { el: d, img: im, f: f, frame: 0, clip: '' };
  }
  function draw(side, f) {
    var o = fs[side]; if (!o) return; o.f = f;
    o.el.style.left = (f.l == null ? (side === 'L' ? 12 : 88) : f.l) + '%';
    o.el.classList.toggle('cloaked', !!f.cloak); o.el.classList.toggle('dead', !!f.dead); o.el.classList.toggle('stun', !!f.stun); o.el.classList.toggle('poison', !!f.poison);
    var p = root.querySelector('.df.' + side);
    p.querySelector('.dhp i').style.width = Math.max(0, Math.min(100, f.hp / Math.max(1, f.mhp) * 100)) + '%';
    p.querySelector('.dhp b').textContent = f.hp + '/' + f.mhp;
    p.querySelector('.dmp i').style.width = Math.max(0, Math.min(100, f.mp / Math.max(1, f.mmp) * 100)) + '%';
    p.querySelector('.dmp b').textContent = f.mp + '/' + f.mmp;
  }
  // 人物動畫：照伺服器給的動作（待機/跑/攻擊/受傷…）輪播圖片
  function animate() {
    var S = sets();
    ['L', 'R'].forEach(function (side) {
      var o = fs[side]; if (!o) return; var set = S[o.f.key] || S.knight_2hsword; if (!set) return;
      var clip = o.f.dead ? 'hurt' : (o.f.clip || (o.f.mv ? 'run' : 'idle'));
      if (!set.COUNT[clip]) clip = 'idle';
      if (o.clip !== clip) { o.clip = clip; o.frame = 0; }
      var n = set.COUNT[clip] || 1; if (o.f.dead) o.frame = Math.min(o.frame, n - 1); else o.frame = (o.frame + 1) % n;
      var dim = (set.DIM || {})[clip], sc = (set.SC || {})[clip] || (set.SC || {}).all; o.img.style.width = dim && sc ? Math.round(dim[0] * sc) + 'px' : '';
      o.img.src = set.dir + clip + '/' + o.frame + '.png';
    });
    var left = Math.max(0, Math.ceil(maxSec - (Date.now() - t0) / 1000));
    var el = root && root.querySelector('.dtime'); if (el && !ended) el.textContent = left;
  }
  function logLine(ts, text) {
    if (!root) return; var box = root.querySelector('.dlog'); var near = box.scrollHeight - box.scrollTop - box.clientHeight < 30;
    var div = document.createElement('div'); div.innerHTML = '<span style="opacity:.55">[' + esc(ts) + 's]</span> ' + esc(String(text).replace(/[\u0001\u0002]/g, ''));
    box.appendChild(div); while (box.children.length > 300) box.firstChild.remove(); if (near) box.scrollTop = box.scrollHeight;
  }
  function onStart(d) {
    close(); ended = false; t0 = Date.now(); maxSec = d.max || 45;
    if (!document.getElementById('srv-duel-css')) { var st = document.createElement('style'); st.id = 'srv-duel-css'; st.textContent = css; document.head.appendChild(st); }
    root = document.createElement('div'); root.id = 'srv-duel'; if (d.bg) root.style.backgroundImage = 'url("' + String(d.bg).replace(/"/g, '') + '")';
    root.innerHTML = '<div class="dtop"><div class="dtime">' + maxSec + '</div><div class="dvs">' + esc(d.A.n) + ' VS ' + esc(d.B.n) + (d.bet ? '　賭注 ' + Number(d.bet).toLocaleString() : '') + '</div></div>' +
      panel('L', d.A) + panel('R', d.B) + '<div class="dfield"></div><div class="dlog"></div><div class="dbtns"><button data-quit>認輸</button></div>';
    document.body.appendChild(root);
    sprite('L', d.A); sprite('R', d.B); draw('L', d.A); draw('R', d.B);
    root.querySelector('[data-quit]').onclick = function () { try { socket.emit('duelQuit'); } catch (e) {} };
    timer = setInterval(animate, 90);
  }
  function onFrame(d) { if (!root || ended) return; draw('L', d.A); draw('R', d.B); }
  function onPop(d) {
    var o = fs[d.s]; if (!o) return; var p = document.createElement('div'); p.className = 'dpop';
    if (d.miss) { p.textContent = d.evade || 'MISS'; p.style.color = '#bbb'; p.style.fontSize = '15px'; }
    else if (d.heal) { p.textContent = '+' + d.dmg; p.style.color = '#7bd14a'; }
    else { p.textContent = (d.fire ? '🔥' : '') + '-' + d.dmg + (d.crit ? '!' : ''); p.style.color = d.sum ? '#d0bfff' : d.magic ? '#a5d8ff' : d.fire ? '#ff9d2e' : '#fff'; if (d.crit) p.style.fontSize = '26px'; }
    p.style.marginLeft = (Math.random() * 50 - 25) + 'px'; o.el.appendChild(p); setTimeout(function () { p.remove(); }, 1000);
  }
  function onEnd(d) {
    if (!root) return; ended = true;
    var res = document.createElement('div'); res.className = 'dres';
    res.textContent = d.res === 0 ? '平 手' : d.res > 0 ? '勝 利' : '敗 北'; res.style.color = d.res === 0 ? '#e5e7eb' : d.res > 0 ? '#ffd166' : '#ff6b6b';
    root.appendChild(res);
    root.querySelector('.dbtns').innerHTML = '<button data-again>再戰一次</button><button class="dark" data-lobby>選對手</button><button class="dark" data-out>離開</button>';
    root.querySelector('[data-out]').onclick = close;
    root.querySelector('[data-lobby]').onclick = function () { close(); try { socket.emit('openShop', 'npc_duel'); } catch (e) {} };
    root.querySelector('[data-again]').onclick = function () {
      close();
      try { if (d.bet && d.opp && !d.bot) socket.emit('pkChallenge', d.opp, d.bet); else socket.emit('duelOpp', d.bot || 'mirror'); } catch (e) {}
    };
  }
  // 競技場大廳：HTML 由伺服器的遊戲邏輯產生；這裡只負責顯示，並把設定與選對手回送給伺服器
  function onLobby(d) {
    var old = document.getElementById('mock-duel-lobby'); if (old) old.remove();
    if (!document.getElementById('srv-lobby-css')) { var st = document.createElement('style'); st.id = 'srv-lobby-css'; st.textContent = LOBBY_CSS; document.head.appendChild(st); }
    var v = document.createElement('div'); v.id = 'mock-duel-lobby'; v.innerHTML = String(d.html || ''); document.body.appendChild(v);
    var la = v.querySelector('[data-ladder-all]'); if (la) la.remove();
    v.querySelectorAll('[data-k]').forEach(function (el) { el.onchange = function () { try { socket.emit('duelSet', el.dataset.k, el.type, el.type === 'checkbox' ? el.checked : el.value); } catch (e) {} }; });
    v.querySelectorAll('[data-bc]').forEach(function (el) { el.onchange = function () { try { socket.emit('duelBc', el.dataset.bc, el.checked); } catch (e) {} }; });
    v.querySelectorAll('[data-opp]').forEach(function (el) { el.onclick = function () { v.remove(); try { socket.emit('duelOpp', el.dataset.opp); } catch (e) {} }; });
    var c = v.querySelector('[data-close]'); if (c) c.onclick = function () { v.remove(); };
  }
  // 頁面的 socket 會在登入／重連時重新建立，所以每次都檢查有沒有掛上
  var attached = null;
  setInterval(function () {
    var s; try { s = socket; } catch (e) { return; }
    if (!s || s === attached || typeof s.on !== 'function') return; attached = s;
    s.on('duelStart', onStart); s.on('duelFrame', onFrame); s.on('duelPop', onPop); s.on('duelLog', function (d) { logLine(d.ts, d.text); }); s.on('duelEnd', onEnd); s.on('duelLobby', onLobby);
    s.on('disconnect', function () { if (root && !ended) { ended = true; logLine('', '連線中斷，這場決鬥會依伺服器規則結算（中途離線算挑戰者輸）'); var b = root.querySelector('.dbtns'); if (b) { b.innerHTML = '<button class="dark" data-out>離開</button>'; b.querySelector('[data-out]').onclick = close; } } });
  }, 500);
})();
