export interface TimerData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  color: string;
  width: number;
  height: number | null;
  locked: boolean;
  createdAt: number;
}

export interface TimerCambios {
  width?: number;
  height?: number | null;
  locked?: boolean;
  name?: string;
  startDate?: string;
  endDate?: string;
  color?: string;
}

const SIZES: string[] = ['small', 'medium', 'large'];

export const WIDTH_MIN = 220;
export const WIDTH_MAX = 560;
export const HEIGHT_MIN = 170;
export const HEIGHT_MAX = 560;
export const WIDTH_DEFAULT = 320;

export type TimerSize = 'small' | 'medium' | 'large';

export const TAMAÑOS: { value: TimerSize; label: string; hint: string; width: number }[] = [
  { value: 'small', label: 'Compacto', hint: '260 px · tarjeta pequeña', width: 260 },
  { value: 'medium', label: 'Mediano', hint: '330 px · tarjeta estándar', width: 330 },
  { value: 'large', label: 'Grande', hint: '430 px · tarjeta destacada', width: 430 },
];

const SIZE_WIDTH: Partial<Record<TimerSize, number>> = {
  small: 260,
  medium: 330,
  large: 430,
};

export function esTamañoValido(size: string): size is TimerSize {
  return SIZES.includes(size);
}

export function normalizarTimer(t: Partial<TimerData> & Record<string, unknown>): TimerData {
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
  const rawWidth = t.width;
  const width =
    typeof rawWidth === 'number'
      ? Math.round(clamp(rawWidth, WIDTH_MIN, WIDTH_MAX))
      : SIZE_WIDTH[t.size as TimerSize] ?? WIDTH_DEFAULT;
  const rawHeight = t.height;
  return {
    id: String(t.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    name: String(t.name ?? 'Sin nombre'),
    startDate: String(t.startDate ?? new Date().toISOString()),
    endDate: String(t.endDate ?? new Date().toISOString()),
    color: typeof t.color === 'string' && t.color ? t.color : '#7bb5e3',
    width,
    height: typeof rawHeight === 'number' && rawHeight >= HEIGHT_MIN
      ? Math.round(clamp(rawHeight, HEIGHT_MIN, HEIGHT_MAX))
      : null,
    locked: Boolean(t.locked),
    createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
  };
}

function storageKey(userId: string): string {
  return `mi-timer:${userId}`;
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `timer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generarTimer(data: Omit<TimerData, 'id' | 'createdAt'>): TimerData {
  return {
    id: uid(),
    ...data,
    createdAt: Date.now(),
  };
}

export function leerTimers(userId: string): TimerData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { timers?: unknown[] };
    if (!Array.isArray(parsed.timers)) return [];
    return parsed.timers.map((t) => normalizarTimer(t as Record<string, unknown>));
  } catch {
    return [];
  }
}

function guardarTimers(userId: string, timers: TimerData[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    storageKey(userId),
    JSON.stringify({ userId, timers }),
  );
}

export function agregarTimer(
  userId: string,
  data: Omit<TimerData, 'id' | 'createdAt'>,
): TimerData {
  const timer = generarTimer(data);
  const timers = leerTimers(userId);
  timers.push(timer);
  guardarTimers(userId, timers);
  return timer;
}

export function actualizarTimer(userId: string, timer: TimerData): boolean {
  const timers = leerTimers(userId);
  const index = timers.findIndex((t) => t.id === timer.id);
  if (index === -1) return false;
  timers[index] = { ...timers[index], ...timer };
  guardarTimers(userId, timers);
  return true;
}

export function actualizarCampoTimer(userId: string, id: string, cambios: TimerCambios): boolean {
  const timers = leerTimers(userId);
  const index = timers.findIndex((t) => t.id === id);
  if (index === -1) return false;
  timers[index] = { ...timers[index], ...cambios };
  guardarTimers(userId, timers);
  return true;
}

export function eliminarTimer(userId: string, id: string): boolean {
  const timers = leerTimers(userId);
  const restantes = timers.filter((t) => t.id !== id);
  if (restantes.length === timers.length) return false;
  guardarTimers(userId, restantes);
  return true;
}

export function encontrarTimer(userId: string, id: string): TimerData | null {
  const timers = leerTimers(userId);
  return timers.find((t) => t.id === id) ?? null;
}

export const COLORES_PREDEFINIDOS: string[] = [
  '#7bb5e3',
  '#65a11c',
  '#e8c45a',
  '#c06ef0',
  '#f0766a',
  '#4dd0a6',
  '#ff9d4d',
  '#6ee7e7',
  '#f05a9d',
  '#9aa4ff',
  '#ffffff',
  '#e0e0e0',
];