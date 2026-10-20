import { useEffect, useMemo, useRef, useState } from 'react';
import { loadState, saveState, subscribe, uid, formatNumber, type TurneroState, type Call, type Queue } from './store';
import { getLicense, daysLeft, needsRegistration, register, TRIAL_DAYS, type License } from '../license';
import { SITE, whatsappLink } from '../../data/site';

const TOOL = 'turnero';
const TOOL_NAME = 'Turnero online gratis';
const PRO_URL = '/soluciones/sistema-de-turnos-y-citas/?utm_source=turnero#contacto';

type Modal = null | 'settings' | 'register' | 'pro' | 'number';

export default function Panel() {
  const [state, setState] = useState<TurneroState>(() => loadState());
  const [license, setLicense] = useState<License>(() => getLicense(TOOL));
  const [modal, setModal] = useState<Modal>(() => (needsRegistration(getLicense(TOOL)) ? 'register' : null));
  const [screenOnline, setScreenOnline] = useState(false);
  const [toast, setToast] = useState('');
  const [ticket, setTicket] = useState<{ label: string; queue: string } | null>(null);
  const installEvent = useRef<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const locked = needsRegistration(license);

  const queue = state.queues.find((q) => q.id === state.activeQueueId) ?? state.queues[0];
  const counter = state.counters.find((c) => c.id === state.activeCounterId) ?? state.counters[0];
  // Si se activan los tickets a mitad del día, la numeración sigue desde el último turno llamado
  const lastIssued = Math.max(queue.issued, queue.current);
  const waiting = state.settings.dispenser ? lastIssued - queue.current : null;

  function commit(next: TurneroState, call?: Call) {
    setState(next);
    saveState(next, call);
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function announce(q: Queue, n: number, s = state) {
    const call: Call = { id: uid(), label: formatNumber(q, n), queueName: q.name, counter: counter?.name ?? '', at: Date.now() };
    const queues = s.queues.map((x) => (x.id === q.id ? { ...x, current: n } : x));
    commit({ ...s, queues, history: [call, ...s.history].slice(0, 30), stats: { ...s.stats, served: s.stats.served + 1 } }, call);
  }

  function next() {
    if (locked) return setModal('register');
    if (state.settings.dispenser && queue.current >= lastIssued) return flash('No hay nadie esperando en esta cola');
    announce(queue, queue.current + 1);
  }

  function previous() {
    if (locked) return setModal('register');
    if (queue.current <= 1) return;
    announce(queue, queue.current - 1);
  }

  function repeat() {
    const last = state.history[0];
    if (!last) return flash('Todavía no has llamado ningún turno');
    const call = { ...last, id: uid(), at: Date.now() };
    commit({ ...state, history: [call, ...state.history.slice(1)] }, call);
  }

  function callNumber(n: number) {
    if (locked) return setModal('register');
    if (n > 0) announce(queue, n);
    setModal(null);
  }

  function dispense() {
    if (locked) return setModal('register');
    const issued = lastIssued + 1;
    commit({ ...state, queues: state.queues.map((x) => (x.id === queue.id ? { ...x, issued } : x)) });
    setTicket({ label: formatNumber(queue, issued), queue: queue.name });
    setTimeout(() => window.print(), 50);
  }

  // Atajos de teclado (también sirven con un mando de presentaciones)
  const actions = useRef({ next, previous, repeat, dispense });
  actions.current = { next, previous, repeat, dispense };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (modal || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      if ([' ', 'Enter', 'ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); actions.current.next(); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); actions.current.previous(); }
      else if (e.key.toLowerCase() === 'r') actions.current.repeat();
      else if (e.key.toLowerCase() === 'd' && state.settings.dispenser) actions.current.dispense();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, state.settings.dispenser]);

  // ¿Está abierta la pantalla? (la pantalla avisa cada 2 s)
  useEffect(() => {
    let last = 0;
    const ch = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('konte-turnero-ping') : null;
    ch?.addEventListener('message', () => { last = Date.now(); setScreenOnline(true); });
    const t = setInterval(() => setScreenOnline(Date.now() - last < 5000), 2000);
    const unsub = subscribe((msg) => { if (msg.type === 'state') setState(msg.state); });
    return () => { ch?.close(); clearInterval(t); unsub(); };
  }, []);

  // Instalar como app
  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); installEvent.current = e; setCanInstall(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/turnero-online-gratis/sw.js').catch(() => {});
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  function openScreen() {
    window.open('/turnero-online-gratis/pantalla/', 'konte-pantalla', 'popup,width=1280,height=720');
  }

  const left = daysLeft(license);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Barra superior */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <a href="/turnero-online-gratis/" className="flex items-center gap-2">
            <span className="w-8 h-8 bg-lightAccent flex items-center justify-center font-display font-black">K</span>
            <span className="font-display font-black uppercase tracking-tight">Turnero <span className="text-lightAccent">gratis</span></span>
          </a>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {license.registered ? (
              <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-300 font-bold">✓ Registrado</span>
            ) : (
              <button onClick={() => setModal('register')} className="px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-200 font-bold hover:bg-amber-400/30">
                {left > 0 ? `Uso libre: quedan ${left} días · Regístrate gratis` : 'Registro gratuito necesario'}
              </button>
            )}
            {canInstall && (
              <button onClick={() => installEvent.current?.prompt()} className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 font-bold">⤓ Instalar app</button>
            )}
            <button onClick={() => setModal('settings')} className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 font-bold">⚙ Ajustes</button>
            <button onClick={() => setModal('pro')} className="px-3 py-1.5 rounded-md bg-lightAccent hover:bg-blue-600 font-bold">★ Versión Pro</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <section className="space-y-6">
          {/* Aviso de pantalla */}
          <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border-2 ${screenOnline ? 'bg-green-50 border-green-200' : 'bg-white border-dashed border-gray-300'}`}>
            <p className="text-sm font-bold">
              {screenOnline ? '🟢 Pantalla conectada. Los turnos se muestran y se anuncian en ella.' : '📺 Abre la pantalla de turnos y llévala a tu TV o segundo monitor (pulsa F11 para pantalla completa).'}
            </p>
            <button onClick={openScreen} className="px-4 py-2 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-lightAccent">
              {screenOnline ? 'Abrir otra vez' : 'Abrir pantalla ↗'}
            </button>
          </div>

          {/* Llamador */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex flex-wrap gap-4 items-end justify-between mb-6">
              <div className="flex flex-wrap gap-2">
                {state.queues.map((q) => (
                  <button key={q.id} onClick={() => commit({ ...state, activeQueueId: q.id })}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${q.id === queue.id ? 'bg-lightAccent border-lightAccent text-white' : 'border-gray-200 hover:border-lightAccent'}`}>
                    {q.prefix} · {q.name}
                  </button>
                ))}
              </div>
              <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                Atiendes en
                <select value={counter?.id} onChange={(e) => commit({ ...state, activeCounterId: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-900">
                  {state.counters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>

            <div className="text-center py-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Turno actual · {queue.name}</p>
              <p className="font-display font-black text-[7rem] md:text-[9rem] leading-none text-gray-900 tabular-nums">
                {queue.current ? formatNumber(queue, queue.current) : '—'}
              </p>
              {waiting !== null && (
                <p className="mt-2 text-sm font-bold text-gray-500">En espera: <span className="text-gray-900">{waiting}</span> · Último número dado: {lastIssued ? formatNumber(queue, lastIssued) : '—'}</p>
              )}
            </div>

            <button onClick={next} className="w-full py-6 md:py-8 bg-lightAccent hover:bg-blue-600 text-white font-display font-black text-3xl md:text-4xl uppercase tracking-tight rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,0.15)] active:translate-y-0.5 transition">
              Siguiente →
            </button>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <button onClick={repeat} className="py-3 border-2 border-gray-200 hover:border-gray-900 rounded-xl font-bold">↻ Repetir</button>
              <button onClick={previous} className="py-3 border-2 border-gray-200 hover:border-gray-900 rounded-xl font-bold">← Anterior</button>
              <button onClick={() => (locked ? setModal('register') : setModal('number'))} className="py-3 border-2 border-gray-200 hover:border-gray-900 rounded-xl font-bold"># Llamar nº</button>
            </div>
            {state.settings.dispenser && (
              <button onClick={dispense} className="mt-3 w-full py-4 bg-gray-900 hover:bg-gray-700 text-white font-black uppercase tracking-widest rounded-xl">
                🎫 Dar número e imprimir ticket
              </button>
            )}
            <p className="mt-4 text-xs text-gray-400 text-center">
              Atajos: <b>Espacio</b> siguiente · <b>R</b> repetir · <b>←</b> anterior{state.settings.dispenser && <> · <b>D</b> dar número</>}. Funciona también con un mando de presentaciones.
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-black uppercase">Últimas llamadas</h2>
              <span className="text-xs font-bold text-gray-500">Hoy: {state.stats.served} atendidos</span>
            </div>
            {state.history.length === 0 ? (
              <p className="text-sm text-gray-500">Pulsa <b>Siguiente</b> para llamar al primer turno.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {state.history.slice(0, 8).map((c) => (
                  <li key={c.id} className="py-2 flex items-center justify-between text-sm">
                    <span className="font-display font-black text-lg">{c.label}</span>
                    <span className="text-gray-500">{c.counter}</span>
                    <span className="text-gray-400 tabular-nums">{new Date(c.at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-gray-900 text-white rounded-2xl p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-lightAccent mb-2">Versión Pro</p>
            <h2 className="font-display text-2xl font-black uppercase leading-tight mb-3">Llama desde el móvil y que la TV cambie sola</h2>
            <ul className="text-sm text-gray-300 space-y-1.5 mb-5">
              <li>✓ Varios dispositivos y puestos a la vez</li>
              <li>✓ Turno por QR y aviso por WhatsApp</li>
              <li>✓ Cita previa online en la misma pantalla</li>
              <li>✓ Tu logo, sin marca Konte</li>
            </ul>
            <button onClick={() => setModal('pro')} className="w-full py-3 bg-lightAccent hover:bg-blue-600 font-black uppercase tracking-widest rounded-lg">Ver versión Pro</button>
          </div>
        </aside>
      </main>

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold shadow-2xl z-50">{toast}</div>}

      {/* Ticket para imprimir */}
      {ticket && (
        <div className="turnero-ticket">
          <p className="tk-business">{state.businessName}</p>
          <p className="tk-label">Su turno</p>
          <p className="tk-number">{ticket.label}</p>
          <p className="tk-queue">{ticket.queue}</p>
          <p className="tk-date">{new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</p>
          <p className="tk-foot">Espere a ver su número en pantalla · konte.es</p>
        </div>
      )}

      {modal === 'number' && (
        <Dialog onClose={() => setModal(null)} title="Llamar un número concreto">
          <form onSubmit={(e) => { e.preventDefault(); callNumber(Number(new FormData(e.currentTarget).get('n'))); }} className="flex gap-3">
            <input name="n" type="number" min={1} autoFocus required placeholder="Ej.: 25" className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-lg" />
            <button className="px-6 py-3 bg-lightAccent text-white font-black rounded-lg">Llamar</button>
          </form>
        </Dialog>
      )}

      {modal === 'settings' && <Settings state={state} onChange={commit} onClose={() => setModal(null)} />}

      {modal === 'register' && (
        <Dialog title={locked ? 'Activa tu turnero gratis' : 'Regístrate gratis'} onClose={locked ? undefined : () => setModal(null)}>
          <p className="text-sm text-gray-600 mb-4">
            {locked
              ? `Llevas más de ${TRIAL_DAYS} días usando el turnero. Para seguir usándolo gratis, solo tienes que registrarte. Sin tarjeta y sin compromiso.`
              : `Puedes usarlo libremente ${TRIAL_DAYS} días. Si te registras ahora, no te lo volveremos a pedir.`}
          </p>
          <RegisterForm onDone={(l) => { setLicense(l); setModal(null); flash('¡Listo! Turnero activado'); }} />
        </Dialog>
      )}

      {modal === 'pro' && (
        <Dialog title="Turnero Pro a medida" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-600 mb-4">Lo adaptamos a tu negocio y lo instalamos en nuestros servidores:</p>
          <ul className="text-sm space-y-2 mb-6">
            <li>📱 <b>Llamas desde el móvil o la tableta</b> y la TV se actualiza sola, aunque estén en sitios distintos.</li>
            <li>🧾 <b>Tus clientes sacan número con un QR</b> y reciben aviso por WhatsApp cuando les toca.</li>
            <li>📅 <b>Cita previa online</b> y atención sin cita en la misma pantalla.</li>
            <li>🏷️ <b>Tu logo, tus colores</b> y sin marca Konte.</li>
            <li>📊 <b>Estadísticas</b> de tiempos de espera y atención por puesto.</li>
          </ul>
          <div className="grid sm:grid-cols-2 gap-3">
            <a href={whatsappLink('Hola, uso el turnero gratis de konte.es y me interesa la versión Pro.')} target="_blank" rel="noopener noreferrer" className="py-3 text-center bg-[#25D366] text-white font-black rounded-lg">WhatsApp</a>
            <a href={PRO_URL} className="py-3 text-center bg-lightAccent text-white font-black rounded-lg">Pedir presupuesto</a>
          </div>
          <p className="mt-4 text-xs text-gray-500 text-center">O llámanos al <a href={SITE.phoneHref} className="font-bold">{SITE.phone}</a></p>
        </Dialog>
      )}

      <style>{`
        .turnero-ticket { display: none; }
        @media print {
          @page { size: 80mm auto; margin: 4mm; }
          body * { visibility: hidden !important; }
          .turnero-ticket, .turnero-ticket * { visibility: visible !important; }
          .turnero-ticket { display: block; position: absolute; left: 0; top: 0; width: 72mm; text-align: center; font-family: Arial, sans-serif; color: #000; }
          .tk-business { font-weight: 700; font-size: 14pt; margin: 0 0 4mm; }
          .tk-label { font-size: 10pt; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
          .tk-number { font-size: 44pt; font-weight: 900; margin: 1mm 0; }
          .tk-queue { font-size: 11pt; margin: 0 0 3mm; }
          .tk-date { font-size: 9pt; margin: 0 0 3mm; }
          .tk-foot { font-size: 8pt; border-top: 1px dashed #000; padding-top: 2mm; margin: 0; }
        }
      `}</style>
    </div>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose?: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="font-display text-2xl font-black uppercase leading-tight">{title}</h2>
          {onClose && <button onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-900" aria-label="Cerrar">×</button>}
        </div>
        {children}
      </div>
    </div>
  );
}

function RegisterForm({ onDone }: { onDone: (l: License) => void }) {
  const [sending, setSending] = useState(false);
  const field = 'w-full px-3.5 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-lightAccent text-sm';
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setSending(true);
        const l = await register(TOOL, TOOL_NAME, {
          name: String(f.get('name')),
          email: String(f.get('email')),
          business: String(f.get('business')),
          phone: String(f.get('phone') || ''),
        });
        onDone(l);
      }}
    >
      <input name="name" required placeholder="Tu nombre *" autoComplete="name" className={field} />
      <input name="email" type="email" required placeholder="Email *" autoComplete="email" className={field} />
      <input name="business" required placeholder="Nombre de tu negocio *" autoComplete="organization" className={field} />
      <input name="phone" type="tel" placeholder="Teléfono (opcional)" autoComplete="tel" className={field} />
      <button disabled={sending} className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest rounded-lg disabled:opacity-60">
        {sending ? 'Activando…' : 'Activar gratis'}
      </button>
      <p className="text-xs text-gray-500 text-center">Te escribiremos solo sobre el turnero y nuestros servicios. <a href="/privacidad/" className="underline">Privacidad</a></p>
    </form>
  );
}

function Settings({ state, onChange, onClose }: { state: TurneroState; onChange: (s: TurneroState) => void; onClose: () => void }) {
  const s = state;
  const set = (patch: Partial<TurneroState>) => onChange({ ...s, ...patch });
  const setSettings = (patch: Partial<TurneroState['settings']>) => set({ settings: { ...s.settings, ...patch } });
  const input = 'w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-lightAccent';
  const label = 'block text-[11px] font-black uppercase tracking-widest text-gray-600 mb-1';
  const nextPrefix = useMemo(() => 'ABCDEFGHJKLMNPRSTUVWXYZ'.split('').find((l) => !s.queues.some((q) => q.prefix === l)) ?? 'Z', [s.queues]);

  return (
    <Dialog title="Ajustes" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <label className={label}>Nombre del negocio (sale en la pantalla y el ticket)</label>
          <input className={input} value={s.businessName} onChange={(e) => set({ businessName: e.target.value })} />
        </div>

        <div>
          <p className={label}>Colas</p>
          <div className="space-y-2">
            {s.queues.map((q) => (
              <div key={q.id} className="flex gap-2 items-center">
                <input className={`${input} w-16 text-center font-black`} maxLength={2} value={q.prefix} onChange={(e) => set({ queues: s.queues.map((x) => (x.id === q.id ? { ...x, prefix: e.target.value.toUpperCase() } : x)) })} aria-label="Letra" />
                <input className={input} value={q.name} onChange={(e) => set({ queues: s.queues.map((x) => (x.id === q.id ? { ...x, name: e.target.value } : x)) })} aria-label="Nombre de la cola" />
                <button className="px-3 py-2 text-xs font-bold border-2 border-gray-200 rounded-lg whitespace-nowrap" onClick={() => set({ queues: s.queues.map((x) => (x.id === q.id ? { ...x, issued: 0, current: 0 } : x)) })}>Poner a 0</button>
                {s.queues.length > 1 && (
                  <button className="px-2 text-red-500 font-black" aria-label="Eliminar cola" onClick={() => set({ queues: s.queues.filter((x) => x.id !== q.id), activeQueueId: s.queues.find((x) => x.id !== q.id)!.id })}>×</button>
                )}
              </div>
            ))}
          </div>
          {s.queues.length < 3 ? (
            <button className="mt-2 text-sm font-bold text-lightAccent" onClick={() => set({ queues: [...s.queues, { id: uid(), name: 'Nueva cola', prefix: nextPrefix, issued: 0, current: 0 }] })}>+ Añadir cola</button>
          ) : (
            <p className="mt-2 text-xs text-gray-500">La versión gratis admite 3 colas. ¿Necesitas más? Pide la versión Pro.</p>
          )}
        </div>

        <div>
          <p className={label}>Puestos / mostradores</p>
          <div className="space-y-2">
            {s.counters.map((c) => (
              <div key={c.id} className="flex gap-2">
                <input className={input} value={c.name} onChange={(e) => set({ counters: s.counters.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)) })} aria-label="Nombre del puesto" />
                {s.counters.length > 1 && (
                  <button className="px-2 text-red-500 font-black" aria-label="Eliminar puesto" onClick={() => set({ counters: s.counters.filter((x) => x.id !== c.id), activeCounterId: s.counters.find((x) => x.id !== c.id)!.id })}>×</button>
                )}
              </div>
            ))}
          </div>
          <button className="mt-2 text-sm font-bold text-lightAccent" onClick={() => set({ counters: [...s.counters, { id: uid(), name: `Mostrador ${s.counters.length + 1}` }] })}>+ Añadir puesto</button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {([
            ['voice', 'Anunciar el turno por voz'],
            ['chime', 'Sonido de aviso'],
            ['dispenser', 'Dar números e imprimir tickets'],
          ] as const).map(([k, text]) => (
            <label key={k} className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={s.settings[k]} onChange={(e) => setSettings({ [k]: e.target.checked })} className="w-4 h-4 accent-[#0055FF]" />
              {text}
            </label>
          ))}
        </div>

        <div>
          <label className={label}>Frase que se lee en voz alta</label>
          <input className={input} value={s.settings.voiceTemplate} onChange={(e) => setSettings({ voiceTemplate: e.target.value })} />
          <p className="text-xs text-gray-500 mt-1">Usa {'{turno}'} y {'{puesto}'}. Ejemplo: «Número {'{turno}'}, pase a {'{puesto}'}».</p>
        </div>

        <div>
          <label className={label}>Mensaje en la parte de abajo de la pantalla</label>
          <textarea className={input} rows={2} value={s.settings.message} onChange={(e) => setSettings({ message: e.target.value })} />
        </div>

        <div>
          <p className={label}>Colores de la pantalla</p>
          <div className="flex gap-2">
            {(['azul', 'oscuro', 'claro'] as const).map((t) => (
              <button key={t} onClick={() => setSettings({ theme: t })} className={`px-4 py-2 rounded-lg border-2 text-sm font-bold capitalize ${s.settings.theme === t ? 'border-lightAccent text-lightAccent' : 'border-gray-200'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-between">
          <button className="text-sm font-bold text-red-600" onClick={() => { if (confirm('¿Poner a cero todas las colas y borrar el historial?')) set({ queues: s.queues.map((q) => ({ ...q, issued: 0, current: 0 })), history: [], stats: { ...s.stats, served: 0 } }); }}>Reiniciar el día</button>
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-900 text-white font-black rounded-lg">Hecho</button>
        </div>
      </div>
    </Dialog>
  );
}
