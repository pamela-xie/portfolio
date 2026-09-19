// Replace these demonstration descriptions with real projects when available.
const projects = [
  { title: '字之間', type: '字體與海報 / Typography & Poster', description: '以字距、傾斜與留白探索文字的節奏。粉紫與深色字體形成對比，讓文字本身成為主視覺。' },
  { title: 'MORI / 森', type: '品牌識別 / Visual Identity', description: '以簡潔字標和柔和的淡粉色，示範品牌識別的展示方式。此版位可替換為品牌標誌、色彩系統與應用設計。' },
  { title: '日常切片', type: '編輯設計 / Editorial Design', description: '透過濃郁的莓果紫色、字級對比與編號，示範刊物封面與編輯設計的展示方式。此版位可放入封面、跨頁與印刷細節。' }
];
const windows = [...document.querySelectorAll('.window')];
const opened = new Set(['welcome']);
let layer = 20;
let active = 'welcome';
const lastFocus = new Map();
function raise(win) { win.style.zIndex = ++layer; active = win.id; renderTasks(); }
function openWindow(id, focus = true) {
  const win = document.getElementById(id);
  if (!win) return;
  lastFocus.set(id, document.activeElement);
  win.hidden = false;
  opened.add(id);
  raise(win);
  if (focus) win.querySelector('button')?.focus({ preventScroll: true });
  if (matchMedia('(max-width: 700px)').matches && !win.classList.contains('secondary')) win.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('announcement').textContent = `已開啟 ${win.querySelector('h1,h2').textContent}`;
}
function hideWindow(win, close) {
  win.hidden = true;
  if (close) opened.delete(win.id);
  if (active === win.id) active = windows.filter(w => !w.hidden).sort((a,b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0))[0]?.id || '';
  renderTasks();
  const target = lastFocus.get(win.id);
  if (target && !target.closest('[hidden]')) target.focus({ preventScroll: true });
  else document.querySelector('.start').focus({ preventScroll: true });
}
function renderTasks() {
  const root = document.getElementById('tasks');
  root.replaceChildren();
  const names = { welcome:'歡迎', work:'精選作品', about:'關於沛璇', contact:'聯絡方式', detail:'作品詳情' };
  opened.forEach(id => {
    const win = document.getElementById(id);
    const button = document.createElement('button');
    button.textContent = names[id];
    button.className = win.hidden ? 'minimized' : active === id ? 'active' : '';
    button.setAttribute('aria-label', `開啟${names[id]}視窗`);
    button.setAttribute('aria-pressed', String(active === id && !win.hidden));
    button.addEventListener('click', () => openWindow(id));
    root.append(button);
  });
}
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openWindow(button.dataset.open)));
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); openWindow('welcome'); });
windows.forEach(win => {
  win.addEventListener('pointerdown', () => raise(win));
  win.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.action === 'maximize') {
      const maximized = win.classList.toggle('maximized');
      button.setAttribute('aria-pressed', String(maximized));
      button.title = maximized ? '還原視窗大小' : '放大視窗';
    } else hideWindow(win, button.dataset.action === 'close');
  }));
  const bar = win.querySelector('.titlebar');
  bar.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || matchMedia('(max-width:700px)').matches || win.classList.contains('maximized') || event.button !== 0) return;
    const rect = win.getBoundingClientRect();
    const startX = event.clientX, startY = event.clientY;
    win.style.position = 'fixed'; win.style.width = `${rect.width}px`; win.style.margin = '0'; win.style.transform = 'none';
    win.style.left = `${rect.left}px`; win.style.top = `${rect.top}px`;
    bar.setPointerCapture(event.pointerId);
    function move(e) {
      win.style.left = `${Math.max(0, Math.min(innerWidth - rect.width, rect.left + e.clientX - startX))}px`;
      win.style.top = `${Math.max(44, Math.min(innerHeight - 100, rect.top + e.clientY - startY))}px`;
    }
    function end() { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', end); bar.removeEventListener('pointercancel', end); }
    bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
  });
});
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[Number(button.dataset.project)];
  const body = document.getElementById('detail-body');
  body.replaceChildren(button.querySelector('.art').cloneNode(true));
  const title = document.createElement('h3'); title.textContent = project.title;
  const type = document.createElement('p'); type.className = 'type'; type.textContent = project.type;
  const description = document.createElement('p'); description.textContent = project.description;
  const note = document.createElement('p'); note.className = 'pending'; note.textContent = '版型示範，非謝沛璇本人實際作品。正式作品上架後，可在這裡加入設計目標、角色、過程與成果。';
  body.append(title, type, description, note);
  document.getElementById('detail-title').textContent = project.title;
  openWindow('detail');
}));
document.getElementById('theme').addEventListener('click', event => {
  const dark = document.body.classList.toggle('night');
  event.currentTarget.setAttribute('aria-label', dark ? '切換淺色桌布' : '切換深色桌布');
});
let desktopHidden = [];
document.getElementById('show-desktop').addEventListener('click', () => {
  if (windows.some(w => !w.hidden)) {
    desktopHidden = windows.filter(w => !w.hidden).map(w => w.id);
    windows.forEach(w => w.hidden = true);
  } else desktopHidden.forEach(id => { document.getElementById(id).hidden = false; });
  renderTasks();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && active) hideWindow(document.getElementById(active), false);
});
function clock() {
  const now = new Date();
  document.getElementById('date').textContent = now.toLocaleDateString('en-US', { month:'short', day:'numeric' }).toUpperCase();
  document.getElementById('clock').textContent = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  document.getElementById('clock').dateTime = now.toISOString();
}
clock(); setInterval(clock, 30000); renderTasks();
// Resize from the lower-right corner; keep the handle inside the usable desktop.
windows.forEach(win => {
  const handle = document.createElement('button');
  handle.className = 'resize-handle';
  handle.setAttribute('aria-label', '調整視窗大小：拖曳或使用方向鍵');
  handle.title = '拖曳調整大小（也可使用方向鍵）';
  win.append(handle);
  function prepare() {
    const rect = win.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, innerWidth - 368));
    const top = Math.max(52, Math.min(rect.top, innerHeight - 300));
    Object.assign(win.style, { position:'fixed', left:`${left}px`, top:`${top}px`,
      margin:'0', transform:'none', width:`${rect.width}px`, height:`${rect.height}px` });
    win.classList.add('user-sized');
    return { width:rect.width, height:rect.height, left, top };
  }
  function size(rect, dx, dy) {
    const maxWidth = innerWidth - rect.left - 8;
    const maxHeight = innerHeight - rect.top - 62;
    win.style.width = `${Math.min(maxWidth, Math.max(360, rect.width + dx))}px`;
    win.style.height = `${Math.min(maxHeight, Math.max(240, rect.height + dy))}px`;
  }
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0 || win.classList.contains('maximized') || matchMedia('(max-width:700px)').matches) return;
    event.preventDefault();
    const rect = prepare(), x = event.clientX, y = event.clientY;
    size(rect, 0, 0);
    handle.setPointerCapture(event.pointerId);
    win.classList.add('resizing');
    function move(e) { size(rect, e.clientX - x, e.clientY - y); }
    function end() {
      win.classList.remove('resizing');
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      handle.removeEventListener('lostpointercapture', end);
    }
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('lostpointercapture', end);
  });
  handle.addEventListener('keydown', event => {
    if (!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 40 : 16;
    size(prepare(), event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0,
      event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0);
  });
});

