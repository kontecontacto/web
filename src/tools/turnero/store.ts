// Estado del turnero. Se guarda en el navegador y se comparte entre el panel y la pantalla
// abiertos en el mismo equipo (BroadcastChannel + evento storage como respaldo).

export interface Queue {
  id: string;
  name: string;
  prefix: string;
  issued: number;
  current: number;
}

export interface Counter {
  id: string;
  name: string;
}

export interface Call {
  id: string;
  label: string;
  queueName: string;
  counter: string;
  at: number;
}

export interface Settings {
  voice: boolean;
  chime: boolean;
  dispenser: boolean;
  theme: 'azul' | 'oscuro' | 'claro';
  message: string;
  voiceTemplate: string;
}

export interface TurneroState {
  businessName: string;
  queues: Queue[];
  counters: Counter[];
  activeQueueId: string;
  activeCounterId: string;
  history: Call[];
  settings: Settings;
  stats: { day: string; served: number };
}

const STORAGE_KEY = 'konte-turnero-v1';
const CHANNEL = 'konte-turnero';

export const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().slice(0, 10);

export function defaultState(): TurneroState {
  const q = { id: uid(), name: 'General', prefix: 'A', issued: 0, current: 0 };
  const c = { id: uid(), name: 'Mostrador 1' };
  return {
    businessName: 'Mi negocio',
    queues: [q],
    counters: [c, { id: uid(), name: 'Mostrador 2' }],
    activeQueueId: q.id,
    activeCounterId: c.id,
    history: [],
    settings: {
      voice: true,
      chime: true,
      dispenser: false,
      theme: 'azul',
      message: 'Bienvenido. Por favor, espere a que aparezca su número en pantalla.',
      voiceTemplate: 'Turno {turno}, {puesto}',
    },
    stats: { day: today(), served: 0 },
  };
}

export function loadState(): TurneroState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = { ...defaultState(), ...JSON.parse(raw) } as TurneroState;
      if (s.stats.day !== today()) s.stats = { day: today(), served: 0 };
      return s;
    }
  } catch {}
  return defaultState();
}

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (!channel && typeof BroadcastChannel !== 'undefined') channel = new BroadcastChannel(CHANNEL);
  return channel;
}

export type TurneroMessage = { type: 'state'; state: TurneroState } | { type: 'call'; state: TurneroState; call: Call };

export function saveState(state: TurneroState, call?: Call) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (call) localStorage.setItem(`${STORAGE_KEY}-lastcall`, JSON.stringify(call));
  } catch {}
  const msg: TurneroMessage = call ? { type: 'call', state, call } : { type: 'state', state };
  getChannel()?.postMessage(msg);
}

export function subscribe(onMessage: (msg: TurneroMessage) => void) {
  const ch = getChannel();
  const handler = (e: MessageEvent<TurneroMessage>) => onMessage(e.data);
  ch?.addEventListener('message', handler);
  // Respaldo para navegadores sin BroadcastChannel
  const onStorage = (e: StorageEvent) => {
    if (e.key === `${STORAGE_KEY}-lastcall` && e.newValue) onMessage({ type: 'call', state: loadState(), call: JSON.parse(e.newValue) });
    else if (e.key === STORAGE_KEY) onMessage({ type: 'state', state: loadState() });
  };
  if (!ch) window.addEventListener('storage', onStorage);
  return () => {
    ch?.removeEventListener('message', handler);
    window.removeEventListener('storage', onStorage);
  };
}

export const formatNumber = (q: Pick<Queue, 'prefix'>, n: number) => `${q.prefix}${String(n).padStart(2, '0')}`;

export function callText(template: string, call: Call) {
  // "A07" se lee mejor como "A 7"
  const spoken = call.label.replace(/^([A-Za-zÑñ]*)0*(\d+)$/, (_m, p: string, n: string) => `${p ? p + ', ' : ''}${n}`);
  return template.replace('{turno}', spoken).replace('{puesto}', call.counter);
}
