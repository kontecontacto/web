import { useMemo, useState } from 'react';
import { useDemo, eur, fmtDate, Modal, Field, Btn, Badge, PageHead, Card, inputCls } from './ui';
import { iso, total, uid, type Client } from './data';

export default function Clients() {
  const { state, sector, update, done, toast } = useDemo();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return state.clients
      .filter((c) => !t || `${c.name} ${c.phone} ${c.email} ${c.tag}`.toLowerCase().includes(t))
      .map((c) => {
        const visits = state.appts.filter((a) => a.clientId === c.id && a.status === 'hecha').sort((a, b) => b.date.localeCompare(a.date));
        const billed = state.invoices.filter((i) => i.clientId === c.id).reduce((a, i) => a + total(i), 0);
        return { c, last: visits[0]?.date, billed };
      })
      .sort((a, b) => b.billed - a.billed);
  }, [q, state]);

  function openClient(c: Client) {
    setOpen(c);
    done('cliente');
  }

  return (
    <div>
      <PageHead
        title={sector.clients}
        sub={`${state.clients.length} en total`}
        action={<Btn onClick={() => setCreating(true)}>+ Nuevo {sector.client.toLowerCase()}</Btn>}
      />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Buscar por nombre, teléfono, email…`} className={`${inputCls} mb-4`} />

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3 hidden md:table-cell">Teléfono</th>
              <th className="p-3 hidden sm:table-cell">Etiqueta</th>
              <th className="p-3 hidden lg:table-cell">Última visita</th>
              <th className="p-3 text-right">Facturado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, last, billed }) => (
              <tr key={c.id} onClick={() => openClient(c)} className="border-t border-gray-100 hover:bg-blue-50/50 cursor-pointer">
                <td className="p-3"><b className="block">{c.name}</b><span className="text-xs text-gray-500 md:hidden">{c.phone}</span></td>
                <td className="p-3 hidden md:table-cell text-gray-600">{c.phone}</td>
                <td className="p-3 hidden sm:table-cell"><Badge tone={c.tag === sector.tags[3] ? 'green' : 'gray'}>{c.tag}</Badge></td>
                <td className="p-3 hidden lg:table-cell text-gray-600">{last ? fmtDate(last) : '—'}</td>
                <td className="p-3 text-right font-bold">{eur(billed)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No hay resultados para «{q}».</td></tr>}
          </tbody>
        </table>
      </Card>

      {open && <ClientSheet client={state.clients.find((c) => c.id === open.id) ?? open} onClose={() => setOpen(null)} />}

      {creating && (
        <Modal title={`Nuevo ${sector.client.toLowerCase()}`} onClose={() => setCreating(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const c: Client = { id: uid(), name: String(f.get('name')), phone: String(f.get('phone')), email: String(f.get('email')), tag: sector.tags[3], since: iso(new Date()), notes: '' };
              update((s) => ({ ...s, clients: [...s.clients, c] }));
              setCreating(false);
              toast(`${c.name} añadido`);
              openClient(c);
            }}
          >
            <Field label="Nombre *"><input name="name" required className={inputCls} autoFocus /></Field>
            <Field label="Teléfono"><input name="phone" className={inputCls} /></Field>
            <Field label="Email"><input name="email" type="email" className={inputCls} /></Field>
            <Btn type="submit" className="w-full">Guardar</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}

function ClientSheet({ client, onClose }: { client: Client; onClose: () => void }) {
  const { state, sector, update, toast } = useDemo();
  const appts = state.appts.filter((a) => a.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date));
  const invoices = state.invoices.filter((i) => i.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date));
  const today = iso(new Date());
  const next = appts.filter((a) => a.date >= today && a.status !== 'cancelada').reverse();
  const past = appts.filter((a) => a.date < today).slice(0, 5);
  const billed = invoices.reduce((a, i) => a + total(i), 0);

  return (
    <Modal title={client.name} onClose={onClose} wide>
      <div className="flex flex-wrap gap-2 mb-5">
        <Badge tone="blue">{client.tag}</Badge>
        <Badge>{sector.client} desde {fmtDate(client.since, { month: 'short', year: 'numeric' })}</Badge>
        <Badge tone="green">{eur(billed)} facturado</Badge>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 mb-6">
        <Btn kind="green" onClick={() => toast('En tu sistema, esto abre WhatsApp con un mensaje ya escrito')}>WhatsApp</Btn>
        <Btn kind="ghost" onClick={() => toast(`Llamando a ${client.phone}… (simulado)`)}>Llamar</Btn>
        <Btn kind="ghost" onClick={() => toast('Recordatorio programado para mañana a las 9:00 (simulado)')}>Recordatorio</Btn>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500">Teléfono:</span> <b>{client.phone || '—'}</b></p>
            <p><span className="text-gray-500">Email:</span> <b>{client.email || '—'}</b></p>
          </div>
          <Field label="Notas">
            <textarea
              rows={4}
              defaultValue={client.notes}
              onBlur={(e) => update((s) => ({ ...s, clients: s.clients.map((c) => (c.id === client.id ? { ...c, notes: e.target.value } : c)) }))}
              placeholder="Escribe aquí lo importante de este cliente…"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="space-y-5 text-sm">
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Próximas {sector.apptsLabel.toLowerCase()}</h3>
            {next.length ? next.map((a) => <p key={a.id} className="py-1"><b>{fmtDate(a.date)} · {a.time}</b> — {a.service}</p>) : <p className="text-gray-500">Ninguna</p>}
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Historial</h3>
            {past.length ? past.map((a) => <p key={a.id} className="py-1 text-gray-700">{fmtDate(a.date)} — {a.service} <span className="text-gray-400">({a.status})</span></p>) : <p className="text-gray-500">Sin historial</p>}
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Facturas</h3>
            {invoices.length ? invoices.slice(0, 5).map((i) => (
              <p key={i.id} className="py-1 flex justify-between gap-2"><span>{i.number} · {fmtDate(i.date)}</span><span className="font-bold">{eur(total(i))} {i.paid ? '' : '⏳'}</span></p>
            )) : <p className="text-gray-500">Sin facturas</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
}
