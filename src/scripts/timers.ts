export type TimerSize = 'small' | 'medium' | 'large';

export interface TimerData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  color: string;
  size: TimerSize;
  createdAt: number;
}

export interface TimerFolder {
  userId: string;
  timers: TimerData[];
}

const SIZES: TimerSize[] = ['small', 'medium', 'large'];

const VALID_SIZES = new Set<string>(SIZES);

function storageKey(userId: string): string {
  return `mi-timer:${userId}`;
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `timer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generarTimer(
  data: Omit<TimerData, 'id' | 'createdAt'>,
): TimerData {
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
    const parsed = JSON.parse(raw) as TimerFolder;
    return Array.isArray(parsed.timers) ? parsed.timers : [];
  } catch {
    return [];
  }
}

function guardarTimers(userId: string, timers: TimerData[]): void {
  if (typeof window === 'undefined') return;
  const folder: TimerFolder = { userId, timers };
  window.localStorage.setItem(storageKey(userId), JSON.stringify(folder));
}

export function agregarTimer(userId: string, data: Omit<TimerData, 'id' | 'createdAt'>): TimerData {
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

export function esTamañoValido(size: string): size is TimerSize {
  return VALID_SIZES.has(size);
}

export const TAMAÑOS: { value: TimerSize; label: string; hint: string }[] = [
  { value: 'small', label: 'Compacto', hint: 'Tarjeta pequeña' },
  { value: 'medium', label: 'Mediano', hint: 'Tarjeta estándar' },
  { value: 'large', label: 'Grande', hint: 'Tarjeta destacada' },
];

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