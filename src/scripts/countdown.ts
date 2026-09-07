export const UNIDADES_SEGUNDO = {
  dia: 86400,
  hora: 3600,
  minuto: 60,
  segundo: 1,
} as const;

export interface Desglose {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  terminado: boolean;
  totalMs: number;
  restanteMs: number;
}

export function calcularDesglose(finISO: string, ahoraMs = Date.now()): Desglose {
  const fin = new Date(finISO).getTime();
  const restante = fin - ahoraMs;
  if (restante <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, terminado: true, totalMs: 0, restanteMs: 0 };
  }
  const d = Math.floor(restante / (UNIDADES_SEGUNDO.dia * 1000));
  const h = Math.floor((restante / (UNIDADES_SEGUNDO.hora * 1000)) % 24);
  const m = Math.floor((restante / (UNIDADES_SEGUNDO.minuto * 1000)) % 60);
  const s = Math.floor((restante / 1000) % 60);
  return { dias: d, horas: h, minutos: m, segundos: s, terminado: false, totalMs: restante, restanteMs: restante };
}

export interface Progreso {
  porcentaje: number;
  totalMs: number;
  restanteMs: number;
}

export function calcularProgreso(inicioISO: string, finISO: string, ahoraMs = Date.now()): Progreso {
  const inicio = new Date(inicioISO).getTime();
  const fin = new Date(finISO).getTime();
  const total = fin - inicio;
  if (total <= 0) {
    return { porcentaje: 0, totalMs: 0, restanteMs: 0 };
  }
  const restante = Math.max(0, fin - ahoraMs);
  const porcentaje = Math.min(100, Math.max(0, (restante / total) * 100));
  return { porcentaje: Math.floor(porcentaje), totalMs: total, restanteMs: restante };
}

export function formatearDos(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatearFecha(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function aInputLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}