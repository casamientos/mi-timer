import {
  HEIGHT_MAX,
  HEIGHT_MIN,
  WIDTH_MAX,
  WIDTH_MIN,
  type TimerData,
} from './timers';
import {
  calcularDesglose,
  calcularProgreso,
  formatearDos,
  formatearFecha,
} from './countdown';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function rounded(n: number): number {
  return Math.round(n);
}

export function timerCardHtml(timer: TimerData): string {
  const inicial = calcularDesglose(timer.endDate);
  const progreso = calcularProgreso(timer.startDate, timer.endDate);
  const dos = (n: number) => formatearDos(n);

  const bodyStyle = `--accent: ${escapeHtml(timer.color)}; border-color: ${escapeHtml(
    timer.color,
  )}; width: ${timer.width}px;${timer.height != null ? ` height: ${timer.height}px;` : ''}`;

  return `
  <article
    class="timer-card"
    data-timer-id="${escapeHtml(timer.id)}"
    data-start="${escapeHtml(timer.startDate)}"
    data-end="${escapeHtml(timer.endDate)}"
    data-locked="${timer.locked ? 'true' : 'false'}"
    style="${bodyStyle}"
  >
    <header class="timer-head">
      <span class="timer-dot" style="background-color: ${escapeHtml(
        timer.color,
      )}; box-shadow: 0 0 10px ${escapeHtml(timer.color)}"></span>
      <h2 class="timer-name">${escapeHtml(timer.name)}</h2>
      <button
        type="button"
        class="lock-btn"
        data-lock-btn
        title="${timer.locked ? 'Tamaño bloqueado. Clic para permitir redimensionar.' : 'Clic para bloquear el tamaño'}"
        aria-label="Bloquear o desbloquear el tamaño"
      >${timer.locked ? '🔒' : '🔓'}</button>
    </header>

    <div class="timer-countdown">
      <div class="nums">
        <span class="value" data-unit="days">${dos(inicial.dias)}</span>
        <span class="sep">:</span>
        <span class="value" data-unit="hours">${dos(inicial.horas)}</span>
        <span class="sep">:</span>
        <span class="value" data-unit="minutes">${dos(inicial.minutos)}</span>
        <span class="sep">:</span>
        <span class="value" data-unit="seconds">${dos(inicial.segundos)}</span>
      </div>
      <div class="labs">
        <span class="label">DÍAS</span>
        <span class="label">HRS</span>
        <span class="label">MIN</span>
        <span class="label">SEG</span>
      </div>
    </div>

    <div class="timer-bar">
      <div class="timer-bar-fill" data-bar style="width: ${progreso.porcentaje}%"></div>
    </div>
    <div class="timer-percent" data-percent>${progreso.porcentaje}%</div>

    <footer class="timer-foot">
      <span class="timer-when">Hasta: ${escapeHtml(formatearFecha(timer.endDate))}</span>
      <a class="timer-config" href="/mi-timer/config?id=${escapeHtml(timer.id)}">Configurar</a>
    </footer>

    <span class="resize-handle" data-resize-handle title="Arrastrá la esquina para redimensionar"></span>
  </article>
  `;
}

function renderizarCard(card: HTMLElement) {
  const end = card.dataset.end ?? '';
  const start = card.dataset.start ?? '';
  const desglose = calcularDesglose(end);
  const progreso = calcularProgreso(start, end);

  const put = (unit: string, value: string) => {
    const el = card.querySelector(`[data-unit="${unit}"]`);
    if (el) el.textContent = value;
  };

  if (desglose.terminado) {
    put('days', '00');
    put('hours', '00');
    put('minutes', '00');
    put('seconds', '00');
  } else {
    put('days', formatearDos(desglose.dias));
    put('hours', formatearDos(desglose.horas));
    put('minutes', formatearDos(desglose.minutos));
    put('seconds', formatearDos(desglose.segundos));
  }

  const bar = card.querySelector<HTMLElement>('[data-bar]');
  if (bar) bar.style.width = `${progreso.porcentaje}%`;

  const percent = card.querySelector('[data-percent]');
  if (percent) percent.textContent = `${progreso.porcentaje}%`;
}

export interface TimerCardCallbacks {
  onResize?: (id: string, width: number, height: number | null) => void;
  onLock?: (id: string, locked: boolean) => void;
}

const activeRoots = new WeakSet<ParentNode>();
const callbacksHolder = new WeakMap<ParentNode, TimerCardCallbacks>();

export function configurarTimerCards(root: ParentNode, callbacks: TimerCardCallbacks): void {
  callbacksHolder.set(root, callbacks);
}

function callbacksDe(root: ParentNode): TimerCardCallbacks {
  return callbacksHolder.get(root) ?? {};
}

function bindLock(root: ParentNode) {
  root.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-lock-btn]');
    if (!btn) return;
    const card = btn.closest<HTMLElement>('[data-timer-id]');
    if (!card) return;
    const id = card.dataset.timerId ?? '';
    const locked = card.dataset.locked !== 'true';
    card.dataset.locked = String(locked);
    btn.textContent = locked ? '🔒' : '🔓';
    btn.title = locked
      ? 'Tamaño bloqueado. Clic para permitir redimensionar.'
      : 'Clic para bloquear el tamaño';
    callbacksDe(root).onLock?.(id, locked);
  });
}

function bindResize(root: ParentNode) {
  root.addEventListener('pointerdown', (event) => {
    const e = event as PointerEvent;
    const handle = (e.target as HTMLElement).closest<HTMLElement>('[data-resize-handle]');
    if (!handle) return;
    const card = handle.closest<HTMLElement>('[data-timer-id]');
    if (!card) return;
    if (card.dataset.locked === 'true') return;

    e.preventDefault();
    handle.setPointerCapture?.(e.pointerId);

    const id = card.dataset.timerId ?? '';
    const rect = card.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = rect.width;
    const startH = rect.height;

    const move = (ev: PointerEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;
      const width = rounded(clamp(startW + deltaX, WIDTH_MIN, WIDTH_MAX));
      const height = rounded(clamp(startH + deltaY, HEIGHT_MIN, HEIGHT_MAX));
      card.style.width = `${width}px`;
      card.style.height = `${height}px`;
      card.classList.add('dragging');
    };

    const up = (ev: PointerEvent) => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      handle.releasePointerCapture?.(ev.pointerId);
      card.classList.remove('dragging');
      const width = rounded(parseFloat(card.style.width) || startW);
      const height = rounded(parseFloat(card.style.height) || startH);
      callbacksDe(root).onResize?.(id, width, height);
    };

    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  });
}

export function initTimerCards(
  root: ParentNode = document,
  callbacks?: TimerCardCallbacks,
  opts?: { bindInteractions?: boolean },
): void {
  if (callbacks) callbacksHolder.set(root, callbacks);
  if (activeRoots.has(root)) {
    return;
  }
  activeRoots.add(root);

  if (opts?.bindInteractions !== false) {
    bindLock(root);
    bindResize(root);
  }

  const tick = () => {
    root
      .querySelectorAll<HTMLElement>('[data-timer-id]')
      .forEach(renderizarCard);
  };
  tick();
  window.setInterval(tick, 1000);
}