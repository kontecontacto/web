import { createContext, useContext, type ReactNode } from 'react';
import { SECTORS, type DemoState, type Sector } from './data';

export const MISSIONS = [
  { id: 'cliente', text: 'Abre la ficha de un cliente' },
  { id: 'cita', text: 'Crea una cita en la agenda' },
  { id: 'embudo', text: 'Mueve una oportunidad de etapa' },
  { id: 'stock', text: 'Registra una salida de stock' },
  { id: 'factura', text: 'Crea una factura y mírala en PDF' },
] as const;
export type MissionId = (typeof MISSIONS)[number]['id'];

interface Ctx {
  state: DemoState;
  sector: Sector;
  update: (fn: (s: DemoState) => DemoState) => void;
  done: (m: MissionId) => void;
  toast: (msg: string) => void;
  openCta: (reason?: string) => void;
}

export const DemoCtx = createContext<Ctx>(null as unknown as Ctx);
export const useDemo = () => {
  const c = useContext(DemoCtx);
  return { ...c, sector: SECTORS[c.state.sector] };
};

export const eur = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 });
export const fmtDate = (d: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  new Date(`${d}T12:00:00`).toLocaleDateString('es-ES', opts);

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="font-display text-xl font-black uppercase leading-tight">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-900" aria-label="Cerrar">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputCls = 'w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0055FF]';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

export function Btn({ children, onClick, kind = 'primary', type = 'button', className = '' }: { children: ReactNode; onClick?: () => void; kind?: 'primary' | 'ghost' | 'dark' | 'green'; type?: 'button' | 'submit'; className?: string }) {
  const k = {
    primary: 'bg-[#0055FF] hover:bg-blue-700 text-white',
    dark: 'bg-gray-900 hover:bg-gray-700 text-white',
    green: 'bg-green-500 hover:bg-green-600 text-white',
    ghost: 'bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900',
  }[kind];
  return (
    <button type={type} onClick={onClick} className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${k} ${className}`}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: 'gray' | 'green' | 'red' | 'amber' | 'blue' }) {
  const t = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-800',
    blue: 'bg-blue-100 text-blue-700',
  }[tone];
  return <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wide whitespace-nowrap ${t}`}>{children}</span>;
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900">{title}</h1>
        {sub && <p className="text-sm text-gray-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-2xl ${className}`}>{children}</div>
);
