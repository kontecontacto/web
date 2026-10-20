import { useEffect, useRef, useState } from 'react';
import { loadState, subscribe, callText, type TurneroState, type Call } from './store';
import { unlockAudio, chime, speak } from './sound';

const THEMES = {
  azul: { bg: 'bg-gradient-to-br from-[#0b1a4a] via-[#0b1120] to-[#0b1120]', card: 'bg-white/5 border-white/10', text: 'text-white', sub: 'text-blue-200', accent: 'text-[#4d8bff]', hl: 'bg-[#0055FF]', line: 'border-white/10' },
  oscuro: { bg: 'bg-black', card: 'bg-white/5 border-white/10', text: 'text-white', sub: 'text-gray-400', accent: 'text-amber-300', hl: 'bg-amber-500', line: 'border-white/10' },
  claro: { bg: 'bg-gray-100', card: 'bg-white border-gray-200', text: 'text-gray-900', sub: 'text-gray-500', accent: 'text-[#0055FF]', hl: 'bg-[#0055FF]', line: 'border-gray-200' },
};

export default function Pantalla() {
  const [state, setState] = useState<TurneroState>(() => loadState());
  const [armed, setArmed] = useState(false);
  const [flashId, setFlashId] = useState('');
  const [now, setNow] = useState(() => new Date());
  const queue = useRef<Call[]>([]);
  const seen = useRef(new Set<string>());
  const busy = useRef(false);
  const settingsRef = useRef(state.settings);
  settingsRef.current = state.settings;

  async function playQueue() {
    if (busy.current) return;
    busy.current = true;
    while (queue.current.length) {
      const call = queue.current.shift()!;
      setFlashId(call.id);
      if (settingsRef.current.chime) await chime();
      if (settingsRef.current.voice) {
        speak(callText(settingsRef.current.voiceTemplate, call));
        await new Promise((r) => setTimeout(r, 3500));
      }
    }
    busy.current = false;
  }

  useEffect(() => {
    const unsub = subscribe((msg) => {
      setState(msg.state);
      if (msg.type === 'call' && !seen.current.has(msg.call.id)) {
        seen.current.add(msg.call.id);
        queue.current.push(msg.call);
        playQueue();
      }
    });
    const ping = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('konte-turnero-ping') : null;
    const t = setInterval(() => { ping?.postMessage('ping'); setNow(new Date()); }, 2000);
    ping?.postMessage('ping');
    return () => { unsub(); clearInterval(t); ping?.close(); };
  }, []);

  function arm() {
    unlockAudio();
    setArmed(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  }

  const th = THEMES[state.settings.theme] ?? THEMES.azul;
  const [current, ...previous] = state.history;

  return (
    <div className={`fixed inset-0 ${th.bg} ${th.text} font-sans flex flex-col overflow-hidden select-none`}>
      <header className="flex items-center justify-between px-[3vw] py-[2vh]">
        <p className="font-display font-black uppercase tracking-tight text-[3.2vw] leading-none">{state.businessName}</p>
        <p className={`font-display font-black text-[3.2vw] leading-none tabular-nums ${th.sub}`}>
          {now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </header>

      <main className="flex-1 grid grid-cols-[1.6fr_1fr] gap-[2vw] px-[3vw] pb-[2vh] min-h-0">
        <section className={`rounded-[2vw] border-2 ${th.card} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
          {current && flashId === current.id && <div key={current.id} className={`absolute inset-0 ${th.hl} animate-turnero-flash`} />}
          <p className={`relative font-black uppercase tracking-[0.3em] text-[2.2vw] ${th.sub}`}>Turno</p>
          <p key={current?.id} className="relative font-display font-black leading-none text-[22vw] tabular-nums animate-turnero-pop">
            {current ? current.label : '—'}
          </p>
          {current && (
            <p className={`relative font-display font-black uppercase text-[4.5vw] leading-none ${th.accent}`}>{current.counter}</p>
          )}
        </section>

        <section className={`rounded-[2vw] border-2 ${th.card} p-[2vw] flex flex-col min-h-0`}>
          <p className={`font-black uppercase tracking-[0.2em] text-[1.4vw] mb-[1.5vh] ${th.sub}`}>Últimos turnos</p>
          <ul className="flex-1 flex flex-col gap-[1.2vh] min-h-0">
            {previous.slice(0, 5).map((c) => (
              <li key={c.id} className={`flex items-center justify-between border-b ${th.line} pb-[1vh]`}>
                <span className="font-display font-black text-[4.2vw] leading-none tabular-nums">{c.label}</span>
                <span className={`font-bold text-[1.8vw] ${th.sub}`}>{c.counter}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="relative">
        {state.settings.message && (
          <div className={`${th.hl} text-white overflow-hidden whitespace-nowrap py-[1.4vh]`}>
            <p className="inline-block animate-turnero-marquee font-bold text-[2vw]">{state.settings.message}</p>
          </div>
        )}
        <a href="https://www.konte.es/turnero-online-gratis/?utm_source=pantalla" target="_blank" rel="noopener" className="absolute right-[1vw] -top-[4.5vh] text-[1.15vw] font-bold opacity-75">
          Turnero gratis · konte.es
        </a>
      </footer>

      {!armed && (
        <button onClick={arm} className="absolute inset-0 bg-black/80 text-white flex flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="text-6xl">🔊</span>
          <span className="font-display font-black uppercase text-4xl">Pulsa para empezar</span>
          <span className="max-w-xl text-lg text-gray-300">Activa el sonido y la pantalla completa. Lleva esta ventana a la TV o al segundo monitor antes de pulsar.</span>
        </button>
      )}

      <style>{`
        @keyframes turnero-flash { 0% { opacity: .9 } 100% { opacity: 0 } }
        .animate-turnero-flash { animation: turnero-flash 1.6s ease-out 2 forwards; }
        @keyframes turnero-pop { 0% { transform: scale(.85); opacity: 0 } 60% { transform: scale(1.05); opacity: 1 } 100% { transform: scale(1) } }
        .animate-turnero-pop { animation: turnero-pop .6s ease-out; }
        @keyframes turnero-marquee { 0% { transform: translateX(100vw) } 100% { transform: translateX(-100%) } }
        .animate-turnero-marquee { animation: turnero-marquee 22s linear infinite; padding-left: 2vw; }
      `}</style>
    </div>
  );
}
