import { useDemo, eur, Card, Badge, PageHead, MISSIONS } from './ui';
import { iso, total, type DemoState } from './data';

export default function Dashboard({ go }: { go: (v: string) => void }) {
  const { state, sector, openCta } = useDemo();
  const today = iso(new Date());
  const month = today.slice(0, 7);
  const name = (id: string) => state.clients.find((c) => c.id === id)?.name ?? '—';

  const billedMonth = state.invoices.filter((i) => i.date.startsWith(month)).reduce((a, i) => a + total(i), 0);
  const pending = state.invoices.filter((i) => !i.paid);
  const overdue = pending.filter((i) => i.due < today);
  const todayAppts = state.appts.filter((a) => a.date === today && a.status !== 'cancelada').sort((a, b) => a.time.localeCompare(b.time));
  const lowStock = state.products.filter((p) => p.stock <= p.min);
  const pipeline = state.deals.filter((d) => d.stage < 4).reduce((a, d) => a + d.value, 0);
  const months = lastMonths(state, 6);
  const max = Math.max(...months.map((m) => m.value), 1);
  const doneCount = MISSIONS.filter((m) => state.missions[m.id]).length;

  const kpis = [
    { label: 'Facturado este mes', value: eur(Math.round(billedMonth)), go: 'facturas' },
    { label: 'Pendiente de cobro', value: eur(Math.round(pending.reduce((a, i) => a + total(i), 0))), go: 'facturas', alert: overdue.length > 0 },
    { label: `${sector.apptsLabel} hoy`, value: String(todayAppts.length), go: 'agenda' },
    { label: 'Embudo abierto', value: eur(pipeline), go: 'ventas' },
  ];

  return (
    <div>
      <PageHead title={`Hola, ${state.businessName}`} sub={new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map((k) => (
          <button key={k.label} onClick={() => go(k.go)} className="text-left p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#0055FF] transition-colors">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">{k.label}</p>
            <p className={`mt-1 font-display text-2xl md:text-3xl font-black ${k.alert ? 'text-red-600' : 'text-gray-900'}`}>{k.value}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-black uppercase">Facturación últimos 6 meses</h2>
            <span className="text-xs font-bold text-gray-500">IVA incluido</span>
          </div>
          <div className="h-48 flex items-end gap-3">
            {months.map((m, i) => (
              <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                <span className="text-[11px] font-bold text-gray-500">{(m.value / 1000).toFixed(1)}k</span>
                <div className={`w-full rounded-t-lg ${i === months.length - 1 ? 'bg-[#0055FF]' : 'bg-blue-200'}`} style={{ height: `${Math.max(4, (m.value / max) * 100)}%` }} />
                <span className="text-xs font-bold text-gray-600 capitalize">{m.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-black uppercase mb-3">Avisos</h2>
          <ul className="space-y-2 text-sm">
            {overdue.length > 0 && (
              <li><button onClick={() => go('facturas')} className="w-full text-left p-3 rounded-xl bg-red-50 text-red-800 font-bold">⚠ {overdue.length} factura{overdue.length > 1 ? 's' : ''} vencida{overdue.length > 1 ? 's' : ''} sin cobrar</button></li>
            )}
            {lowStock.length > 0 && (
              <li><button onClick={() => go('stock')} className="w-full text-left p-3 rounded-xl bg-amber-50 text-amber-900 font-bold">📦 {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con stock bajo</button></li>
            )}
            {state.deals.filter((d) => d.stage === 2).length > 0 && (
              <li><button onClick={() => go('ventas')} className="w-full text-left p-3 rounded-xl bg-blue-50 text-blue-900 font-bold">💬 {state.deals.filter((d) => d.stage === 2).length} propuestas esperando respuesta</button></li>
            )}
            {overdue.length + lowStock.length === 0 && <li className="p-3 text-gray-500">Todo en orden 👌</li>}
          </ul>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-black uppercase">{sector.apptsLabel} de hoy</h2>
            <button onClick={() => go('agenda')} className="text-sm font-bold text-[#0055FF]">Ver agenda →</button>
          </div>
          {todayAppts.length === 0 ? (
            <p className="text-sm text-gray-500">Hoy no hay nada en la agenda. Prueba a crear una cita.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {todayAppts.map((a) => (
                <li key={a.id} className="py-2.5 flex items-center gap-3 text-sm">
                  <span className="font-display font-black w-12">{a.time}</span>
                  <span className="flex-1 min-w-0"><b className="block truncate">{name(a.clientId)}</b><span className="text-gray-500 truncate block">{a.service} · {a.staff}</span></span>
                  <Badge tone={a.status === 'hecha' ? 'green' : a.status === 'confirmada' ? 'blue' : 'amber'}>{a.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="p-5 rounded-2xl bg-gray-900 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#4d8bff] mb-1">Prueba la demo · {doneCount}/{MISSIONS.length}</p>
          <h2 className="font-display text-xl font-black uppercase mb-3">Cosas que puedes hacer</h2>
          <div className="h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden"><div className="h-full bg-green-400 transition-all" style={{ width: `${(doneCount / MISSIONS.length) * 100}%` }} /></div>
          <ul className="space-y-2 text-sm mb-4">
            {MISSIONS.map((m) => (
              <li key={m.id} className={state.missions[m.id] ? 'text-green-300 line-through' : 'text-gray-200'}>{state.missions[m.id] ? '✓' : '○'} {m.text}</li>
            ))}
          </ul>
          <button onClick={() => openCta('panel')} className="w-full py-2.5 bg-[#0055FF] hover:bg-blue-600 rounded-lg font-black text-sm uppercase tracking-widest">Quiero uno así para mi negocio</button>
        </div>
      </div>
    </div>
  );
}

function lastMonths(state: DemoState, n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    const key = iso(d).slice(0, 7);
    const value = state.invoices.filter((inv) => inv.date.startsWith(key)).reduce((a, inv) => a + total(inv), 0);
    return { key, value, label: d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '') };
  });
}
