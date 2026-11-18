/* Варіант 2 — мобільний застосунок */
(function(){
if (!window.Proto) return;
const {$, $$, fmtT, human, clockAt, redraw, renderSteps, onReset} = Proto;

const A = {view:'home', on:false, level:1, timer:0, zones:{body:true, feet:true}, sheet:false};
const TEMP = [0, 28, 30, 32, 34, 36, 38, 40, 42, 44];
const lv = $('#a-levels');
for (let i = 1; i <= 9; i++){ const b = document.createElement('button'); b.textContent = i; b.dataset.l = i; lv.appendChild(b); }
const CH = [[30,'30 хв'],[60,'1 год'],[120,'2 год'],[240,'4 год'],[480,'8 год'],[0,'Без таймера']];
$('#a-chips').innerHTML = CH.map(([m, t]) => `<button class="chip ${m ? '' : 'none'}" data-m="${m}">${t}</button>`).join('');
let toastT;
function toast(msg){ const t = $('#a-toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800); }
function renderApp(){
  $('#a-home').classList.toggle('hidden', A.view !== 'home');
  $('#a-app').classList.toggle('hidden', A.view !== 'app');
  $('#a-sbar').style.color = A.view === 'home' ? '#fff' : '#1f1b16';
  $('#a-screen').classList.toggle('sheet-open', A.sheet);
  const hero = $('#a-power');
  hero.classList.toggle('on', A.on);
  $('#a-hero-v').textContent = A.on ? 'Рівень ' + A.level + ' · ≈' + TEMP[A.level] + ' °C' : 'Вимкнено';
  $('#a-hero-s').textContent = A.on ? (A.timer ? 'Вимкнеться о ' + clockAt(A.timer) : 'Працює без таймера') : 'Торкніться, щоб увімкнути';
  lv.classList.toggle('disabled', !A.on);
  $$('button', lv).forEach(b => { const l = +b.dataset.l; b.classList.toggle('sel', A.on && l === A.level); b.classList.toggle('fill', A.on && l < A.level); });
  $('#a-level-val').textContent = A.on ? A.level + ' з 9' : '';
  const tv = $('#a-timer-val'); tv.textContent = human(A.timer) + ' ›'; tv.classList.toggle('set', !!A.timer);
  $$('.zone').forEach(z => z.classList.toggle('on', A.zones[z.dataset.zone]));
  $$('.chip').forEach(c => c.classList.toggle('sel', !!A.timer && +c.dataset.m === A.timer));
  renderSteps('steps-app', [
    ['Відкрити застосунок "Ковдра"', A.view === 'app' || A.on],
    ['Увімкнути нагрів', A.on],
    ['Обрати рівень 3', A.on && A.level === 3],
    ['Відкрити "Таймер вимкнення"', A.sheet || !!A.timer],
    ['Обрати "1 год"', A.timer === 60],
  ]);
  redraw();
}
$('#a-open').addEventListener('click', () => { A.view = 'app'; renderApp(); });
$$('[data-other]').forEach(b => b.addEventListener('click', () => toast('Цей застосунок поза сценарієм')));
$('#a-homebtn').addEventListener('click', () => { A.view = 'home'; A.sheet = false; renderApp(); });
$('#a-power').addEventListener('click', () => { A.on = !A.on; renderApp(); });
lv.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (!A.on){ toast('Спочатку увімкніть нагрів'); return; } A.level = +b.dataset.l; renderApp(); });
$$('.zone').forEach(z => z.addEventListener('click', () => { A.zones[z.dataset.zone] = !A.zones[z.dataset.zone]; renderApp(); }));
$('#a-timer-row').addEventListener('click', () => { A.sheet = true; renderApp(); });
$('#a-sched').addEventListener('click', () => toast('Розклад поза межами сценарію'));
$('#a-scrim').addEventListener('click', () => { A.sheet = false; renderApp(); });
$('#a-chips').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; A.timer = +c.dataset.m; A.sheet = false; renderApp(); });

function reset(){ Object.assign(A, {view:'home', on:false, level:1, timer:0, zones:{body:true, feet:true}, sheet:false}); renderApp(); }
onReset(reset);

window.proto = {setLaw: Proto.setLaw, reset, A};
renderApp();
})();
