import type { TimerData } from './timers';
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

export function timerCardHtml(timer: TimerData): string {
  const inicial = calcularDesglose(timer.endDate);
  const progreso = calcularProgreso(timer.startDate, timer.endDate);

  const dos = (n: number) => formatearDos(n);

  return `
  <article
    class="timer-card size-${escapeHtml(timer.size)}"
    data-timer-id="${escapeHtml(timer.id)}"
    data-start="${escapeHtml(timer.startDate)}"
    data-end="${escapeHtml(timer.endDate)}"
    style="--accent: ${escapeHtml(timer.color)}; border-color: ${escapeHtml(timer.color)}"
  >
    <header class="timer-head">
      <span class="timer-dot" style="background-color: ${escapeHtml(timer.color)}; box-shadow: 0 0 10px ${escapeHtml(timer.color)}"></span>
      <h2 class="timer-name">${escapeHtml(timer.name)}</h2>
    </header>

    <div class="timer-countdown">
      <div class="unit">
        <span class="value" data-unit="days">${dos(inicial.dias)}</span>
        <span class="label">DÍAS</span>
      </div>
      <span class="sep">:</span>
      <div class="unit">
        <span class="value" data-unit="hours">${dos(inicial.horas)}</span>
        <span class="label">HRS</span>
      </div>
      <span class="sep">:</span>
      <div class="unit">
        <span class="value" data-unit="minutes">${dos(inicial.minutos)}</span>
        <span class="label">MIN</span>
      </div>
      <span class="sep">:</span>
      <div class="unit">
        <span class="value" data-unit="seconds">${dos(inicial.segundos)}</span>
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

const activeRoots = new WeakSet<ParentNode>();

export function initTimerCards(root: ParentNode = document): void {
  if (activeRoots.has(root)) return;
  activeRoots.add(root);

  const tick = () => {
    root
      .querySelectorAll<HTMLElement>('[data-timer-id]')
      .forEach(renderizarCard);
  };
  tick();
  window.setInterval(tick, 1000);
}