import { normalizarTimer, type TimerCambios, type TimerData } from './timers';

const DEMO_KEY = 'mi-timer:demo:custom';

interface DemoCustom extends Partial<TimerCambios> {}

function leerCustom(): Record<string, DemoCustom> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function guardarCustom(custom: Record<string, DemoCustom>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_KEY, JSON.stringify(custom));
}

export function guardarCustomDemo(id: string, cambios: DemoCustom): void {
  const custom = leerCustom();
  custom[id] = { ...(custom[id] ?? {}), ...cambios };
  guardarCustom(custom);
}

export function limpiarCustomDemo(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_KEY);
}

function baseDemo(): TimerData[] {
  const now = Date.now();
  const DIA = 24 * 60 * 60 * 1000;
  const atras = (dias: number) => new Date(now - dias * DIA).toISOString();
  const despues = (dias: number) => new Date(now + dias * DIA).toISOString();
  const t = (
    id: string,
    name: string,
    endIn: number,
    color: string,
    width: number,
    height: number | null,
  ): TimerData =>
    normalizarTimer({
      id,
      name,
      color,
      width,
      height,
      locked: false,
      startDate: atras(15),
      endDate: despues(endIn),
      createdAt: now,
    });

  return [
    t('demo-calc', '¡CALCULO 2!', 20, '#7bb5e3', 320, null),
    t('demo-cumple', 'Cumpleaños de mamá', 6, '#f05a9d', 270, null),
    t('demo-entrega', 'Entrega del proyecto', 2, '#ff9d4d', 300, null),
    t('demo-vacaciones', 'Vacaciones en la playa', 45, '#4dd0a6', 360, null),
    t('demo-ano-nuevo', 'Año nuevo', 115, '#e8c45a', 400, null),
    t('demo-concierto', 'Concierto de la banda', 12, '#c06ef0', 280, null),
    t('demo-vuelo', 'Vuelo a Japón', 75, '#6ee7e7', 340, null),
    t('demo-examen', 'Examen B2', 9, '#f0766a', 310, null),
    t('demo-mudanza', 'Mudanza', 33, '#9aa4ff', 250, null),
    t('demo-cena', 'Cena de aniversario', 4, '#65a11c', 350, null),
  ];
}

export function timersDemo(): TimerData[] {
  const custom = leerCustom();
  return baseDemo().map((t) => {
    const c = custom[t.id];
    if (!c) return t;
    return {
      ...t,
      width: c.width ?? t.width,
      height: c.height ?? t.height,
      locked: c.locked ?? t.locked,
    };
  });
}