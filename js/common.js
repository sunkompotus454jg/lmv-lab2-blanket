/* Спільний код для всіх сторінок: утиліти, накладки законів Фіттса/Хіка, список кроків */
(function(){
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const SLOW = /[?&]slow/.test(location.search) ? 4 : 1;
const fmtT = m => !m ? '--:--' : Math.floor(m/60) + ':' + String(m%60).padStart(2,'0');
const human = m => !m ? 'Немає' : (m < 60 ? m + ' хв' : (m/60) + ' год');
const BASE_MIN = 22*60 + 47;
const clockAt = add => { const t = (BASE_MIN + add) % 1440; return Math.floor(t/60) + ':' + String(t%60).padStart(2,'0'); };

/* ---------- старі посилання виду index.html#app ведуть на окремі сторінки ---------- */
const PAGES = {remote:'index.html', app:'app.html', blanket:'blanket.html'};
const hash = (location.hash || '').slice(1);
const current = ($('.tabs a[aria-current="page"]') || {}).dataset?.tab;
if (PAGES[hash] && hash !== current){ location.replace(PAGES[hash] + location.search); return; }

/* ---------- накладки законів (стан зберігається між сторінками) ---------- */
const LAW_KEY = 'blanket-laws';
const law = {fitts:false, hick:false};
try { Object.assign(law, JSON.parse(localStorage.getItem(LAW_KEY)) || {}); } catch(e) {}
function syncLawButtons(){
  $('#lawFitts').setAttribute('aria-pressed', String(law.fitts));
  $('#lawHick').setAttribute('aria-pressed', String(law.hick));
}
function setLaw(kind, on){
  law[kind] = on;
  try { localStorage.setItem(LAW_KEY, JSON.stringify(law)); } catch(e) {}
  syncLawButtons();
  drawMarks();
}
$('#lawFitts').addEventListener('click', () => setLaw('fitts', !law.fitts));
$('#lawHick').addEventListener('click', () => setLaw('hick', !law.hick));
syncLawButtons();

function visible(el){
  if (!el.getClientRects().length) return false;
  for (let n = el; n && n !== document.body; n = n.parentElement){
    const cs = getComputedStyle(n);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') return false;
  }
  return true;
}
function drawMarks(){
  $$('.overlay').forEach(o => o.innerHTML = '');
  const panel = $('.panel.active'); if (!panel) return;
  const stage = $('.stage', panel), ov = $('.overlay', stage);
  const sr = stage.getBoundingClientRect();
  ['fitts','hick'].forEach(kind => {
    if (!law[kind]) return;
    $$('[data-' + kind + ']', stage).forEach(el => {
      if (!visible(el)) return;
      if (window.markFilter && !el.dataset[kind].includes(window.markFilter)) return;
      const r = el.getBoundingClientRect(), pad = 7;
      const m = document.createElement('div');
      const pos = el.dataset[kind + 'Pos'] || '';
      m.className = 'mark ' + kind[0] + ' ' + pos;
      m.style.left = (r.left - sr.left - pad) + 'px';
      m.style.top = (r.top - sr.top - pad) + 'px';
      m.style.width = (r.width + pad*2) + 'px';
      m.style.height = (r.height + pad*2) + 'px';
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = (kind === 'fitts' ? 'Фіттс: ' : 'Хік: ') + el.dataset[kind];
      m.appendChild(tag);
      ov.appendChild(m);
    });
  });
}
const redraw = () => { drawMarks(); setTimeout(drawMarks, 320); };
window.addEventListener('resize', drawMarks);
document.fonts && document.fonts.ready.then(drawMarks);

function renderSteps(id, items){
  $('#' + id).innerHTML = items.map(([t, d]) => `<li class="${d ? 'done' : ''}"><span class="dot"></span><span>${t}</span></li>`).join('');
}

/* Кнопка «Скинути» на сторінці викликає reset, який передає скрипт варіанта */
function onReset(fn){
  $$('[data-reset]').forEach(b => b.addEventListener('click', fn));
}

window.Proto = {$, $$, SLOW, fmtT, human, clockAt, setLaw, drawMarks, redraw, renderSteps, onReset};
})();
