(() => {
'use strict';
const C = window.CONFIG, KEY = 'tonflow:v1', CUR = Object.keys(C.COLORS), DEC = { TON: 4, USDT: 2, BTC: 8, ETH: 6 };
const $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)];
const uid = p => p + Math.random().toString(36).slice(2, 9);
const nf = (n, d) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: d }).format(n);
const fmt = (n, c) => nf(n, DEC[c] ?? 2), usd = n => '$' + nf(n, 2), rub = n => nf(n, 2) + ' ₽';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const n = Number(String(v).replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
const rd = (n, c) => Number(n.toFixed(DEC[c] ?? 2));
const dt = t => new Date(t).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const ST = { pending: 'Ожидает оплаты', paid: 'Оплата подтверждена', done: 'Завершена', cancelled: 'Отменена' };
const NEXT = { pending: ['paid', 'cancelled'], paid: ['done', 'cancelled'], done: [], cancelled: [] };
const EMO = ['🐻', '🐷', '🐱', '🦊', '🐼', '🐸', '🐶', '🐵', '🦁', '🐰', '🐯', '🐨'];
const TG = window.Telegram && window.Telegram.WebApp, tgU = (TG && TG.initDataUnsafe && TG.initDataUnsafe.user) || null;
try { if (TG) { TG.ready(); TG.expand(); } } catch (e) { /* вне Telegram */ }
const canAdmin = () => tgU ? C.ADMIN_TG_IDS.includes(tgU.id) : C.ADMIN_DEMO;
const setVh = () => document.documentElement.style.setProperty('--vh', ((TG && TG.viewportStableHeight) || window.innerHeight) + 'px');
setVh(); window.addEventListener('resize', setVh); try { if (TG) TG.onEvent('viewportChanged', setVh); } catch (e) { /* вне Telegram */ }

/* ---------- Данные ---------- */
const seedOrders = () => [
  ['CryptoMax', '🦊', 'sell', 'TON', 487.5, 1200, 500, 50000, 'Сбербанк'],
  ['AlinaPay', '🐼', 'sell', 'TON', 491, 640, 1000, 30000, 'Тинькофф'],
  ['BlueWhale', '🌊', 'sell', 'USDT', 93.2, 5000, 1000, 100000, 'СБП'],
  ['NightTrader', '🌙', 'sell', 'USDT', 94.1, 900, 500, 20000, 'Raiffeisen'],
  ['TonKing', '💎', 'buy', 'TON', 480, 2000, 500, 60000, 'Сбербанк'],
  ['SafeDeal', '🛡️', 'buy', 'USDT', 91.8, 3000, 1000, 70000, 'СБП'],
  ['FastSwap', '🚀', 'buy', 'TON', 478.3, 800, 300, 15000, 'Тинькофф']
].map(a => ({ id: uid('o_'), ownerId: 'seed_' + a[0], nick: a[0], avatar: a[1], direction: a[2], currency: a[3], rate: a[4], availableAmount: a[5], minAmount: a[6], maxAmount: a[7], paymentMethod: a[8], status: 'active' }));
const seed = () => ({ v: 2, theme: 'light', idx: 0,
  user: { id: tgU ? 'tg_' + tgU.id : uid('u_'), username: tgU ? (String(tgU.username || tgU.first_name || 'user').replace(/[^A-Za-z0-9_А-Яа-яЁё]/g, '_') + '___').slice(0, 20) : 'user_' + Math.floor(Math.random() * 9000 + 1000), avatar: '🐻', createdAt: Date.now(), isAdmin: false },
  wallet: { id: 'w_demo', address: C.ADDR.TON, isDemo: true, balances: { TON: 0, USDT: 0, BTC: 0, ETH: 0 } },
  txs: [], orders: seedOrders(), trades: [], games: [] });
let S; try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || S.v !== 2) S = seed();
if (tgU) S.user.isAdmin = C.ADMIN_TG_IDS.includes(tgU.id);
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* приватный режим */ } };
const bal = c => S.wallet.balances[c] || 0;
const setBal = (c, v) => { S.wallet.balances[c] = Math.max(0, rd(v, c)); };
const total = () => CUR.reduce((s, c) => s + bal(c) * C.PRICES[c], 0);
const tx = (type, currency, amount, note = '') => { S.txs.unshift({ id: uid('t_'), type, currency, amount, status: 'ok', note, createdAt: Date.now() }); S.txs = S.txs.slice(0, 100); };

