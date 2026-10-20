import { useCallback, useEffect, useRef, useState } from 'react';
import { SECTORS, seed, loadDemo, saveDemo, clearDemo, type DemoState, type SectorId } from './data';
import { DemoCtx, MISSIONS, Modal, Btn, Field, inputCls, type MissionId } from './ui';
import Dashboard from './Dashboard';
import Clients from './Clients';
import Agenda from './Agenda';
import Deals from './Deals';
import Stock from './Stock';
import Invoices from './Invoices';
import { sendForm } from '../../scripts/send';
import { SITE, whatsappLink } from '../../data/site';

const icon = (d: string) => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />;

const VIEWS = [
  { id: 'panel', label: 'Panel', icon: icon('<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>') },
  { id: 'clientes', label: 'Clientes', icon: icon('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3 3 0 0 1 0 6M18 14.5c1.9.8 3 2.8 3 5.5"/>') },
  { id: 'agenda', label: 'Agenda', icon: icon('<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>') },
  { id: 'ventas', label: 'Ventas', icon: icon('<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>') },
  { id: 'stock', label: 'Stock', icon: icon('<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>') },
  { id: 'facturas', label: 'Facturas', icon: icon('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>') },
] as const;
type View = (typeof VIEWS)[number]['id'];

const track = (event: string, params: Record<string, unknown> = {}) => (window as any).gtag?.('event', event, params);

export default function DemoApp() {
  const [state, setState] = useState<DemoState | null>(() => loadDemo());
  const [view, setView] = useState<View>(() => (VIEWS.some((v) => v.id === location.hash.slice(1)) ? (location.hash.slice(1) as View) : 'panel'));
  const [toastMsg, setToastMsg] = useState('');
  const [cta, setCta] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const toastTimer = useRef<number>();

  useEffect(() => { if (state) saveDemo(state); }, [state]);
  useEffect(() => { history.replaceState(null, '', `#${view}`); window.scrollTo(0, 0); }, [view]);

  const update = useCallback((fn: (s: DemoState) => DemoState) => setState((s) => (s ? fn(s) : s)), []);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(''), 3200);
  }, []);
  const done = useCallback((m: MissionId) => {
    setState((s) => {
      if (!s || s.missions[m]) return s;
      const missions = { ...s.missions, [m]: true };
      track('demo_mission', { mission: m });
      if (MISSIONS.every((x) => missions[x.id])) setTimeout(() => setCta('misiones'), 1800);
      return { ...s, missions };
    });
  }, []);

  function start(sector: SectorId) {
    setState(seed(sector));
    setPicking(false);
    setView('panel');
    track('demo_start', { sector });
  }

  if (!state || picking) return <SectorPicker onPick={start} onCancel={state ? () => setPicking(false) : undefined} />;

  return (
    <DemoCtx.Provider value={{ state, sector: SECTORS[state.sector], update, done, toast, openCta: (r) => setCta(r || 'boton') }}>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans md:pl-60 pb-20 md:pb-0">
        {/* Barra de demo */}
        <div className="sticky top-0 z-30 bg-amber-300 text-amber-950 text-xs sm:text-sm">
          <div className="px-3 sm:px-5 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 justify-between">
            <p className="font-bold">🧪 <span className="hidden sm:inline">Estás en una </span>DEMO con datos de prueba. Toca lo que quieras.</p>
            <div className="flex items-center gap-3 font-bold">
              <button onClick={() => setPicking(true)} className="underline">Cambiar negocio</button>
              <button onClick={() => { if (confirm('¿Restablecer los datos de prueba?')) { clearDemo(); start(state.sector); toast('Datos de prueba restablecidos'); } }} className="underline">Restablecer</button>
              <button onClick={() => setCta('barra')} className="px-3 py-1 rounded-md bg-gray-900 text-white">Quiero uno así →</button>
            </div>
          </div>
        </div>

        {/* Menú lateral (escritorio) */}
        <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 bg-gray-900 text-white flex-col z-40">
          <div className="p-5 border-b border-white/10">
            <div className="w-10 h-10 bg-[#0055FF] font-display font-black text-xl flex items-center justify-center mb-3">{state.businessName.charAt(0)}</div>
            <p className="font-display font-black uppercase leading-tight">{state.businessName}</p>
            <p className="text-xs text-gray-400">{SECTORS[state.sector].label}</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {VIEWS.map((v) => (
              <button key={v.id} onClick={() => setView(v.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold ${view === v.id ? 'bg-[#0055FF]' : 'text-gray-300 hover:bg-white/10'}`}>
                {v.icon}{v.id === 'clientes' ? SECTORS[state.sector].clients : v.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10 text-xs text-gray-400">
            Hecho por <a href="/" className="font-bold text-white">Konte</a> · Tu sistema, a medida
          </div>
        </aside>

        <main className="p-3 sm:p-5 lg:p-8 max-w-6xl">
          {view === 'panel' && <Dashboard go={(v) => setView(v as View)} />}
          {view === 'clientes' && <Clients />}
          {view === 'agenda' && <Agenda />}
          {view === 'ventas' && <Deals />}
          {view === 'stock' && <Stock />}
          {view === 'facturas' && <Invoices />}
        </main>

        {/* Menú inferior (móvil) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-900 text-white grid grid-cols-6 pb-[env(safe-area-inset-bottom)]">
          {VIEWS.map((v) => (
            <button key={v.id} onClick={() => setView(v.id)} className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold ${view === v.id ? 'text-[#4d8bff]' : 'text-gray-400'}`}>
              {v.icon}{v.label}
            </button>
          ))}
        </nav>

        {toastMsg && (
          <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-2xl max-w-[92vw] text-center">{toastMsg}</div>
        )}

        {cta && <CtaModal reason={cta} sectorLabel={SECTORS[state.sector].label} onClose={() => setCta(null)} />}
      </div>
    </DemoCtx.Provider>
  );
}