// Reset freely positioned windows when the viewport changes to keep them reachable.
addEventListener('resize', () => windows.forEach(win => {
  win.classList.remove('user-sized');
  if (win.style.position === 'fixed') ['position','width','height','margin','transform','left','top'].forEach(property => win.style.removeProperty(property));
}));

// Lightweight desktop-only pointer trail, with no mouse interception.
(() => {
  const desktop = document.querySelector('.desktop');
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail';
  canvas.setAttribute('aria-hidden', 'true');
  desktop.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = matchMedia('(hover: hover) and (pointer: fine)');
  let points = [], frame = 0, previous = null;
  const life = 1200;
  const spacing = 32;
  let distanceToNext = spacing;
  const smoothstep = t => t * t * (3 - 2 * t);
  function emitFlower(x, y, time) {
    points.push({x, y, time, scale: .65 + Math.random() * .85,
      rotation: Math.random() * Math.PI * 2,
      turn: (Math.random() - .5) * .5,
      color: Math.random() < .5 ? '#d9a6c3' : '#c4a1d4'});
  }
  function samplePath(x, y, time) {
    if (!previous) {
      emitFlower(x, y, time);
      previous = {x, y}; distanceToNext = spacing; return;
    }
    const dx = x - previous.x, dy = y - previous.y;
    const distance = Math.hypot(dx, dy);
    if (!distance) return;
    let travelled = distanceToNext;
    // Carry spacing across events so slow curves and fast sweeps stay continuous.
    for (; travelled <= distance; travelled += spacing) {
      emitFlower(previous.x + dx * travelled / distance,
        previous.y + dy * travelled / distance, time);
    }
    distanceToNext = travelled - distance;
    previous = {x, y};
  }
  function clear() {
    cancelAnimationFrame(frame); frame = 0; points = []; previous = null;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  function fit() {
    clear();
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * scale);
    canvas.height = Math.round(innerHeight * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }
  function draw(now) {
    frame = 0;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    points = points.filter(p => now - p.time < life);
    for (const p of points) {
      const remaining = Math.max(0, 1 - (now - p.time) / life);
      const age = Math.max(0, now - p.time);
      const enter = smoothstep(Math.min(1, age / 110));
      const fade = smoothstep(remaining);
      const size = p.scale * (.65 + .35 * fade) * (.8 + .2 * enter);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation + (1 - fade) * p.turn);
      ctx.scale(size, size);
      ctx.globalAlpha = enter * fade * .8;
      ctx.fillStyle = p.color;
      for (let petal = 0; petal < 5; petal++) {
        ctx.save();
        ctx.rotate(petal * Math.PI * 2 / 5);
        ctx.beginPath();
        ctx.ellipse(0, -4.5, 2.8, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.fillStyle = '#fff5f9';
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (points.length) frame = requestAnimationFrame(draw);
  }
  document.addEventListener('pointermove', event => {
    if (reduced.matches || !mouse.matches || event.pointerType !== 'mouse' || event.buttons || event.target !== desktop) {
      previous = null; return;
    }
    const now = performance.now();
    const samples = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
    for (const sample of samples.length ? samples : [event]) {
      samplePath(sample.clientX, sample.clientY, now);
    }
    if (points.length > 100) points.splice(0, points.length - 100);
    if (!frame) frame = requestAnimationFrame(draw);
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', () => { previous = null; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  addEventListener('blur', clear);
  addEventListener('resize', fit);
  addEventListener('scroll', clear, {passive: true});
  reduced.addEventListener('change', clear);
  mouse.addEventListener('change', clear);
  fit();
})();

// Run the opening once per page load. Interaction immediately restores normal positioning.
(() => {
  const welcome = document.getElementById('welcome');
  const finish = () => welcome.classList.remove('welcome-enter');
  welcome.addEventListener('pointerdown', finish, {once: true});
  welcome.addEventListener('focusin', finish, {once: true});
  setTimeout(finish, 2300);
})();
