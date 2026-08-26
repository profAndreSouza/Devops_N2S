/* ==========================================================
   Campo Minado — lógica do jogo
   ========================================================== */
(() => {
  'use strict';

  const LEVELS = {
    facil:   { rows: 9,  cols: 9,  mines: 10, label: 'Fácil' },
    medio:   { rows: 16, cols: 16, mines: 40, label: 'Médio' },
    dificil: { rows: 16, cols: 30, mines: 99, label: 'Difícil' },
    custom:  { rows: 12, cols: 18, mines: 35, label: 'Custom' }
  };

  const STORE_BEST  = 'campo-minado:recordes';
  const STORE_PREFS = 'campo-minado:prefs';

  // ---------- elementos ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    board: $('board'), mineCount: $('mine-count'), timer: $('timer'), face: $('face'),
    btnReset: $('btn-reset'), levels: $('levels'), customPanel: $('custom-panel'),
    customSub: $('custom-sub'), inRows: $('in-rows'), inCols: $('in-cols'), inMines: $('in-mines'),
    btnFlag: $('btn-flag'), statFlags: $('stat-flags'), statProgress: $('stat-progress'),
    overlay: $('overlay'), ovEmoji: $('ov-emoji'), ovTitle: $('ov-title'), ovText: $('ov-text'),
    ovRecord: $('ov-record'), ovAgain: $('ov-again'), ovClose: $('ov-close'),
    btnSound: $('btn-sound'), btnTheme: $('btn-theme'), btnHelp: $('btn-help'),
    help: $('help'), helpClose: $('help-close'),
    recordsList: $('records-list'), btnClearRecords: $('btn-clear-records'),
    panel: document.querySelector('.panel')
  };

  // ---------- estado ----------
  const state = {
    level: 'facil',
    rows: 9, cols: 9, mines: 10,
    grid: [],          // {mine, adj, revealed, flagged, marked, el}
    started: false,
    over: false,
    won: false,
    revealedCount: 0,
    flagCount: 0,
    startTime: 0,
    elapsed: 0,
    tickId: null,
    cursor: { r: 0, c: 0 }
  };

  const prefs = loadJSON(STORE_PREFS, { sound: true, theme: 'dark', flagMode: false });
  const best  = loadJSON(STORE_BEST, {});

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? Object.assign({}, fallback, JSON.parse(raw)) : { ...fallback };
    } catch { return { ...fallback }; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignora */ }
  }

  /* ==========================================================
     Áudio (WebAudio, sem arquivos externos)
     ========================================================== */
  let audioCtx = null;
  function ac() {
    if (!prefs.sound) return null;
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, dur = 0.08, type = 'sine', gain = 0.08, delay = 0) {
    const ctx = ac(); if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noise(dur = 0.55, gain = 0.3) {
    const ctx = ac(); if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + dur);
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start();
  }

  const sfx = {
    reveal: () => tone(520 + Math.random() * 90, 0.06, 'triangle', 0.05),
    cascade: () => tone(320, 0.14, 'sine', 0.05),
    flag:   () => { tone(880, 0.05, 'square', 0.05); tone(1180, 0.06, 'square', 0.04, 0.05); },
    unflag: () => tone(420, 0.06, 'square', 0.04),
    boom:   () => { noise(0.7, 0.35); tone(70, 0.5, 'sawtooth', 0.16); },
    win:    () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.3, 'triangle', 0.09, i * 0.09)),
    click:  () => tone(660, 0.04, 'sine', 0.04)
  };

  /* ==========================================================
     Construção do tabuleiro
     ========================================================== */
  function newGame() {
    stopTimer();

    const cfg = LEVELS[state.level];
    state.rows = cfg.rows;
    state.cols = cfg.cols;
    state.mines = Math.min(cfg.mines, cfg.rows * cfg.cols - 9);

    state.grid = [];
    state.started = false;
    state.over = false;
    state.won = false;
    state.revealedCount = 0;
    state.flagCount = 0;
    state.elapsed = 0;
    state.cursor = { r: 0, c: 0 };

    el.timer.textContent = '000';
    el.overlay.hidden = true;
    el.panel.classList.remove('shake');
    setFace('🙂');
    renderBoard();
    fitCells();
    updateHUD();
  }

  function renderBoard() {
    const frag = document.createDocumentFragment();
    el.board.innerHTML = '';
    el.board.style.gridTemplateColumns = `repeat(${state.cols}, var(--cell))`;
    el.board.setAttribute('aria-rowcount', String(state.rows));
    el.board.setAttribute('aria-colcount', String(state.cols));

    for (let r = 0; r < state.rows; r++) {
      const row = [];
      for (let c = 0; c < state.cols; c++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cell';
        btn.dataset.r = r;
        btn.dataset.c = c;
        btn.tabIndex = (r === 0 && c === 0) ? 0 : -1;
        btn.setAttribute('aria-label', `Linha ${r + 1}, coluna ${c + 1}`);
        row.push({ mine: false, adj: 0, revealed: false, flagged: false, marked: false, el: btn });
        frag.appendChild(btn);
      }
      state.grid.push(row);
    }
    el.board.appendChild(frag);
  }

  /** Distribui as minas garantindo que o primeiro clique e seus vizinhos sejam seguros. */
  function placeMines(safeR, safeC) {
    const total = state.rows * state.cols;
    const forbidden = new Set();
    forEachNeighbor(safeR, safeC, (r, c) => forbidden.add(r * state.cols + c));
    forbidden.add(safeR * state.cols + safeC);

    const pool = [];
    for (let i = 0; i < total; i++) if (!forbidden.has(i)) pool.push(i);

    // Fisher-Yates parcial
    for (let i = 0; i < state.mines; i++) {
      const j = i + Math.floor(Math.random() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
      const r = Math.floor(pool[i] / state.cols);
      const c = pool[i] % state.cols;
      state.grid[r][c].mine = true;
    }

    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (state.grid[r][c].mine) continue;
        let n = 0;
        forEachNeighbor(r, c, (nr, nc) => { if (state.grid[nr][nc].mine) n++; });
        state.grid[r][c].adj = n;
      }
    }
  }

  function forEachNeighbor(r, c, fn) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) fn(nr, nc);
      }
    }
  }

  /* ==========================================================
     Ações do jogador
     ========================================================== */
  function reveal(r, c) {
    if (state.over) return;
    const cell = state.grid[r][c];
    if (cell.revealed || cell.flagged) return;

    if (!state.started) {
      placeMines(r, c);
      state.started = true;
      startTimer();
    }

    if (cell.mine) return gameOver(r, c);

    const opened = flood(r, c);
    opened > 1 ? sfx.cascade() : sfx.reveal();
    updateHUD();
    checkWin();
  }

  /** Revela em cascata a partir de (r,c) — iterativo para não estourar a pilha. */
  function flood(r, c) {
    const stack = [[r, c]];
    let count = 0;
    while (stack.length) {
      const [cr, cc] = stack.pop();
      const cell = state.grid[cr][cc];
      if (cell.revealed || cell.flagged || cell.mine) continue;

      cell.revealed = true;
      cell.marked = false;
      state.revealedCount++;
      count++;
      paintRevealed(cr, cc, cell);

      if (cell.adj === 0) forEachNeighbor(cr, cc, (nr, nc) => {
        if (!state.grid[nr][nc].revealed) stack.push([nr, nc]);
      });
    }
    return count;
  }

  function paintRevealed(r, c, cell) {
    const b = cell.el;
    b.classList.add('revealed');
    b.classList.remove('flagged', 'marked');
    if (cell.adj > 0) {
      b.textContent = cell.adj;
      b.classList.add('n' + cell.adj);
      b.setAttribute('aria-label', `Linha ${r + 1}, coluna ${c + 1}: ${cell.adj}`);
    } else {
      b.textContent = '';
      b.setAttribute('aria-label', `Linha ${r + 1}, coluna ${c + 1}: vazia`);
    }
    // pequeno atraso visual em cascata, proporcional à distância do clique
    b.style.animationDelay = '0ms';
  }

  function toggleFlag(r, c) {
    if (state.over) return;
    const cell = state.grid[r][c];
    if (cell.revealed) return;

    if (cell.flagged) {                 // 🚩 -> ❓
      cell.flagged = false;
      cell.marked = true;
      state.flagCount--;
      cell.el.classList.remove('flagged');
      cell.el.classList.add('marked');
      cell.el.textContent = '❓';
      sfx.unflag();
    } else if (cell.marked) {           // ❓ -> vazio
      cell.marked = false;
      cell.el.classList.remove('marked');
      cell.el.textContent = '';
      sfx.click();
    } else {                            // vazio -> 🚩
      cell.flagged = true;
      state.flagCount++;
      cell.el.classList.add('flagged');
      cell.el.textContent = '🚩';
      sfx.flag();
      if (!state.started) { state.started = true; startTimer(); }
    }
    cell.el.setAttribute('aria-label',
      `Linha ${r + 1}, coluna ${c + 1}${cell.flagged ? ': marcada com bandeira' : cell.marked ? ': dúvida' : ''}`);
    updateHUD();
  }

  /** Abertura rápida: clicar num número com bandeiras suficientes ao redor. */
  function chord(r, c) {
    if (state.over) return;
    const cell = state.grid[r][c];
    if (!cell.revealed || cell.adj === 0) return;

    let flags = 0;
    forEachNeighbor(r, c, (nr, nc) => { if (state.grid[nr][nc].flagged) flags++; });
    if (flags !== cell.adj) { flashHint(r, c); return; }

    const targets = [];
    forEachNeighbor(r, c, (nr, nc) => {
      const n = state.grid[nr][nc];
      if (!n.revealed && !n.flagged) targets.push([nr, nc]);
    });
    if (!targets.length) return;

    for (const [nr, nc] of targets) {
      if (state.grid[nr][nc].mine) return gameOver(nr, nc);
    }
    for (const [nr, nc] of targets) flood(nr, nc);
    sfx.cascade();
    updateHUD();
    checkWin();
  }

  function flashHint(r, c) {
    forEachNeighbor(r, c, (nr, nc) => {
      const n = state.grid[nr][nc];
      if (n.revealed || n.flagged) return;
      n.el.classList.add('hint');
      setTimeout(() => n.el.classList.remove('hint'), 180);
    });
  }

  /* ==========================================================
     Fim de jogo
     ========================================================== */
  function gameOver(br, bc) {
    state.over = true;
    state.won = false;
    stopTimer();
    sfx.boom();
    setFace('😵');
    el.panel.classList.add('shake');

    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const cell = state.grid[r][c];
        const b = cell.el;
        if (cell.mine && !cell.flagged) {
          b.classList.add('revealed', 'mine');
          b.textContent = '💣';
        } else if (!cell.mine && cell.flagged) {
          b.classList.add('revealed', 'wrong');
          b.textContent = '❌';
        }
      }
    }
    const boom = state.grid[br][bc].el;
    boom.classList.add('boom');
    boom.textContent = '💥';

    setTimeout(() => showOverlay(false), 900);
  }

  function checkWin() {
    const safeTotal = state.rows * state.cols - state.mines;
    if (state.revealedCount < safeTotal) return;

    state.over = true;
    state.won = true;
    stopTimer();
    setFace('😎');
    sfx.win();

    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const cell = state.grid[r][c];
        if (cell.mine && !cell.flagged) {
          cell.flagged = true;
          state.flagCount++;
          cell.el.classList.add('flagged', 'safe-flag');
          cell.el.textContent = '🚩';
        } else if (cell.mine) {
          cell.el.classList.add('safe-flag');
        }
      }
    }
    updateHUD();
    confetti();
    setTimeout(() => showOverlay(true), 500);
  }

  function showOverlay(won) {
    const secs = Math.floor(state.elapsed / 1000);
    el.ovEmoji.textContent = won ? '🏆' : '💥';
    el.ovTitle.textContent = won ? 'Você venceu!' : 'Boom!';
    el.ovText.textContent = won
      ? `${LEVELS[state.level].label} · ${formatTime(secs)} · ${state.mines} minas desarmadas`
      : 'Você pisou numa mina. Tente outra vez!';
    el.ovAgain.textContent = won ? 'Jogar de novo' : 'Tentar de novo';

    let isRecord = false;
    if (won && state.level !== 'custom') {
      const prev = best[state.level];
      if (prev == null || secs < prev) { best[state.level] = secs; saveJSON(STORE_BEST, best); isRecord = true; }
      renderRecords();
    }
    el.ovRecord.hidden = !isRecord;
    el.overlay.hidden = false;
    el.ovAgain.focus({ preventScroll: true });
  }

  function confetti() {
    const colors = ['#58c4ff', '#a97bff', '#3ddc97', '#ffc857', '#ff5c72', '#ffffff'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('span');
      p.className = 'confetti';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDuration = (1.9 + Math.random() * 1.7) + 's';
      p.style.animationDelay = (Math.random() * 0.6) + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4200);
    }
  }

  /* ==========================================================
     HUD / timer
     ========================================================== */
  function pad3(n) { return String(Math.max(-99, Math.min(999, n))).padStart(3, '0'); }

  function formatTime(secs) {
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, '0')}s`;
  }

  function updateHUD() {
    const remaining = state.mines - state.flagCount;
    el.mineCount.textContent = remaining < 0 ? '-' + pad3(Math.abs(remaining)).slice(1) : pad3(remaining);
    el.statFlags.textContent = `🚩 ${state.flagCount} / ${state.mines}`;
    const safeTotal = state.rows * state.cols - state.mines;
    el.statProgress.textContent = `Revelado ${Math.round((state.revealedCount / safeTotal) * 100)}%`;
  }

  function startTimer() {
    state.startTime = Date.now();
    state.tickId = setInterval(() => {
      state.elapsed = Date.now() - state.startTime;
      el.timer.textContent = pad3(Math.floor(state.elapsed / 1000));
    }, 200);
    el.timer.textContent = '000';
  }

  function stopTimer() {
    if (state.tickId) { clearInterval(state.tickId); state.tickId = null; }
    if (state.started) state.elapsed = Date.now() - state.startTime;
    el.timer.textContent = pad3(Math.floor(state.elapsed / 1000));
  }

  function setFace(emoji) {
    el.face.textContent = emoji;
    el.btnReset.classList.remove('pop');
    void el.btnReset.offsetWidth;
    el.btnReset.classList.add('pop');
  }

  function renderRecords() {
    const rows = [['facil', 'Fácil'], ['medio', 'Médio'], ['dificil', 'Difícil']];
    el.recordsList.innerHTML = rows.map(([k, label]) => {
      const v = best[k];
      return `<li><span>${label}</span><b>${v == null ? '—' : formatTime(v)}</b></li>`;
    }).join('');
  }

  /** Ajusta o tamanho da célula para o tabuleiro caber na tela. */
  function fitCells() {
    const narrow = window.innerWidth < 640;
    const max = narrow ? 34 : 38;
    const min = 16;
    const chrome = narrow ? 46 : 90;              // paddings do body + painel
    const available = Math.min(window.innerWidth, 1180) - chrome;
    const gap = 3;
    let size = Math.floor((available - gap * (state.cols + 1)) / state.cols);
    size = Math.max(min, Math.min(max, size));
    document.documentElement.style.setProperty('--cell', size + 'px');
  }

  /* ==========================================================
     Entrada: mouse, toque e teclado
     ========================================================== */
  function cellFrom(target) {
    const b = target.closest?.('.cell');
    if (!b) return null;
    return { r: +b.dataset.r, c: +b.dataset.c };
  }

  el.board.addEventListener('contextmenu', (e) => e.preventDefault());

  // clique com os dois botões = abertura rápida
  let bothButtons = false, ignoreNextUp = false;
  el.board.addEventListener('mousedown', (e) => {
    if (e.buttons === 3) bothButtons = true;
  });

  el.board.addEventListener('mouseup', (e) => {
    const pos = cellFrom(e.target);
    if (!pos || state.over) return;
    const cell = state.grid[pos.r][pos.c];

    if (ignoreNextUp) { ignoreNextUp = false; return; }

    if (bothButtons || e.button === 1) {
      e.preventDefault();
      bothButtons = false;
      ignoreNextUp = e.button !== 1;   // ignora a soltura do segundo botão
      chord(pos.r, pos.c);
      return;
    }
    if (e.button === 2) { toggleFlag(pos.r, pos.c); return; }
    if (e.button !== 0) return;
    if (longPressFired) { longPressFired = false; return; }

    focusCell(pos.r, pos.c);
    if (cell.revealed) chord(pos.r, pos.c);
    else if (prefs.flagMode) toggleFlag(pos.r, pos.c);
    else reveal(pos.r, pos.c);
  });

  // toque: toque longo marca bandeira
  let pressTimer = null, longPressFired = false, touchStart = null;
  el.board.addEventListener('touchstart', (e) => {
    const pos = cellFrom(e.target);
    if (!pos) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressFired = false;
    pressTimer = setTimeout(() => {
      longPressFired = true;
      toggleFlag(pos.r, pos.c);
      if (navigator.vibrate) navigator.vibrate(18);
    }, 380);
  }, { passive: true });

  el.board.addEventListener('touchmove', (e) => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    if (Math.hypot(dx, dy) > 12) clearTimeout(pressTimer);
  }, { passive: true });

  el.board.addEventListener('touchend', () => clearTimeout(pressTimer), { passive: true });
  el.board.addEventListener('touchcancel', () => { clearTimeout(pressTimer); longPressFired = false; }, { passive: true });

  // teclado
  function focusCell(r, c) {
    state.grid[state.cursor.r]?.[state.cursor.c]?.el.setAttribute('tabindex', '-1');
    state.cursor = { r, c };
    const b = state.grid[r][c].el;
    b.setAttribute('tabindex', '0');
    return b;
  }

  el.board.addEventListener('keydown', (e) => {
    const pos = cellFrom(e.target);
    if (!pos) return;
    let { r, c } = pos;
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };

    if (moves[e.key]) {
      e.preventDefault();
      r = Math.max(0, Math.min(state.rows - 1, r + moves[e.key][0]));
      c = Math.max(0, Math.min(state.cols - 1, c + moves[e.key][1]));
      focusCell(r, c).focus();
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey || prefs.flagMode) toggleFlag(r, c);
      else if (state.grid[r][c].revealed) chord(r, c);
      else reveal(r, c);
    }
  });

  // rosto "surpreso" enquanto o botão está pressionado
  el.board.addEventListener('pointerdown', (e) => {
    if (state.over || e.button !== 0) return;
    el.face.textContent = '😮';
  });
  document.addEventListener('pointerup', () => {
    if (!state.over) el.face.textContent = '🙂';
    bothButtons = false;
  });

  /* ==========================================================
     Controles da interface
     ========================================================== */
  el.btnReset.addEventListener('click', () => { sfx.click(); newGame(); });
  el.ovAgain.addEventListener('click', () => { sfx.click(); newGame(); });
  el.ovClose.addEventListener('click', () => { el.overlay.hidden = true; });

  el.levels.addEventListener('click', (e) => {
    const btn = e.target.closest('.level');
    if (!btn) return;
    setLevel(btn.dataset.level);
  });

  function setLevel(level) {
    state.level = level;
    [...el.levels.children].forEach(b => {
      const active = b.dataset.level === level;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    el.customPanel.hidden = level !== 'custom';
    sfx.click();
    newGame();
  }

  el.customPanel.addEventListener('submit', (e) => {
    e.preventDefault();
    const rows  = clamp(+el.inRows.value, 5, 30);
    const cols  = clamp(+el.inCols.value, 5, 40);
    const maxM  = rows * cols - 9;
    const mines = clamp(+el.inMines.value, 1, maxM);

    el.inRows.value = rows; el.inCols.value = cols; el.inMines.value = mines;
    LEVELS.custom = { rows, cols, mines, label: 'Custom' };
    el.customSub.textContent = `${rows}×${cols} · ${mines} 💣`;
    state.level = 'custom';
    newGame();
  });

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo)); }

  el.btnFlag.addEventListener('click', () => {
    prefs.flagMode = !prefs.flagMode;
    el.btnFlag.setAttribute('aria-pressed', String(prefs.flagMode));
    el.btnFlag.querySelector('.ft-state').textContent = prefs.flagMode ? 'ON' : 'OFF';
    saveJSON(STORE_PREFS, prefs);
    sfx.click();
  });

  el.btnSound.addEventListener('click', () => {
    prefs.sound = !prefs.sound;
    el.btnSound.setAttribute('aria-pressed', String(prefs.sound));
    saveJSON(STORE_PREFS, prefs);
    if (prefs.sound) sfx.click();
  });

  el.btnTheme.addEventListener('click', () => {
    prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveJSON(STORE_PREFS, prefs);
    sfx.click();
  });

  function applyTheme() {
    document.documentElement.dataset.theme = prefs.theme;
    el.btnTheme.setAttribute('aria-pressed', String(prefs.theme === 'dark'));
  }

  el.btnHelp.addEventListener('click', () => { el.help.hidden = false; sfx.click(); });
  el.helpClose.addEventListener('click', () => { el.help.hidden = true; });
  el.help.addEventListener('click', (e) => { if (e.target === el.help) el.help.hidden = true; });

  el.btnClearRecords.addEventListener('click', () => {
    Object.keys(best).forEach(k => delete best[k]);
    saveJSON(STORE_BEST, best);
    renderRecords();
    sfx.click();
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input')) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') { el.help.hidden = true; el.overlay.hidden = true; return; }
    if (k === 'r') { newGame(); sfx.click(); }
    else if (k === 'f') el.btnFlag.click();
    else if (k === 's') el.btnSound.click();
    else if (k === 't') el.btnTheme.click();
    else if (k === 'h') el.help.hidden ? el.btnHelp.click() : (el.help.hidden = true);
    else if (k === '1') setLevel('facil');
    else if (k === '2') setLevel('medio');
    else if (k === '3') setLevel('dificil');
  });

  let resizeId = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(fitCells, 120);
  });

  /* ==========================================================
     Bootstrap
     ========================================================== */
  applyTheme();
  el.btnSound.setAttribute('aria-pressed', String(prefs.sound));
  el.btnFlag.setAttribute('aria-pressed', String(prefs.flagMode));
  el.btnFlag.querySelector('.ft-state').textContent = prefs.flagMode ? 'ON' : 'OFF';
  el.customSub.textContent = `${LEVELS.custom.rows}×${LEVELS.custom.cols} · ${LEVELS.custom.mines} 💣`;
  renderRecords();
  setLevelSilent('facil');

  function setLevelSilent(level) {
    state.level = level;
    [...el.levels.children].forEach(b => {
      const active = b.dataset.level === level;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    newGame();
  }
})();
