// Datos de la demo del sistema de gestión. Todo vive en el navegador del visitante
// y se genera de nuevo (con fechas relativas a hoy) al elegir sector o restablecer.

export type SectorId = 'clinica' | 'taller' | 'tienda';

export interface Client { id: string; name: string; phone: string; email: string; tag: string; since: string; notes: string }
export interface Appt { id: string; clientId: string; date: string; time: string; duration: number; service: string; staff: string; status: 'pendiente' | 'confirmada' | 'hecha' | 'cancelada' }
export interface Deal { id: string; clientId: string; title: string; value: number; stage: number }
export interface Product { id: string; name: string; sku: string; stock: number; min: number; price: number }
export interface Line { desc: string; qty: number; price: number }
export interface Invoice { id: string; number: string; clientId: string; date: string; due: string; lines: Line[]; paid: boolean }

export interface DemoState {
  version: 1;
  sector: SectorId;
  businessName: string;
  clients: Client[];
  appts: Appt[];
  deals: Deal[];
  products: Product[];
  invoices: Invoice[];
  missions: Record<string, boolean>;
}

export interface Sector {
  label: string;
  emoji: string;
  business: string;
  clients: string;
  client: string;
  staff: string[];
  services: { name: string; minutes: number; price: number }[];
  products: { name: string; price: number; min: number }[];
  deals: { title: string; value: number }[];
  tags: string[];
  apptsLabel: string;
}

export const SECTORS: Record<SectorId, Sector> = {
  clinica: {
    label: 'Clínica / salud',
    emoji: '🩺',
    business: 'Clínica FisioVital',
    clients: 'Pacientes',
    client: 'Paciente',
    staff: ['Laura', 'Marc', 'Sara'],
    services: [
      { name: 'Sesión de fisioterapia', minutes: 45, price: 45 },
      { name: 'Primera valoración', minutes: 60, price: 55 },
      { name: 'Punción seca', minutes: 30, price: 40 },
      { name: 'Pilates terapéutico', minutes: 50, price: 35 },
    ],
    products: [
      { name: 'Vendaje neuromuscular (rollo)', price: 9.5, min: 10 },
      { name: 'Crema de masaje 1 L', price: 18, min: 4 },
      { name: 'Agujas de punción (caja 100)', price: 22, min: 5 },
      { name: 'Sábanas desechables (rollo)', price: 12, min: 6 },
      { name: 'Gel conductor 5 L', price: 15, min: 2 },
      { name: 'Bandas elásticas', price: 7, min: 8 },
      { name: 'Bolsas de frío/calor', price: 6, min: 6 },
      { name: 'Guantes de nitrilo (caja)', price: 8, min: 5 },
    ],
    deals: [
      { title: 'Bono 10 sesiones', value: 400 },
      { title: 'Convenio con empresa (fisio laboral)', value: 2400 },
      { title: 'Programa de readaptación deportiva', value: 650 },
      { title: 'Bono pilates trimestral', value: 320 },
    ],
    tags: ['Activo', 'Bono', 'Mutua', 'Nuevo'],
    apptsLabel: 'Citas',
  },
  taller: {
    label: 'Taller / servicios técnicos',
    emoji: '🔧',
    business: 'Taller Ruiz',
    clients: 'Clientes',
    client: 'Cliente',
    staff: ['Pedro', 'Jordi', 'Ana'],
    services: [
      { name: 'Cambio de aceite y filtros', minutes: 45, price: 89 },
      { name: 'Revisión pre-ITV', minutes: 60, price: 49 },
      { name: 'Cambio de pastillas de freno', minutes: 90, price: 120 },
      { name: 'Diagnosis electrónica', minutes: 30, price: 45 },
    ],
    products: [
      { name: 'Aceite 5W30 (5 L)', price: 38, min: 8 },
      { name: 'Filtro de aceite', price: 9, min: 10 },
      { name: 'Pastillas de freno delanteras', price: 42, min: 4 },
      { name: 'Escobillas limpiaparabrisas', price: 14, min: 6 },
      { name: 'Batería 70 Ah', price: 95, min: 2 },
      { name: 'Líquido de frenos DOT4', price: 11, min: 5 },
      { name: 'Filtro de aire', price: 16, min: 6 },
      { name: 'Anticongelante 5 L', price: 19, min: 4 },
    ],
    deals: [
      { title: 'Mantenimiento flota 6 furgonetas', value: 3600 },
      { title: 'Cambio de embrague', value: 780 },
      { title: 'Neumáticos 4 ruedas', value: 420 },
      { title: 'Reparación chapa y pintura', value: 1150 },
    ],
    tags: ['Particular', 'Empresa', 'Flota', 'Nuevo'],
    apptsLabel: 'Citas de taller',
  },
  tienda: {
    label: 'Tienda / distribución',
    emoji: '📦',
    business: 'Distribuciones Mar',
    clients: 'Clientes',
    client: 'Cliente',
    staff: ['Marta', 'Joan', 'Lucía'],
    services: [
      { name: 'Visita comercial', minutes: 60, price: 0 },
      { name: 'Entrega de pedido', minutes: 30, price: 0 },
      { name: 'Demostración de producto', minutes: 45, price: 0 },
      { name: 'Reposición en tienda', minutes: 40, price: 0 },
    ],
    products: [
      { name: 'Café en grano 1 kg', price: 16.5, min: 30 },
      { name: 'Leche entera (caja 6 L)', price: 6.9, min: 40 },
      { name: 'Azúcar en sobres (1000 u.)', price: 12, min: 10 },
      { name: 'Vasos de cartón 8 oz (50 u.)', price: 4.2, min: 50 },
      { name: 'Tapas para vasos (100 u.)', price: 3.8, min: 40 },
      { name: 'Chocolate a la taza 1 kg', price: 8.5, min: 15 },
      { name: 'Infusiones surtidas (100 u.)', price: 9.9, min: 12 },
      { name: 'Servilletas (paquete 500)', price: 5.5, min: 20 },
    ],
    deals: [
      { title: 'Pedido mensual hotel', value: 1850 },
      { title: 'Nueva cafetería en el centro', value: 2900 },
      { title: 'Renovación contrato bar', value: 1200 },
      { title: 'Cadena de panaderías (5 locales)', value: 6400 },
    ],
    tags: ['Hostelería', 'Tienda', 'Mayorista', 'Nuevo'],
    apptsLabel: 'Visitas y entregas',
  },
};

