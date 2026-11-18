/* Варіант 3 — кнопки на ковдрі */
(function(){
if (!window.Proto) return;
const {$, $$, fmtT, human, clockAt, redraw, renderSteps, onReset} = Proto;

const TIMERS = [0, 30, 60, 120, 240, 480];
const B = {on:false, level:1, timer:0};
const BT = [[30,'0:30'],[60,'1 г'],[120,'2 г'],[240,'4 г'],[480,'8 г']];
$('#b-levels').innerHTML = Array.from({length:9}, (_, i) => `<span class="led"><i></i>${i+1}</span>`).join('');
$('#b-timers').innerHTML = BT.map(([m, t]) => `<span class="led" data-m="${m}"><i></i>${t}</span>`).join('');
function renderBlanket(){
  $$('#b-levels .led').forEach((l, i) => l.classList.toggle('on', B.on && i < B.level));
  $$('#b-timers .led').forEach(l => l.classList.toggle('on', B.on && +l.dataset.m === B.timer));
  $('#b-heat').classList.toggle('on', B.on);
  renderSteps('steps-blanket', [
    ['Увімкнути (натиснути "Нагрів")', B.on],
    ['Рівень 3 (ще двічі "Нагрів")', B.on && B.level === 3],
    ['Таймер 1 год (двічі "Таймер")', B.on && B.timer === 60],
  ]);
  redraw();
}
let holdT = null, held = false;
const heat = $('#b-heat');
heat.addEventListener('pointerdown', () => { held = false; clearTimeout(holdT); holdT = setTimeout(() => { held = true; B.on = false; B.timer = 0; renderBlanket(); }, 2000); });
['pointerup','pointerleave','pointercancel'].forEach(ev => heat.addEventListener(ev, () => clearTimeout(holdT)));
heat.addEventListener('click', () => {
  if (held){ held = false; return; }
  if (!B.on){ B.on = true; B.level = 1; B.timer = 0; } else B.level = B.level % 9 + 1;
  renderBlanket();
});
$('#b-timer').addEventListener('click', () => { if (!B.on) return; B.timer = TIMERS[(TIMERS.indexOf(B.timer) + 1) % TIMERS.length]; renderBlanket(); });

function reset(){ Object.assign(B, {on:false, level:1, timer:0}); renderBlanket(); }
onReset(reset);

window.proto = {setLaw: Proto.setLaw, reset, B};
renderBlanket();
})();
