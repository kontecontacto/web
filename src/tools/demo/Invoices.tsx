import { useState } from 'react';
import { useDemo, eur, fmtDate, Modal, Field, Btn, Badge, PageHead, Card, inputCls } from './ui';
import { addDays, iso, IVA, subtotal, total, uid, type Invoice, type Line } from './data';

type Filter = 'todas' | 'pendientes' | 'vencidas';

export default function Invoices() {
  const { state, update, done, toast } = useDemo();
  const [filter, setFilter] = useState<Filter>('todas');
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [creating, setCreating] = useState(false);
  const today = iso(new Date());
  const name = (id: string) => state.clients.find((c) => c.id === id)?.name ?? '—';
  const status = (i: Invoice) => (i.paid ? 'cobrada' : i.due < today ? 'vencida' : 'pendiente');

  const list = [...state.invoices]
    .sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number))
    .filter((i) => filter === 'todas' || (filter === 'pendientes' ? !i.paid : status(i) === 'vencida'));

  function markPaid(inv: Invoice) {
    update((s) => ({ ...s, invoices: s.invoices.map((i) => (i.id === inv.id ? { ...i, paid: true } : i)) }));
    setViewing(null);
    toast(`Factura ${inv.number} cobrada`);
  }

  const counts = {
    todas: state.invoices.length,
    pendientes: state.invoices.filter((i) => !i.paid).length,
    vencidas: state.invoices.filter((i) => status(i) === 'vencida').length,
  };

  return (
    <div>
      <PageHead title="Facturas" sub="Presupuestos y facturas con tu logo, en PDF" action={<Btn onClick={() => setCreating(true)}>+ Nueva factura</Btn>} />
      <div className="flex gap-2 mb-4">
        {(['todas', 'pendientes', 'vencidas'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-sm font-bold capitalize border-2 ${filter === f ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200'}`}>
            {f} <span className="opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="p-3">Número</th>
              <th className="p-3">Cliente</th>
              <th className="p-3 hidden md:table-cell">Fecha</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 hidden sm:table-cell text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {list.slice(0, 40).map((i) => (
              <tr key={i.id} onClick={() => setViewing(i)} className="border-t border-gray-100 hover:bg-blue-50/50 cursor-pointer">
                <td className="p-3 font-bold whitespace-nowrap">{i.number}<span className="sm:hidden block mt-0.5"><Badge tone={i.paid ? 'green' : status(i) === 'vencida' ? 'red' : 'amber'}>{status(i)}</Badge></span></td>
                <td className="p-3 truncate max-w-[140px]">{name(i.clientId)}</td>
                <td className="p-3 hidden md:table-cell text-gray-600">{fmtDate(i.date)}</td>
                <td className="p-3 text-right font-bold whitespace-nowrap">{eur(total(i))}</td>
                <td className="p-3 hidden sm:table-cell text-right"><Badge tone={i.paid ? 'green' : status(i) === 'vencida' ? 'red' : 'amber'}>{status(i)}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {viewing && (
        <Modal title={`Factura ${viewing.number}`} onClose={() => setViewing(null)} wide>
          <InvoiceDoc inv={viewing} />
          <div className="mt-5 grid sm:grid-cols-3 gap-2 no-print">
            <Btn kind="dark" onClick={() => { done('factura'); setTimeout(() => window.print(), 50); }}>⬇ Descargar PDF</Btn>
            <Btn kind="ghost" onClick={() => toast('Factura enviada por email al cliente (simulado)')}>Enviar por email</Btn>
            {!viewing.paid && <Btn kind="green" onClick={() => markPaid(viewing)}>Marcar cobrada</Btn>}
          </div>
        </Modal>
      )}

      {creating && (
        <NewInvoice
          onClose={() => setCreating(false)}
          onCreate={(inv) => {
            update((s) => ({ ...s, invoices: [...s.invoices, inv] }));
            setCreating(false);
            setViewing(inv);
            toast('Factura creada. Pulsa «Descargar PDF» para verla.');
          }}
        />
      )}

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-doc, #invoice-doc * { visibility: visible !important; }
          #invoice-doc { position: absolute; left: 0; top: 0; width: 100%; padding: 12mm; border: 0 !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}

function InvoiceDoc({ inv }: { inv: Invoice }) {
  const { state } = useDemo();
  const client = state.clients.find((c) => c.id === inv.clientId);
  const sub = subtotal(inv);
  return (
    <div id="invoice-doc" className="border border-gray-200 rounded-xl p-5 sm:p-8 bg-white text-gray-900 text-sm">
      <div className="flex flex-wrap justify-between gap-4 mb-8">
        <div>
          <div className="w-10 h-10 bg-[#0055FF] text-white font-display font-black text-xl flex items-center justify-center mb-2">{state.businessName.charAt(0)}</div>
          <p className="font-black text-base">{state.businessName}</p>
          <p className="text-gray-500">C/ Ejemplo 12 · 08001 Barcelona</p>
          <p className="text-gray-500">NIF B00000000</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-black uppercase">Factura</p>
          <p><b>Nº</b> {inv.number}</p>
          <p><b>Fecha</b> {fmtDate(inv.date, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          <p><b>Vence</b> {fmtDate(inv.due, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
        </div>
      </div>
      <div className="mb-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Cliente</p>
        <p className="font-bold">{client?.name}</p>
        <p className="text-gray-500">{client?.email}</p>
      </div>
      <table className="w-full mb-6">
        <thead><tr className="border-b-2 border-gray-900 text-left text-[11px] uppercase tracking-widest"><th className="py-2">Concepto</th><th className="py-2 text-right">Cant.</th><th className="py-2 text-right">Precio</th><th className="py-2 text-right">Importe</th></tr></thead>
        <tbody>
          {inv.lines.map((l, i) => (
            <tr key={i} className="border-b border-gray-100"><td className="py-2">{l.desc}</td><td className="py-2 text-right">{l.qty}</td><td className="py-2 text-right">{eur(l.price)}</td><td className="py-2 text-right">{eur(l.qty * l.price)}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="ml-auto w-full sm:w-64 space-y-1">
        <p className="flex justify-between"><span>Base imponible</span><span>{eur(sub)}</span></p>
        <p className="flex justify-between"><span>IVA {IVA * 100}%</span><span>{eur(sub * IVA)}</span></p>
        <p className="flex justify-between font-black text-lg border-t-2 border-gray-900 pt-1"><span>Total</span><span>{eur(total(inv))}</span></p>
      </div>
      <p className="mt-8 text-[11px] text-gray-400">Documento de demostración generado en konte.es/demo. Datos ficticios.</p>
    </div>
  );
}

function NewInvoice({ onClose, onCreate }: { onClose: () => void; onCreate: (inv: Invoice) => void }) {
  const { state, sector } = useDemo();
  const catalog = [
    ...sector.services.filter((s) => s.price > 0).map((s) => ({ desc: s.name, price: s.price })),
    ...sector.products.map((p) => ({ desc: p.name, price: p.price })),
  ];
  const [clientId, setClientId] = useState(state.clients[0]?.id);
  const [lines, setLines] = useState<Line[]>([{ ...catalog[0], qty: 1 }]);
  const setLine = (i: number, patch: Partial<Line>) => setLines(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const nextNumber = `${new Date().getFullYear()}-${String(state.invoices.length + 1).padStart(4, '0')}`;

  return (
    <Modal title="Nueva factura" onClose={onClose} wide>
      <div className="space-y-4">
        <Field label="Cliente">
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputCls}>{state.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </Field>
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Conceptos</p>
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_64px_88px_28px] gap-2 items-center">
              <select
                value={l.desc}
                onChange={(e) => { const c = catalog.find((x) => x.desc === e.target.value)!; setLine(i, { desc: c.desc, price: c.price }); }}
                className={inputCls}
              >
                {catalog.map((c) => <option key={c.desc}>{c.desc}</option>)}
              </select>
              <input type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Math.max(1, Number(e.target.value) || 1) })} className={inputCls} aria-label="Cantidad" />
              <input type="number" min={0} step={0.01} value={l.price} onChange={(e) => setLine(i, { price: Number(e.target.value) || 0 })} className={inputCls} aria-label="Precio" />
              <button onClick={() => setLines(lines.filter((_, j) => j !== i))} disabled={lines.length === 1} className="text-red-500 font-black disabled:opacity-20" aria-label="Quitar">×</button>
            </div>
          ))}
          <button onClick={() => setLines([...lines, { ...catalog[1 % catalog.length], qty: 1 }])} className="text-sm font-bold text-[#0055FF]">+ Añadir concepto</button>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <span className="text-sm text-gray-600">Total con IVA</span>
          <span className="font-display text-2xl font-black">{eur(total({ lines }))}</span>
        </div>
        <Btn
          className="w-full"
          onClick={() => {
            const d = new Date();
            onCreate({ id: uid(), number: nextNumber, clientId: clientId!, date: iso(d), due: iso(addDays(d, 30)), lines, paid: false });
          }}
        >
          Crear factura {nextNumber}
        </Btn>
      </div>
    </Modal>
  );
}
