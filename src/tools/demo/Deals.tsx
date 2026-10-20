import { useState } from 'react';
import { useDemo, eur, Modal, Field, Btn, PageHead, inputCls } from './ui';
import { STAGES, uid, type Deal } from './data';

export default function Deals() {
  const { state, update, done, toast } = useDemo();
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const name = (id: string) => state.clients.find((c) => c.id === id)?.name ?? '—';

  function move(id: string, stage: number) {
    const deal = state.deals.find((d) => d.id === id);
    if (!deal || deal.stage === stage || stage < 0 || stage >= STAGES.length) return;
    update((s) => ({ ...s, deals: s.deals.map((d) => (d.id === id ? { ...d, stage } : d)) }));
    done('embudo');
    toast(stage === STAGES.length - 1 ? `🎉 ¡Ganada! ${eur(deal.value)} con ${name(deal.clientId)}` : `Movida a «${STAGES[stage]}»`);
  }

  const open = state.deals.filter((d) => d.stage < STAGES.length - 1);
  const won = state.deals.filter((d) => d.stage === STAGES.length - 1);

  return (
    <div>
      <PageHead
        title="Ventas"
        sub={`${open.length} abiertas · ${eur(open.reduce((a, d) => a + d.value, 0))} en juego · ${eur(won.reduce((a, d) => a + d.value, 0))} ganado`}
        action={<Btn onClick={() => setCreating(true)}>+ Nueva oportunidad</Btn>}
      />
      <p className="text-sm text-gray-500 mb-4 hidden md:block">Arrastra las tarjetas de una columna a otra.</p>

      <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-2 snap-x">
        {STAGES.map((stage, si) => {
          const items = state.deals.filter((d) => d.stage === si);
          return (
            <div
              key={stage}
              onDragOver={(e) => { e.preventDefault(); setOver(si); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); if (dragId) move(dragId, si); setDragId(null); setOver(null); }}
              className={`snap-start shrink-0 w-[78%] sm:w-[45%] md:w-auto rounded-2xl p-2 min-h-[300px] transition-colors ${over === si ? 'bg-blue-100' : si === STAGES.length - 1 ? 'bg-green-50' : 'bg-gray-100'}`}
            >
              <div className="flex items-center justify-between px-1.5 py-1 mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-600">{stage} <span className="text-gray-400">{items.length}</span></span>
                <span className="text-xs font-bold text-gray-500">{eur(items.reduce((a, d) => a + d.value, 0))}</span>
              </div>
              <div className="space-y-2">
                {items.map((d) => (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={() => setDragId(d.id)}
                    onDragEnd={() => { setDragId(null); setOver(null); }}
                    className={`bg-white rounded-xl p-3 border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing ${dragId === d.id ? 'opacity-50' : ''}`}
                  >
                    <p className="text-sm font-bold text-gray-900 leading-snug">{d.title}</p>
                    <p className="text-xs text-gray-500 mb-2">{name(d.clientId)}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black">{eur(d.value)}</span>
                      <span className="flex gap-1">
                        {si > 0 && <button onClick={() => move(d.id, si - 1)} className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 text-sm" aria-label="Etapa anterior">←</button>}
                        {si < STAGES.length - 1 && <button onClick={() => move(d.id, si + 1)} className="w-7 h-7 rounded-md bg-gray-100 hover:bg-[#0055FF] hover:text-white text-sm" aria-label="Siguiente etapa">→</button>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {creating && (
        <Modal title="Nueva oportunidad" onClose={() => setCreating(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const d: Deal = { id: uid(), clientId: String(f.get('client')), title: String(f.get('title')), value: Number(f.get('value')) || 0, stage: 0 };
              update((s) => ({ ...s, deals: [...s.deals, d] }));
              setCreating(false);
              toast('Oportunidad creada en «Nuevo»');
            }}
          >
            <Field label="Qué le vendes *"><input name="title" required className={inputCls} autoFocus /></Field>
            <Field label="Cliente">
              <select name="client" className={inputCls}>{state.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </Field>
            <Field label="Importe (€)"><input name="value" type="number" min={0} step={10} defaultValue={500} className={inputCls} /></Field>
            <Btn type="submit" className="w-full">Crear</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
