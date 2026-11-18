/* Варіант 3 — голосове керування */
(function(){
if (!window.Proto) return;
const {$, $$, SLOW, fmtT, human, clockAt, redraw, renderSteps, onReset} = Proto;

const V = {on:false, level:1, timer:0, phase:'idle', woke:false, said:''};
const ORD = [[/(^|\s)(1|перш|одиниц)/,1],[/(^|\s)(2|друг)/,2],[/(^|\s)(3|трет)/,3],[/(^|\s)(4|четверт)/,4],[/(^|\s)(5|п.?ят)/,5],[/(^|\s)(6|шост)/,6],[/(^|\s)(7|сьом)/,7],[/(^|\s)(8|восьм)/,8],[/(^|\s)(9|дев.?ят|максим)/,9]];
function parse(raw){
  const t = ' ' + raw.toLowerCase().replace(/[’ʼ`]/g, "'").replace(/[.,!?«»"]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const ch = {}; let ok = false;
  if (/вимкн/.test(t)) { ch.on = false; ok = true; }
  else {
    if (/увімкн|включ|рівень|тепл|холод|таймер|годин|ніч|хвилин/.test(t)) ok = true;
    let tmr = null;
    if (/без таймер|скасу/.test(t)) tmr = 0;
    else if (/всю ніч|8 год|вісім год/.test(t)) tmr = 480;
    else if (/чотири год|4 год/.test(t)) tmr = 240;
    else if (/дві год|2 год/.test(t)) tmr = 120;
    else if (/півгод|30 хв|тридцять/.test(t)) tmr = 30;
    else if (/годин/.test(t)) tmr = 60;
    const lvlPart = t.replace(/на [^ ]* ?год[^ ]*|на всю ніч|на півгодини|на \d+ хв[^ ]*/g, ' ');
    let lvl = null;
    for (const [re, n] of ORD) if (re.test(lvlPart)) { lvl = n; break; }
    if (/тепліш/.test(t)) lvl = Math.min(9, (V.on ? V.level : 1) + 1);
    if (/холодніш|прохолодніш/.test(t)) lvl = Math.max(1, (V.on ? V.level : 1) - 1);
    if (ok) ch.on = true;
    if (lvl) ch.level = lvl;
    if (tmr !== null) ch.timer = tmr;
  }
  return ok ? ch : null;
}
let vt = [];
const later = (fn, ms) => vt.push(setTimeout(fn, ms * SLOW));
function clearV(){ vt.forEach(clearTimeout); vt = []; }
function renderVoice(){
  const s = $('#v-scr');
  s.className = 'scr p-' + V.phase;
  const P = {
    idle: ['Скажіть «Ковдро…»', 'і одразу всю команду — рівень і таймер'],
    listening: ['Слухаю…', V.viaHint ? 'ключове слово розпізнано — кажіть команду' : (V.rec ? 'говоріть українською' : 'у прототипі — оберіть підказку нижче')],
    processing: ['Розпізнаю…', ''],
    done: ['Готово', V.reply || ''],
    error: ['Не зрозуміла', 'Спробуйте: «Ковдро, третій рівень на годину»'],
  }[V.phase];
  $('#v-prompt').textContent = P[0];
  $('#v-sub').textContent = P[1];
  const says = $('#v-says');
  says.textContent = V.said ? '«' + V.said + '»' : '—';
  says.classList.toggle('empty', !V.said);
  $('#v-st').classList.toggle('on', V.on);
  $('#v-st-t').textContent = V.on ? 'Ковдра увімкнена' : 'Ковдра вимкнена';
  $('#v-state').innerHTML = V.on
    ? `<span class="hot">Рівень ${V.level}</span><span class="${V.timer ? 'hot' : ''}">Таймер ${V.timer ? fmtT(V.timer) : 'вимк.'}</span><span>Тіло + ноги</span>`
    : '<span>Вимкнено</span>';
  renderSteps('steps-voice', [
    ['Сказати «Ковдро» (активація)', V.woke],
    ['Сказати команду', !!V.said && !['listening','idle'].includes(V.phase)],
    ['Рівень 3 встановлено', V.on && V.level === 3],
    ['Таймер 1:00 встановлено', V.on && V.timer === 60],
  ]);
  redraw();
}
function apply(text){
  V.said = 'Ковдро, ' + text;
  V.phase = 'processing'; renderVoice();
  later(() => {
    const ch = parse(text);
    if (!ch){ V.phase = 'error'; renderVoice(); return; }
    Object.assign(V, ch);
    if (ch.on === false){ V.reply = 'Ковдру вимкнено.'; V.timer = 0; }
    else V.reply = 'Рівень ' + V.level + (V.timer ? ', вимкнення через ' + human(V.timer) + ' (о ' + clockAt(V.timer) + ').' : ', без таймера.');
    V.phase = 'done'; renderVoice();
    try { if (window.speechSynthesis && !SLOW_SILENT){ const u = new SpeechSynthesisUtterance(V.reply); u.lang = 'uk-UA'; speechSynthesis.speak(u); } } catch(e) {}
  }, 1000);
}
const SLOW_SILENT = /[?&]mute/.test(location.search);
function say(text){
  clearV();
  if (V.phase === 'listening'){ apply(text); return; }
  V.woke = true; V.said = 'Ковдро…'; V.viaHint = true; V.phase = 'listening'; renderVoice();
  later(() => apply(text), 700);
}
$$('.hint').forEach(h => h.addEventListener('click', () => say(h.dataset.cmd)));
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
$('#v-mic').addEventListener('click', () => {
  clearV();
  V.woke = true; V.said = ''; V.viaHint = false; V.phase = 'listening'; V.rec = false;
  if (SR){
    try {
      const rec = new SR(); rec.lang = 'uk-UA'; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.onresult = e => { const txt = e.results[0][0].transcript.replace(/^\s*ковдр[оа],?\s*/i, ''); apply(txt); };
      rec.onerror = () => { V.rec = false; renderVoice(); };
      rec.onend = () => { if (V.phase === 'listening'){ V.rec = false; renderVoice(); } };
      rec.start(); V.rec = true;
    } catch(e) { V.rec = false; }
  }
  renderVoice();
});

function reset(){ clearV(); Object.assign(V, {on:false, level:1, timer:0, phase:'idle', woke:false, said:'', reply:''}); renderVoice(); }
onReset(reset);

window.proto = {setLaw: Proto.setLaw, reset, V};
renderVoice();
})();
