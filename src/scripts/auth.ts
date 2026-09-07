export interface SesionUsuario {
  uid: string;
  email: string;
  displayName: string | null;
}

interface CuentaStored {
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: number;
}

export type AuthStateListener = (user: SesionUsuario | null) => void;

const USERS_KEY = 'mi-timer:users';
const SESSION_KEY = 'mi-timer:session';

const listeners = new Set<AuthStateListener>();

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function randomHex(len = 16): string {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let out = '';
  while (out.length < len) out += Math.random().toString(16).slice(2);
  return out.slice(0, len);
}

async function sha256(text: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const digest = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    /* usa fallback */
  }
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = (h1 * 33) ^ c;
    h2 = (h2 * 31) ^ c;
  }
  return `fb-${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return sha256(`${salt}:${password}`);
}

function leerCuentas(): CuentaStored[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function guardarCuentas(cuentas: CuentaStored[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(cuentas));
}

function leerSesionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed.userId ?? null) : null;
  } catch {
    return null;
  }
}

function guardarSesion(userId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

export function usuarioActual(): SesionUsuario | null {
  if (typeof window === 'undefined') return null;
  const userId = leerSesionId();
  if (!userId) return null;
  const cuenta = leerCuentas().find((c) => c.id === userId);
  if (!cuenta) {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
  return {
    uid: cuenta.id,
    email: cuenta.email,
    displayName: cuenta.name,
  };
}

function emitirCambio(): void {
  const user = usuarioActual();
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch {
      /* listener con error no bloquea al resto */
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('authchanged', { detail: { user } }),
    );
  }
}

export function onAuth(listener: AuthStateListener): () => void {
  listener(usuarioActual());
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function loginUsuario(email: string, password: string): Promise<SesionUsuario> {
  const emailNormalizado = email.trim().toLowerCase();
  const cuenta = leerCuentas().find(
    (c) => c.email.toLowerCase() === emailNormalizado,
  );
  if (!cuenta) {
    throw new Error('No existe una cuenta con ese email.');
  }
  const hash = await hashPassword(password, cuenta.salt);
  if (hash !== cuenta.hash) {
    throw new Error('Contraseña incorrecta.');
  }
  guardarSesion(cuenta.id);
  emitirCambio();
  return {
    uid: cuenta.id,
    email: cuenta.email,
    displayName: cuenta.name,
  };
}

export async function registrarUsuario(
  nombre: string,
  email: string,
  password: string,
): Promise<SesionUsuario> {
  const emailNormalizado = email.trim().toLowerCase();
  const cuentas = leerCuentas();
  const existente = cuentas.find(
    (c) => c.email.toLowerCase() === emailNormalizado,
  );
  if (existente) {
    throw new Error('Ya existe una cuenta con ese email.');
  }

  const salt = randomHex(16);
  const hash = await hashPassword(password, salt);
  const nueva: CuentaStored = {
    id: `user-${uuid()}`,
    name: nombre.trim(),
    email: emailNormalizado,
    salt,
    hash,
    createdAt: Date.now(),
  };

  cuentas.push(nueva);
  guardarCuentas(cuentas);
  guardarSesion(nueva.id);
  emitirCambio();

  return {
    uid: nueva.id,
    email: nueva.email,
    displayName: nueva.name,
  };
}

export async function cerrarSesion(): Promise<void> {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
  emitirCambio();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === SESSION_KEY || event.key === USERS_KEY) {
      emitirCambio();
    }
  });
}