function SectorPicker({ onPick, onCancel }: { onPick: (s: SectorId) => void; onCancel?: () => void }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-3xl">
        <a href="/" className="inline-flex items-center gap-2 mb-8">
          <span className="w-9 h-9 bg-[#0055FF] font-display font-black text-xl flex items-center justify-center">K</span>
          <span className="font-display font-black uppercase">Konte</span>
        </a>
        <p className="text-xs font-black uppercase tracking-widest text-[#4d8bff] mb-2">Demo gratuita · sin registro</p>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase leading-[0.95] mb-4">Prueba un sistema de gestión real</h1>
        <p className="text-gray-300 text-lg mb-8">Clientes, agenda, ventas, stock y facturas en un solo sitio, con datos de prueba. Elige el tipo de negocio que más se parece al tuyo:</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {(Object.keys(SECTORS) as SectorId[]).map((id) => (
            <button key={id} onClick={() => onPick(id)} className="text-left p-5 rounded-2xl bg-white/5 border-2 border-white/10 hover:border-[#0055FF] hover:bg-white/10 transition-colors">
              <span className="text-3xl">{SECTORS[id].emoji}</span>
              <span className="block mt-3 font-display text-lg font-black uppercase">{SECTORS[id].label}</span>
              <span className="block text-sm text-gray-400">Ejemplo: {SECTORS[id].business}</span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm text-gray-400">¿Tu negocio es distinto? Elige cualquiera: tu sistema real se diseña a tu medida.</p>
        {onCancel && <button onClick={onCancel} className="mt-4 text-sm font-bold underline">Volver a la demo</button>}
      </div>
    </div>
  );
}

function CtaModal({ reason, sectorLabel, onClose }: { reason: string; sectorLabel: string; onClose: () => void }) {
  const [state, setState] = useState<'form' | 'sending' | 'ok' | 'error'>('form');
  useEffect(() => track('demo_cta_open', { reason }), [reason]);
  const allDone = reason === 'misiones';

  return (
    <Modal title={allDone ? '¡Lo has probado todo! 🎉' : 'Quiero un sistema así'} onClose={onClose}>
      {state === 'ok' ? (
        <div className="text-center py-4">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-display text-xl font-black uppercase mb-2">¡Recibido!</p>
          <p className="text-gray-600 mb-5">Te escribimos en menos de 24 h laborables para ver cómo sería el tuyo.</p>
          <Btn kind="ghost" onClick={onClose}>Seguir probando la demo</Btn>
        </div>
      ) : (
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setState('sending');
            const ok = await sendForm({
              _subject: `Contacto desde la demo: ${sectorLabel}`,
              origen: `Demo sistema de gestión (${sectorLabel})`,
              nombre: String(f.get('nombre')),
              email: String(f.get('email')),
              telefono: String(f.get('telefono') || ''),
              mensaje: String(f.get('mensaje') || ''),
              necesidad: 'ERP / programa de gestión',
              pagina: location.href,
            });
            if (ok) track('generate_lead', { form: 'demo' });
            setState(ok ? 'ok' : 'error');
          }}
        >
          <p className="text-sm text-gray-600">
            {allDone ? 'Ya has visto cómo funciona. ' : ''}Lo hacemos con tus datos, tus procesos y tu marca: solo lo que tu negocio necesita. Cuéntanos y te decimos cómo sería y cuánto costaría.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nombre *"><input name="nombre" required autoComplete="name" className={inputCls} /></Field>
            <Field label="Email *"><input name="email" type="email" required autoComplete="email" className={inputCls} /></Field>
          </div>
          <Field label="Teléfono / WhatsApp"><input name="telefono" type="tel" autoComplete="tel" className={inputCls} /></Field>
          <Field label="¿Qué te gustaría tener?"><textarea name="mensaje" rows={3} className={inputCls} placeholder="Ej.: la agenda y las facturas, pero conectado a WhatsApp…" /></Field>
          {state === 'error' && <p className="text-sm font-bold text-red-600">No se pudo enviar. Escríbenos por WhatsApp o al {SITE.email}.</p>}
          <Btn type="submit" className="w-full">{state === 'sending' ? 'Enviando…' : 'Pedir presupuesto gratis'}</Btn>
          <div className="grid grid-cols-2 gap-2">
            <a href={whatsappLink(`Hola, he probado la demo de konte.es (${sectorLabel}) y me interesa un sistema así.`)} target="_blank" rel="noopener noreferrer" className="py-2.5 text-center rounded-lg bg-[#25D366] text-white text-sm font-bold">WhatsApp</a>
            <a href={SITE.phoneHref} className="py-2.5 text-center rounded-lg border-2 border-gray-200 text-sm font-bold">{SITE.phone}</a>
          </div>
        </form>
      )}
    </Modal>
  );
}