export const STAGES = ['Nuevo', 'Contactado', 'Propuesta', 'Negociación', 'Ganado'];

const FIRST = ['Laura', 'Pedro', 'Ana', 'Jordi', 'Marta', 'Carlos', 'Lucía', 'Sergio', 'Elena', 'Javier', 'Nuria', 'David', 'Sofía', 'Pablo'];
const LAST = ['García', 'Martínez', 'López', 'Puig', 'Sánchez', 'Ferrer', 'Romero', 'Vidal', 'Navarro', 'Torres', 'Serra', 'Molina', 'Castro', 'Ortega'];
const COMPANIES = ['Hotel Mirador', 'Cafetería Central', 'Bar La Plaça', 'Panaderías Sol', 'Restaurante Mar Blau', 'Hostal Gràcia', 'Bodega Antigua'];

export const uid = () => Math.random().toString(36).slice(2, 9);

export function iso(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function mondayOf(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7;
  return addDays(x, -day);
}

// Aleatorio con semilla: los mismos datos cada vez que se genera la demo.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function seed(sectorId: SectorId): DemoState {
  const s = SECTORS[sectorId];
  const r = rng(sectorId.length * 97 + 7);
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const clients: Client[] = Array.from({ length: 14 }, (_, i) => {
    const name = sectorId === 'tienda' && i < COMPANIES.length ? COMPANIES[i] : `${FIRST[i % FIRST.length]} ${LAST[(i * 5 + 3) % LAST.length]}`;
    const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.');
    return {
      id: `c${i + 1}`,
      name,
      phone: `+34 600 000 ${String(101 + i * 7).padStart(3, '0')}`,
      email: `${slug}@example.com`,
      tag: i < 2 ? s.tags[3] : pick(s.tags.slice(0, 3)),
      since: iso(addDays(t0, -Math.floor(20 + r() * 500))),
      notes: i === 0 ? 'Prefiere que le llamen por la mañana.' : '',
    };
  });

  const appts: Appt[] = [];
  const start = addDays(mondayOf(t0), -7);
  for (let d = 0; d < 20; d++) {
    const date = addDays(start, d);
    if (date.getDay() === 0) continue;
    const n = date.getDay() === 6 ? 2 : 3 + Math.floor(r() * 3);
    const hours = [9, 10, 11, 12, 16, 17, 18].sort(() => r() - 0.5).slice(0, n).sort((a, b) => a - b);
    for (const h of hours) {
      const svc = pick(s.services);
      const past = date < t0;
      appts.push({
        id: uid(),
        clientId: pick(clients).id,
        date: iso(date),
        time: `${String(h).padStart(2, '0')}:${r() > 0.5 ? '30' : '00'}`,
        duration: svc.minutes,
        service: svc.name,
        staff: pick(s.staff),
        status: past ? (r() > 0.1 ? 'hecha' : 'cancelada') : r() > 0.4 ? 'confirmada' : 'pendiente',
      });
    }
  }

  const deals: Deal[] = s.deals.flatMap((d, i) => [
    { id: uid(), clientId: clients[i + 2].id, title: d.title, value: d.value, stage: i },
    { id: uid(), clientId: clients[i + 7].id, title: d.title, value: Math.round(d.value * (0.6 + r() * 0.6)), stage: [4, 2, 4, 1][i] },
  ]);

  const products: Product[] = s.products.map((p, i) => ({
    id: uid(),
    name: p.name,
    sku: `${sectorId.slice(0, 2).toUpperCase()}-${String(1001 + i * 13)}`,
    stock: i === 1 || i === 4 ? Math.max(0, p.min - 2 - (i % 2)) : p.min + 3 + Math.floor(r() * p.min * 2),
    min: p.min,
    price: p.price,
  }));

  const invoices: Invoice[] = [];
  let num = 1;
  for (let m = 5; m >= 0; m--) {
    const count = 6 + Math.floor(r() * 5) + (5 - m);
    for (let k = 0; k < count; k++) {
      const date = new Date(t0.getFullYear(), t0.getMonth() - m, 1 + Math.floor(r() * 26));
      if (date > t0) continue;
      const lines: Line[] = sectorId === 'tienda'
        ? Array.from({ length: 2 + Math.floor(r() * 3) }, () => { const p = pick(s.products); return { desc: p.name, qty: 5 + Math.floor(r() * 30), price: p.price }; })
        : Array.from({ length: 1 + Math.floor(r() * 2) }, () => { const sv = pick(s.services); return { desc: sv.name, qty: 1 + Math.floor(r() * 3), price: sv.price }; });
      const due = addDays(date, 30);
      invoices.push({
        id: uid(),
        number: `${date.getFullYear()}-${String(num++).padStart(4, '0')}`,
        clientId: pick(clients).id,
        date: iso(date),
        due: iso(due),
        lines,
        paid: m > 1 ? true : due < t0 ? r() > 0.25 : r() > 0.55,
      });
    }
  }

  return { version: 1, sector: sectorId, businessName: s.business, clients, appts, deals, products, invoices, missions: {} };
}

export const IVA = 0.21;
export const subtotal = (inv: Pick<Invoice, 'lines'>) => inv.lines.reduce((a, l) => a + l.qty * l.price, 0);
export const total = (inv: Pick<Invoice, 'lines'>) => subtotal(inv) * (1 + IVA);

const KEY = 'konte-demo-v1';

export function loadDemo(): DemoState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s.version === 1 ? s : null;
  } catch {
    return null;
  }
}

export function saveDemo(s: DemoState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function clearDemo() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