/* ---------- UI-утилиты ---------- */
const ic = () => window.lucide && window.lucide.createIcons();
function toast(m, t = 'ok') { const e = document.createElement('div'); e.className = 'toast ' + t; e.textContent = m; $('#toasts').append(e); setTimeout(() => e.classList.add('out'), 2400); setTimeout(() => e.remove(), 2900); }
const unlock = () => { if (!$('.mw')) document.body.classList.remove('lock'); };
function modal(title, html, mount) {
  const w = document.createElement('div'); w.className = 'mw';
  w.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div><div class="mh"><h2>${title}</h2><button class="x" data-a="x" aria-label="Закрыть"><i data-lucide="x"></i></button></div><div class="mb">${html}</div></div>`;
  document.body.append(w); document.body.classList.add('lock'); ic(); requestAnimationFrame(() => w.classList.add('in'));
  const close = () => { w.classList.remove('in'); setTimeout(() => { w.remove(); unlock(); }, 300); };
  w.addEventListener('click', e => { if (e.target === w) close(); });
  if (mount) mount(w, close); return { w, close };
}
const ask = (text, ok = 'Подтвердить') => new Promise(res => modal('Подтверждение', `<p class="mut sm">${text}</p><div class="row"><button class="btn sec" data-n>Отмена</button><button class="btn" data-y>${ok}</button></div>`, (w, close) => {
  $('[data-n]', w).onclick = () => { close(); res(false); }; $('[data-y]', w).onclick = () => { close(); res(true); };
}));
const bind = (btn, fn) => { btn.onclick = async () => { if (btn.disabled) return; btn.disabled = true; const r = await fn(); if (r === false) btn.disabled = false; }; };
const opts = (arr, sel) => arr.map(c => `<option ${c === sel ? 'selected' : ''}>${c}</option>`).join('');
const err = (w, m) => { $('[data-e]', w).textContent = m || ''; return false; };
const li = (icon, title, sub, amt, cls = '') => `<div class="li"><div class="lic"><i data-lucide="${icon}"></i></div><div class="lim"><b>${title}</b><small>${sub}</small></div>${amt ? `<div class="amt ${cls}">${amt}</div>` : ''}</div>`;
const empty = (icon, t, s) => `<div class="empty"><i data-lucide="${icon}"></i><b>${t}</b><small>${s}</small></div>`;
const TXI = { deposit: 'arrow-down-left', send: 'arrow-up-right', swap: 'repeat', trade: 'users', roulette: 'disc-3' };
const TXT = { deposit: 'Пополнение', send: 'Отправка', swap: 'Обмен', trade: 'P2P', roulette: 'Рулетка' };
const txRow = t => li(TXI[t.type], TXT[t.type] + (t.note ? ', ' + esc(t.note) : ''), dt(t.createdAt), (t.amount > 0 ? '+' : '−') + fmt(Math.abs(t.amount), t.currency) + ' ' + t.currency, t.amount > 0 ? 'pos' : 'neg');
const seg = (items, cur, a) => `<div class="seg">${items.map(([v, l]) => `<button class="${v === cur ? 'on' : ''}" data-a="${a}" data-v="${v}">${l}</button>`).join('')}</div>`;

/* ---------- Wallet ---------- */
const card = (c, i) => `<div class="card" data-i="${i}" style="background:${C.COLORS[c][0]}"><div class="ct"><div class="ci"><i data-lucide="${C.ICONS[c]}"></i></div><div><b>${C.NAMES[c]}</b><small>${c}</small></div></div><div><div class="cb">${fmt(bal(c), c)} <small>${c}</small></div><div class="cu">≈ ${usd(bal(c) * C.PRICES[c])}</div></div></div>`;
const pend = () => { const p = S.trades.filter(t => NEXT[t.status].length); return p.length ? `<small class="pend">В сделках: ${p.map(t => (t.buyerId === S.user.id ? '+' : '−') + fmt(t.amount, t.currency) + ' ' + t.currency).join(', ')}</small>` : ''; };
const walletView = () => `<header class="top"><button class="logo" data-a="logo">TON<span>FLOW</span></button><div class="tr"><button class="ib" data-a="bell" aria-label="Уведомления"><i data-lucide="bell"></i></button><button class="av" data-a="tab" data-v="profile" aria-label="Профиль">${esc(S.user.avatar)}</button></div></header>
<section class="tot"><small>Общий баланс</small><h1>${usd(total())}</h1>${pend()}</section>
<div class="stack" id="stack">${CUR.map(card).join('')}</div>
<div class="dots"><button class="ib sm" data-a="prev" aria-label="Предыдущая"><i data-lucide="chevron-left"></i></button>${CUR.map((c, i) => `<button class="dot" data-a="dot" data-v="${i}" aria-label="${c}"></button>`).join('')}<button class="ib sm" data-a="next" aria-label="Следующая"><i data-lucide="chevron-right"></i></button></div>
<div class="acts">${[['deposit', 'arrow-down-left', 'Пополнить'], ['send', 'arrow-up-right', 'Отправить'], ['swap', 'repeat', 'Обменять']].map(a => `<button class="act" data-a="${a[0]}"><span><i data-lucide="${a[1]}"></i></span>${a[2]}</button>`).join('')}</div>
<section class="glass pad"><div class="row sp"><b>Адрес пополнения</b><span class="badge" id="nt">${C.NETS[CUR[S.idx]]}</span></div><button class="addr" id="adb" data-a="copy" data-t="${C.ADDR[CUR[S.idx]]}"><span id="ad">${C.ADDR[CUR[S.idx]]}</span><i data-lucide="copy"></i></button><p class="mut sm">Автоматическое зачисление пока не подключено: переводы на этот адрес баланс в приложении не пополняют.</p></section>
<h3>Последние операции</h3><section class="glass list">${S.txs.length ? S.txs.slice(0, 5).map(txRow).join('') : empty('inbox', 'Операций пока нет', 'Пополните кошелёк или обменяйте валюту')}</section>`;
function lay(dx = 0) {
  const cards = $$('.card'), n = cards.length; if (!n) return;
  cards.forEach((el, i) => { const d = (i - S.idx + n) % n; el.style.zIndex = n - d; el.style.opacity = d > 2 ? 0 : 1;
    el.style.transform = d === 0 ? `translateX(${dx}px) rotate(${dx / 18}deg)` : `translateY(${d * 16}px) scale(${1 - d * .06})`; });
  $('#view').style.setProperty('--accent', C.COLORS[CUR[S.idx]][1]); $$('.dot').forEach((x, i) => x.classList.toggle('on', i === S.idx));
  const ab = $('#adb'); if (ab) { const c = CUR[S.idx]; ab.dataset.t = C.ADDR[c]; $('#ad', ab).textContent = C.ADDR[c]; const nt = $('#nt'); if (nt) nt.textContent = C.NETS[c]; }
}
const goCard = k => { S.idx = (S.idx + k + CUR.length) % CUR.length; save(); lay(); };
function mountStack() {
  const st = $('#stack'); if (!st) return; let x0 = null, dx = 0;
  st.onpointerdown = e => { x0 = e.clientX; dx = 0; st.setPointerCapture(e.pointerId); $$('.card')[S.idx].style.transition = 'none'; };
  st.onpointermove = e => { if (x0 === null) return; dx = e.clientX - x0; lay(dx); };
  const end = () => { if (x0 === null) return; $$('.card')[S.idx].style.transition = ''; const d = dx; x0 = null; dx = 0; Math.abs(d) > 50 ? goCard(d < 0 ? 1 : -1) : lay(); };
  st.onpointerup = end; st.onpointercancel = end; lay();
}
function deposit() {
  modal('Пополнить', `<label>Валюта<select class="in" id="c">${opts(CUR, CUR[S.idx])}</select></label><small id="nt"></small><button class="addr" id="ad2" data-a="copy"></button><p class="mut sm">Автоматическое зачисление пока не подключено: переводы на этот адрес баланс в приложении не пополняют.</p>`, (w) => {
    const up = () => { const c = $('#c', w).value, b = $('#ad2', w); $('#nt', w).textContent = C.NETS[c]; b.dataset.t = C.ADDR[c]; b.innerHTML = `<span>${C.ADDR[c]}</span><i data-lucide="copy"></i>`; ic(); }; up(); $('#c', w).onchange = up;
  });
}
function send() {
  modal('Отправить', `<label>Валюта<select class="in" id="c">${opts(CUR, CUR[S.idx])}</select></label><small id="av"></small><label style="margin-top:10px">Адрес получателя<input class="in" id="ad" placeholder="UQ…" autocomplete="off"></label><label>Сумма<input class="in" id="a" inputmode="decimal" placeholder="0.00"></label><div class="err" data-e></div><button class="btn" id="go">Отправить</button>`, (w, close) => {
    const av = () => { $('#av', w).textContent = `Доступно: ${fmt(bal($('#c', w).value), $('#c', w).value)} ${$('#c', w).value}`; }; av(); $('#c', w).onchange = av;
    bind($('#go', w), async () => { const c = $('#c', w).value, a = num($('#a', w).value), ad = $('#ad', w).value.trim();
      if (!/^[A-Za-z0-9_-]{8,70}$/.test(ad)) return err(w, 'Адрес: 8–70 символов, только буквы, цифры, _ и -');
      if (Object.values(C.ADDR).includes(ad)) return err(w, 'Нельзя отправить на адрес пополнения');
      if (!(a > 0)) return err(w, 'Введите сумму больше нуля'); if (a > bal(c)) return err(w, 'Недостаточно средств');
      if (!await ask(`Отправить ${fmt(a, c)} ${c} на ${esc(ad.slice(0, 10))}…?`)) return false;
      setBal(c, bal(c) - a); tx('send', c, -a, 'на ' + ad.slice(0, 6) + '…'); save(); close(); render(); toast('Отправка выполнена'); });
  });
}
function swap() {
  modal('Обменять', `<div class="row"><label>Отдаёте<select class="in" id="f">${opts(CUR, CUR[S.idx])}</select></label><label>Получаете<select class="in" id="t">${opts(CUR, CUR[(S.idx + 1) % CUR.length])}</select></label></div><label>Сумма<input class="in" id="a" inputmode="decimal" placeholder="0.00"></label><div class="sum"><div><span>Доступно</span><b id="av"></b></div><div><span>Комиссия ${C.SWAP_FEE * 100}%</span><b id="fe">0</b></div><div><span>Вы получите</span><b id="out">0</b></div></div><div class="err" data-e></div><button class="btn" id="go">Обменять</button>`, (w, close) => {
    const calc = () => { const f = $('#f', w).value, t = $('#t', w).value, a = num($('#a', w).value) || 0, o = rd(a * C.PRICES[f] / C.PRICES[t] * (1 - C.SWAP_FEE), t);
      $('#av', w).textContent = fmt(bal(f), f) + ' ' + f; $('#fe', w).textContent = fmt(a * C.SWAP_FEE, f) + ' ' + f; $('#out', w).textContent = fmt(o, t) + ' ' + t; return o; };
    ['#f', '#t', '#a'].forEach(s => $(s, w).oninput = calc); calc();
    bind($('#go', w), async () => { const f = $('#f', w).value, t = $('#t', w).value, a = num($('#a', w).value), o = calc();
      if (f === t) return err(w, 'Выберите разные валюты'); if (!(a > 0)) return err(w, 'Введите сумму больше нуля'); if (a > bal(f)) return err(w, 'Недостаточно средств'); if (!(o > 0)) return err(w, 'Сумма слишком мала');
      if (!await ask(`Обменять ${fmt(a, f)} ${f} на ${fmt(o, t)} ${t}?`)) return false;
      setBal(f, bal(f) - a); setBal(t, bal(t) + o); tx('swap', f, -a, '→ ' + t); tx('swap', t, o, f + ' →'); save(); close(); render(); toast('Обмен выполнен'); });
  });
}

/* ---------- P2P ---------- */
const U = { cur: 'ALL', dir: 'sell', q: '', asc: true };
const p2pView = () => `<h1 class="pt">P2P</h1>${seg([['sell', 'Купить'], ['buy', 'Продать']], U.dir, 'dir')}${seg([['ALL', 'Все'], ['TON', 'TON'], ['USDT', 'USDT']], U.cur, 'pcur')}<div class="row"><input class="in" data-in="q" placeholder="Ник, банк, валюта" value="${esc(U.q)}" aria-label="Поиск"><button class="ib" data-a="sort" aria-label="Сортировка по цене"><i data-lucide="${U.asc ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow'}"></i></button></div><div id="plist"></div>${S.trades.some(t => NEXT[t.status].length) ? `<h3>Активные сделки</h3><section class="glass list">${S.trades.filter(t => NEXT[t.status].length).map(tradeRow).join('')}</section>` : ''}`;
function drawList() {
  const q = U.q.trim().toLowerCase(), buy = U.dir === 'sell';
  const L = S.orders.filter(o => o.status === 'active' && o.availableAmount > 0 && o.direction === U.dir && (U.cur === 'ALL' || o.currency === U.cur) && (!q || (o.nick + o.paymentMethod + o.currency).toLowerCase().includes(q))).sort((a, b) => U.asc ? a.rate - b.rate : b.rate - a.rate);
  $('#plist').innerHTML = L.length ? L.map(o => `<article class="glass oc"><div class="oh"><span class="av">${esc(o.avatar)}</span><b>${esc(o.nick)}</b><span class="rate">${rub(o.rate)}</span></div><div class="meta"><span class="chip">${o.currency}</span><span class="chip">Доступно ${fmt(o.availableAmount, o.currency)}</span><span class="chip">${nf(o.minAmount, 0)}–${nf(o.maxAmount, 0)} ₽</span><span class="chip">${esc(o.paymentMethod)}</span></div><button class="btn" data-a="order" data-v="${o.id}">${buy ? 'Купить' : 'Продать'} ${o.currency}</button></article>`).join('') : empty('search-x', 'Ордеров не найдено', 'Измените фильтры или поисковый запрос');
  ic();
}
function openOrder(id) {
  const o = S.orders.find(x => x.id === id); if (!o) return toast('Ордер уже недоступен', 'err'); const buying = o.direction === 'sell', c = o.currency;
  modal(`${buying ? 'Купить' : 'Продать'} ${c}`, `<div class="oh"><span class="av">${esc(o.avatar)}</span><b>${esc(o.nick)}</b><span class="rate">${rub(o.rate)}</span></div><div class="meta"><span class="chip">Доступно ${fmt(o.availableAmount, c)} ${c}</span><span class="chip">${nf(o.minAmount, 0)}–${nf(o.maxAmount, 0)} ₽</span><span class="chip">${esc(o.paymentMethod)}</span></div><label>Сумма в рублях<input class="in" id="a" inputmode="decimal" placeholder="${nf(o.minAmount, 0)}"></label><div class="sum"><div><span>Количество</span><b id="q">0</b></div><div><span>Комиссия ${C.FEE * 100}%</span><b id="fe">0</b></div><div><span>${buying ? 'Вы получите' : 'Спишется'}</span><b id="tt">0</b></div></div><div class="err" data-e></div><button class="btn" id="go">Создать сделку</button><p class="mut sm">Оплату подтверждает администратор или backend. Вы не можете отметить её сами.</p>`, (w, close) => {
    const calc = () => { const a = num($('#a', w).value) || 0, q = rd(a / o.rate, c), f = rd(q * C.FEE, c); $('#q', w).textContent = fmt(q, c) + ' ' + c; $('#fe', w).textContent = fmt(f, c) + ' ' + c; $('#tt', w).textContent = fmt(buying ? q - f : q + f, c) + ' ' + c; return { a, q, f }; };
    $('#a', w).oninput = calc;
    bind($('#go', w), async () => { const { a, q, f } = calc();
      if (!(a > 0)) return err(w, 'Введите сумму'); if (a < o.minAmount || a > o.maxAmount) return err(w, `Сумма должна быть от ${nf(o.minAmount, 0)} до ${nf(o.maxAmount, 0)} ₽`);
      if (q > o.availableAmount) return err(w, 'Объём ордера меньше запрошенного'); if (!buying && q + f > bal(c)) return err(w, 'Недостаточно средств для продажи');
      if (!await ask(`Создать сделку на ${rub(a)} (${fmt(q, c)} ${c})?`)) return false;
      if (!buying) { setBal(c, bal(c) - q - f); tx('trade', c, -(q + f), 'заморожено'); }
      o.availableAmount = rd(o.availableAmount - q, c);
      S.trades.unshift({ id: uid('d_'), orderId: o.id, buyerId: buying ? S.user.id : o.ownerId, sellerId: buying ? o.ownerId : S.user.id, amount: q, fee: f, currency: c, total: a, status: 'pending', createdAt: Date.now() });
      save(); close(); render(); toast('Сделка создана. Статус смотрите в профиле'); });
  });
}
function setTrade(t, st) {
  if (!NEXT[t.status].includes(st)) return false; const o = S.orders.find(x => x.id === t.orderId), mine = t.buyerId === S.user.id, c = t.currency;
  if (st === 'cancelled') { if (!mine) setBal(c, bal(c) + t.amount + t.fee), tx('trade', c, t.amount + t.fee, 'возврат'); if (o) o.availableAmount = rd(o.availableAmount + t.amount, c); }
  if (st === 'done' && mine) { setBal(c, bal(c) + t.amount - t.fee); tx('trade', c, t.amount - t.fee, 'покупка'); }
  t.status = st; save(); return true;
}

/* ---------- Roulette ---------- */
const RC0 = C.ROULETTE, segs = () => S.rc || RC0.segments;
const minB = c => rd(Math.ceil(RC0.minBetUsd / C.PRICES[c] * 100) / 100, c), maxB = c => rd(RC0.maxBetUsd / C.PRICES[c], c);
const bu = x => '≈ ' + usd(x * C.PRICES[RC]) + ', минимум $' + RC0.minBetUsd;
let spinning = false, wrot = 0, RC = RC0.currencies[0], lastBet = 10;
const segColor = m => m === 0 ? '#13243F' : m < 1 ? '#1D4F8F' : m < 3 ? '#248BFA' : '#54B8FF';
function rouletteView() {
  const s = segs(), a = 360 / s.length, grad = s.map((x, i) => `${segColor(x.m)} ${i * a}deg ${(i + 1) * a}deg`).join(',');
  return `<h1 class="pt">Roulette</h1>${seg(RC0.currencies.map(c => [c, c]), RC, 'rcur')}
<section class="rpanel"><div class="row sp"><div><small>Баланс</small><b class="rbal" id="rb">${fmt(bal(RC), RC)} ${RC}</b></div></div>
<div class="wheel-wrap"><div class="ptr"></div><div class="wheel" id="wheel" style="background:conic-gradient(${grad});transform:rotate(${wrot}deg)">${s.map((x, i) => `<div class="wl" style="transform:rotate(${i * a + a / 2}deg)">${x.m ? '×' + x.m : '✕'}</div>`).join('')}</div><div class="hub">TF</div></div>
<label>Ставка, ${RC}<input class="in" id="bet" data-in="bet" inputmode="decimal" value="${lastBet}"></label><small id="bu">${bu(num(lastBet) || 0)}</small>
<div class="qb"><button data-a="bq" data-v="min">Мин</button><button data-a="bq" data-v="half">½</button><button data-a="bq" data-v="dbl">×2</button><button data-a="bq" data-v="max">Макс</button></div><div class="err" data-e></div><button class="btn spin" id="spin" data-a="spin" ${spinning ? 'disabled' : ''}>SPIN</button></section>
<h3>Последние результаты</h3><div class="hist">${S.games.length ? S.games.slice(0, 12).map(g => `<span class="hc ${g.payout > g.bet ? 'pos' : g.payout < g.bet ? 'neg' : ''}">×${g.result}, ${g.currency}</span>`).join('') : '<small>Игр пока не было</small>'}</div>`;
}
function spin() {
  if (spinning) return; const w = $('#view'), bet = num($('#bet').value), c = RC, setE = m => { $('[data-e]', w).textContent = m; };
  if (!(bet >= minB(c))) return setE(`Минимальная ставка $${RC0.minBetUsd} (${fmt(minB(c), c)} ${c})`); if (bet > maxB(c)) return setE(`Максимальная ставка $${RC0.maxBetUsd}`); if (bet > bal(c)) return setE('Недостаточно средств');
  setE(''); lastBet = bet; spinning = true; $('#spin').disabled = true;
  const S0 = segs(), sum = S0.reduce((s, x) => s + x.w, 0); let r = Math.random() * sum, i = 0; while (i < S0.length - 1 && (r -= S0[i].w) >= 0) i++;
  const a = 360 / S0.length, center = i * a + a / 2 + (Math.random() - .5) * a * .6;
  wrot += 360 * 5 + (((360 - center) - (wrot % 360)) + 360) % 360; $('#wheel').style.transform = `rotate(${wrot}deg)`;
  setTimeout(() => settle(S0[i].m, bet, c), 4400);
}
function settle(m, bet, c) {
  spinning = false; if (bet > bal(c)) { toast('Баланс изменился, ставка отменена', 'err'); if (tab === 'roulette') render(); return; }
  const payout = rd(bet * m, c), net = rd(payout - bet, c); setBal(c, bal(c) + net);
  S.games.unshift({ id: uid('g_'), currency: c, bet, result: m, payout, createdAt: Date.now() }); S.games = S.games.slice(0, 50); tx('roulette', c, net, '×' + m); save();
  if (tab === 'roulette') render();
  modal(net > 0 ? 'Выигрыш' : net === 0 ? 'Ставка возвращена' : 'Не повезло', `<div class="res ${net > 0 ? 'pos' : net < 0 ? 'neg' : ''}"><b>×${m}</b><span>${net >= 0 ? '+' : '−'}${fmt(Math.abs(net), c)} ${c}</span></div><p class="mut sm" style="text-align:center">Тестовые средства. Реальные выплаты не предусмотрены.</p><button class="btn" data-a="x">Ок</button>`);
}

/* ---------- Profile ---------- */
const tradeRow = t => { const buy = t.buyerId === S.user.id;
  return `<div class="li"><div class="lic"><i data-lucide="handshake"></i></div><div class="lim"><b>${buy ? 'Покупка' : 'Продажа'} ${fmt(t.amount, t.currency)} ${t.currency}</b><small>${dt(t.createdAt)}, ${rub(t.total)}</small></div><div style="text-align:right"><span class="st ${t.status}">${ST[t.status]}</span>${t.status === 'pending' ? `<br><button class="btn danger s" style="margin-top:6px" data-a="tcancel" data-v="${t.id}">Отменить</button>` : ''}${S.user.isAdmin && NEXT[t.status].length && NEXT[t.status][0] !== 'cancelled' ? `<br><button class="btn sec s" style="margin-top:6px" data-a="tnext" data-v="${t.id}">${ST[NEXT[t.status][0]]}</button>` : ''}</div></div>`; };
const profileView = () => `<h1 class="pt">Профиль</h1>
<section class="glass pad" style="margin-top:0"><div class="oh"><span class="av" style="width:56px;height:56px;font-size:28px">${esc(S.user.avatar)}</span><div style="flex:1;min-width:0"><b style="display:block;overflow:hidden;text-overflow:ellipsis">@${esc(S.user.username)}</b><small>ID ${S.user.id}</small></div><button class="ib" data-a="edit" aria-label="Редактировать"><i data-lucide="pencil"></i></button></div>
<div class="sum"><div><span>Регистрация</span><b>${dt(S.user.createdAt)}</b></div><div><span>Баланс</span><b>${usd(total())}</b></div></div></section>
<h3>История операций</h3><section class="glass list">${S.txs.length ? S.txs.slice(0, 20).map(txRow).join('') : empty('inbox', 'Пока пусто', 'Здесь появятся ваши операции')}</section>
<h3>P2P-сделки</h3><section class="glass list">${S.trades.length ? S.trades.map(tradeRow).join('') : empty('handshake', 'Сделок нет', 'Откройте вкладку P2P и выберите ордер')}</section>
<h3>Настройки</h3><section class="glass pad" style="margin-top:8px"><small>Тема</small>${seg([['light', 'Светлая'], ['auto', 'Авто'], ['dark', 'Тёмная']], S.theme, 'theme')}
${S.user.isAdmin ? '<button class="btn sec" data-a="admin" style="margin-bottom:10px">Админ-панель</button><button class="btn sec" data-a="alogout" style="margin-bottom:10px">Выйти из админ-режима</button>' : ''}
<button class="btn sec" data-a="reset">Сбросить данные</button><p class="mut sm">Баланс и сделки хранятся на этом устройстве и не связаны с реальными кошельками.</p></section>`;
function editProfile() {
  let av = S.user.avatar;
  modal('Профиль', `<label>Имя<input class="in" id="u" maxlength="20" value="${esc(S.user.username)}"></label><small>Аватар</small><div class="emo" style="margin-top:8px">${EMO.map(e => `<button data-e2="${e}" class="${e === av ? 'on' : ''}">${e}</button>`).join('')}</div><div class="err" data-e></div><button class="btn" id="go">Сохранить</button>`, (w, close) => {
    $$('[data-e2]', w).forEach(b => b.onclick = () => { av = b.dataset.e2; $$('[data-e2]', w).forEach(x => x.classList.toggle('on', x === b)); });
    bind($('#go', w), () => { const u = $('#u', w).value.trim(); if (!/^[A-Za-z0-9_А-Яа-яЁё]{3,20}$/.test(u)) return err(w, 'Имя: 3–20 символов, буквы, цифры и _');
      S.user.username = u; S.user.avatar = av; save(); close(); render(); toast('Профиль обновлён'); });
  });
}

/* ---------- Админ ---------- */
let taps = 0, tapT = 0, AT = 'orders';
const adminDraw = () => render();
function adminLogin() {
  modal('Вход администратора', `<label>Код доступа<input class="in" id="p" type="password" placeholder="От 4 символов" autocomplete="off"></label><div class="err" data-e></div><button class="btn" id="go">Войти</button>`, (w, close) => {
    bind($('#go', w), () => { if (!canAdmin()) return err(w, 'Нет доступа'); if ($('#p', w).value.length < 4) return err(w, 'Минимум 4 символа');
      S.user.isAdmin = true; save(); close(); toast('Режим администратора включён'); adminPanel(); });
  });
}
const oddsHTML = () => { const s = segs(), sum = s.reduce((a, x) => a + x.w, 0) || 1, rtp = s.reduce((a, x) => a + x.m * x.w, 0) / sum;
  return `<section class="glass pad" style="margin-top:0"><p class="mut sm" style="margin-top:0">Множитель и вес каждого сектора. Возврат игрокам (RTP): <b>${nf(rtp * 100, 1)}%</b></p>${s.map((x, i) => `<div class="row" style="margin-bottom:8px"><span class="chip" style="flex:none;width:34px;text-align:center">${i + 1}</span><input class="in" data-rm="${i}" value="${x.m}" inputmode="decimal" aria-label="Множитель"><input class="in" data-rw="${i}" value="${x.w}" inputmode="decimal" aria-label="Вес"><b style="flex:none;width:56px;text-align:right">${nf(x.w / sum * 100, 1)}%</b></div>`).join('')}<div class="err" data-e2x></div><div class="row"><button class="btn sec" data-a="rreset">Сбросить</button><button class="btn" data-a="rsave">Сохранить</button></div></section>`; };
const adminBody = () => {
  if (AT === 'roul') return oddsHTML();
  if (AT === 'bal') return `<section class="glass pad" style="margin-top:0"><p class="mut sm" style="margin-top:0">Баланс на этом устройстве.</p>${CUR.map(c => `<label>${c}<input class="in" data-b="${c}" inputmode="decimal" value="${bal(c)}"></label>`).join('')}<div class="err" data-eb></div><button class="btn" data-a="bsave">Сохранить баланс</button></section>`;
  if (AT === 'trades') return S.trades.length ? `<section class="glass list" style="margin-top:0">${S.trades.map(t => `<div class="li" style="flex-wrap:wrap"><div class="lim"><b>${t.buyerId === S.user.id ? 'Покупка' : 'Продажа'} ${fmt(t.amount, t.currency)} ${t.currency}</b><small>${dt(t.createdAt)}, ${rub(t.total)}</small></div><span class="st ${t.status}">${ST[t.status]}</span>${NEXT[t.status].length ? `<div class="row" style="flex-basis:100%">${NEXT[t.status].map(x => `<button class="btn sec s" data-a="tset" data-v="${t.id}:${x}">${ST[x]}</button>`).join('')}</div>` : ''}</div>`).join('')}</section>` : empty('handshake', 'Сделок нет', 'Они появятся после покупки на вкладке P2P');
  return `<section class="glass pad" style="margin-top:0"><h3 style="margin:0 0 12px">Новый ордер</h3><label>Ник<input class="in" id="an2" maxlength="20" value="TONFLOW"></label><small>Аватар</small><div class="emo" style="margin:8px 0 14px">${C.AVATARS.map((e, i) => `<button data-a="av" data-av="${e}" class="${i ? '' : 'on'}">${e}</button>`).join('')}</div>
<div class="row"><label>Валюта<select class="in" id="ac">${opts(['TON', 'USDT'])}</select></label><label>Направление<select class="in" id="ad"><option value="sell">Продаёт крипту</option><option value="buy">Покупает крипту</option></select></label></div>
<div class="row"><label>Курс, ₽<input class="in" id="ar" inputmode="decimal"></label><label>Объём<input class="in" id="av" inputmode="decimal"></label></div>
<div class="row"><label>Мин, ₽<input class="in" id="an" inputmode="decimal"></label><label>Макс, ₽<input class="in" id="ax" inputmode="decimal"></label></div>
<label>Способ оплаты<input class="in" id="ap" maxlength="30"></label><div class="err" data-e></div><button class="btn" data-a="ocreate">Создать ордер</button></section>
<h3>Ордера (${S.orders.length})</h3>${S.orders.length ? S.orders.map(o => `<article class="glass oc"><div class="oh"><span class="av">${esc(o.avatar)}</span><b>${esc(o.nick)}</b><span class="st ${o.status === 'active' ? 'done' : ''}">${o.status === 'active' ? 'активен' : 'выключен'}</span></div><div class="meta"><span class="chip">${o.direction === 'sell' ? 'продаёт' : 'покупает'} ${o.currency}</span><span class="chip">${rub(o.rate)}</span><span class="chip">${fmt(o.availableAmount, o.currency)}</span><span class="chip">${esc(o.paymentMethod)}</span></div><div class="row"><button class="btn sec s" data-a="otoggle" data-v="${o.id}">${o.status === 'active' ? 'Выключить' : 'Включить'}</button><button class="btn danger s" data-a="odel" data-v="${o.id}">Удалить</button></div></article>`).join('') : empty('package-open', 'Ордеров нет', 'Создайте первый ордер выше')}`;
};
const adminView = () => `<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><button class="ib" data-a="tab" data-v="profile" aria-label="Назад"><i data-lucide="chevron-left"></i></button><h1 style="font-size:24px">Админ-панель</h1></div>${seg([['orders', 'Ордера'], ['trades', 'Сделки'], ['roul', 'Рулетка'], ['bal', 'Баланс']], AT, 'atab')}${adminBody()}`;
function adminPanel() { tab = 'admin'; render(true); }

/* ---------- Действия ---------- */
const A = {
  x: el => { const w = el.closest('.mw'); w.classList.remove('in'); setTimeout(() => { w.remove(); unlock(); }, 300); },
  tab: el => { tab = el.dataset.v; render(true); },
  prev: () => goCard(-1), next: () => goCard(1), dot: el => { S.idx = +el.dataset.v; save(); lay(); },
  deposit, send, swap, bell: () => toast(S.txs.length ? `Последняя операция: ${TXT[S.txs[0].type]}` : 'Новых уведомлений нет', 'ok'),
  copy: el => { (navigator.clipboard ? navigator.clipboard.writeText(el.dataset.t || '') : Promise.reject()).then(() => toast('Адрес скопирован'), () => toast('Не удалось скопировать', 'err')); },
  logo: () => { const n = Date.now(); taps = n - tapT < 3000 ? taps + 1 : 1; tapT = n; if (taps >= 5) { taps = 0; if (!canAdmin()) return; S.user.isAdmin ? adminPanel() : adminLogin(); } },
  dir: el => { U.dir = el.dataset.v; render(); }, pcur: el => { U.cur = el.dataset.v; render(); }, sort: () => { U.asc = !U.asc; render(); }, order: el => openOrder(el.dataset.v),
  rcur: el => { if (spinning) return; RC = el.dataset.v; lastBet = Math.max(minB(RC), rd(10 / C.PRICES[RC], RC)); render(); },
  bq: el => { const b = num($('#bet').value) || 0, v = el.dataset.v, m = Math.min(maxB(RC), bal(RC)), x = v === 'min' ? minB(RC) : v === 'half' ? Math.max(minB(RC), rd(b / 2, RC)) : v === 'dbl' ? Math.min(m, rd(b * 2, RC)) : rd(m, RC); $('#bet').value = x; lastBet = x; $('#bu').textContent = bu(x); },
  spin,
  edit: editProfile, theme: el => { S.theme = el.dataset.v; save(); applyTheme(); render(); },
  tcancel: async el => { const t = S.trades.find(x => x.id === el.dataset.v); if (t && await ask('Отменить сделку? Замороженные средства вернутся.', 'Отменить сделку') && setTrade(t, 'cancelled')) { render(); toast('Сделка отменена'); } },
  reset: async () => { if (await ask('Все локальные данные будут удалены, баланс вернётся к стартовому.', 'Сбросить')) { S = seed(); save(); tab = 'wallet'; render(true); toast('Данные сброшены'); } },
  admin: adminPanel, alogout: () => { S.user.isAdmin = false; save(); render(); toast('Вы вышли из админ-режима'); },
  rsave: el => { const w = $('#view'), s = [], n = segs().length; for (let i = 0; i < n; i++) { const m = num($(`[data-rm="${i}"]`, w).value), x = num($(`[data-rw="${i}"]`, w).value);
      if (!(m >= 0 && m <= 100 && x >= 0)) return void ($('[data-e2x]', w).textContent = `Сектор ${i + 1}: проверьте значения`); s.push({ m, w: x }); }
    if (!s.some(x => x.w > 0)) return void ($('[data-e2x]', w).textContent = 'Хотя бы один вес должен быть больше нуля'); S.rc = s; save(); adminDraw(); toast('Шансы сохранены'); },
  rreset: () => { delete S.rc; save(); adminDraw(); toast('Шансы сброшены'); },
  tnext: el => { const t = S.trades.find(x => x.id === el.dataset.v); if (t && setTrade(t, NEXT[t.status][0])) { render(); toast('Статус обновлён'); } },
  atab: el => { AT = el.dataset.v; render(); },
  av: el => $$('[data-a="av"]').forEach(x => x.classList.toggle('on', x === el)),
  tset: el => { const [id, st] = el.dataset.v.split(':'), t = S.trades.find(x => x.id === id); if (t && setTrade(t, st)) { render(); toast('Статус обновлён'); } },
  bsave: () => { const w = $('#view'), v = CUR.map(c => [c, num($(`[data-b="${c}"]`, w).value)]); if (v.some(x => !(x[1] >= 0))) return void ($('[data-eb]', w).textContent = 'Введите числа не меньше нуля'); v.forEach(x => setBal(x[0], x[1])); save(); render(); toast('Баланс сохранён'); },
  ocreate: el => { const w = $('#view'), g = i => $(i, w).value, c = g('#ac'), r = num(g('#ar')), v = num(g('#av')), mn = num(g('#an')), mx = num(g('#ax')), p = g('#ap').trim(), nk = g('#an2').trim(), av = $('[data-av].on', w), e = $('[data-e]', w);
    if (![r, v, mn, mx].every(x => x > 0)) return void (e.textContent = 'Заполните курс, объём, минимум и максимум положительными числами');
    if (mn > mx) return void (e.textContent = 'Минимум не может быть больше максимума'); if (nk.length < 2) return void (e.textContent = 'Укажите ник от 2 символов'); if (p.length < 2) return void (e.textContent = 'Укажите способ оплаты');
    S.orders.unshift({ id: uid('o_'), ownerId: 'admin', nick: nk, avatar: av ? av.dataset.av : C.AVATARS[0], currency: c, direction: g('#ad'), rate: r, availableAmount: v, minAmount: mn, maxAmount: mx, paymentMethod: p, status: 'active' }); save(); adminDraw(); toast('Ордер создан'); },
  otoggle: el => { const o = S.orders.find(x => x.id === el.dataset.v); if (o) { o.status = o.status === 'active' ? 'inactive' : 'active'; save(); adminDraw(); } },
  odel: async el => { if (await ask('Удалить ордер навсегда?', 'Удалить')) { S.orders = S.orders.filter(x => x.id !== el.dataset.v); save(); adminDraw(); toast('Ордер удалён'); } }
};
document.addEventListener('click', e => { const t = e.target.closest('[data-a]'); if (t && A[t.dataset.a]) A[t.dataset.a](t); });
document.addEventListener('input', e => { const k = e.target.dataset.in; if (k === 'q') { U.q = e.target.value; drawList(); } if (k === 'bet') { lastBet = e.target.value; const u = $('#bu'); if (u) u.textContent = bu(num(e.target.value) || 0); } });

/* ---------- Рендер ---------- */
let tab = 'wallet';
const VIEWS = { wallet: walletView, p2p: p2pView, roulette: rouletteView, profile: profileView, admin: adminView };
const NAV = [['wallet', 'wallet', 'Wallet'], ['p2p', 'arrow-left-right', 'P2P'], ['roulette', 'disc-3', 'Roulette'], ['profile', 'user-round', 'Profile']];
function applyTheme() { const t = S.theme === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : S.theme; document.documentElement.dataset.theme = t; $('meta[name=theme-color]').content = t === 'dark' ? '#0B1220' : '#F4F8FC'; }
function render(reset) {
  if (tab === 'admin' && !S.user.isAdmin) tab = 'profile';
  const v = $('#view'), top = reset === true, y = top ? 0 : window.scrollY; v.style.minHeight = v.offsetHeight + 'px';
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.a === 'tab' && b.dataset.v === (tab === 'admin' ? 'profile' : tab)));
  if (top) v.classList.remove('in');
  v.innerHTML = VIEWS[tab](); v.style.setProperty('--accent', C.COLORS[CUR[S.idx]][1]);
  if (top) void v.offsetWidth; v.classList.add('in');
  if (tab === 'wallet') mountStack(); if (tab === 'p2p') drawList(); ic();
  window.scrollTo(0, y); v.style.minHeight = '';
}
$('#nav').innerHTML = NAV.map(n => `<button data-a="tab" data-v="${n[0]}"><i data-lucide="${n[1]}"></i>${n[2]}</button>`).join('');
applyTheme(); matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
const v0 = $('#view'); v0.innerHTML = '<div class="sk"></div><div class="sk" style="height:200px"></div><div class="sk"></div>'; v0.classList.add('in'); ic();
setTimeout(render, 450);
})();
