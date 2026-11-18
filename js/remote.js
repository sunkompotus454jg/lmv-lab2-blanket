/* Варіант 1 — фізичний пульт */
(function(){
if (!window.Proto) return;
const {$, $$, SLOW, fmtT, human, clockAt, redraw, renderSteps, onReset} = Proto;

const R = {on:false, level:1, timer:0, light:false, flash:0};
const TIMERS = [0, 30, 60, 120, 240, 480];
const bars = $('#r-bars');
for (let i = 1; i <= 9; i++){ const b = document.createElement('i'); b.style.height = (6 + i*1.8) + 'px'; bars.appendChild(b); }
let flashT;
function flash(){ R.flash = 1; clearTimeout(flashT); flashT = setTimeout(() => { R.flash = 0; renderRemote(); }, 7000); }
function renderRemote(){
  const lcd = $('#r-lcd');
  lcd.classList.toggle('off', !R.on);
  lcd.classList.toggle('lit', R.light || !!R.flash);
  $('#r-pow').textContent = R.on ? 'УВІМК' : 'ВИМК';
  $('#r-level').textContent = R.on ? R.level : '–';
  $('#r-timer').textContent = R.on ? fmtT(R.timer) : '--:--';
  $$('i', bars).forEach((b, i) => b.classList.toggle('on', R.on && i < R.level));
  $('#r-power').classList.toggle('is-on', R.on);
  renderSteps('steps-remote', [
    ['Увімкнути ковдру (⏻)', R.on],
    ['Рівень 3 (двічі «+»)', R.on && R.level === 3],
    ['Таймер 1:00 (двічі «Таймер»)', R.on && R.timer === 60],
  ]);
  redraw();
}
$('#r-power').addEventListener('click', () => { R.on = !R.on; if (R.on){ R.level = 1; R.timer = 0; } flash(); renderRemote(); });
$('#r-plus').addEventListener('click', () => { if (R.on) R.level = Math.min(9, R.level + 1); flash(); renderRemote(); });
$('#r-minus').addEventListener('click', () => { if (R.on) R.level = Math.max(1, R.level - 1); flash(); renderRemote(); });
$('#r-timerbtn').addEventListener('click', () => { if (R.on) R.timer = TIMERS[(TIMERS.indexOf(R.timer) + 1) % TIMERS.length]; flash(); renderRemote(); });
$('#r-light').addEventListener('click', () => { R.light = !R.light; renderRemote(); });

function reset(){ Object.assign(R, {on:false, level:1, timer:0, light:false, flash:0}); clearTimeout(flashT); renderRemote(); }
onReset(reset);

window.proto = {setLaw: Proto.setLaw, reset, R};
renderRemote();
})();
