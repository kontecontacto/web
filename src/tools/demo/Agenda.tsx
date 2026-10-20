import { useState } from 'react';
import { useDemo, Modal, Field, Btn, Badge, PageHead, inputCls } from './ui';
import { addDays, iso, mondayOf, uid, type Appt } from './data';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const TONE = { pendiente: 'amber', confirmada: 'blue', hecha: 'green', cancelada: 'red' } as const;

export default function Agenda() {
  const { state, sector, update, done, toast } = useDemo();
  const [week, setWeek] = useState(() => mondayOf(new Date()));
  const today = iso(new Date());
  const [day, setDay] = useState(() => Math.min(5, (new Date().getDay() + 6) % 7));
  const [editing, setEditing] = useState<Appt | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const name = (id: string) => state.clients.find((c) => c.id === id)?.name ?? '—';

  const days = DAYS.map((label, i) => {
    const date = iso(addDays(week, i));
    return { label, date, items: state.appts.filter((a) => a.date === date).sort((a, b) => a.time.localeCompare(b.time)) };
  });

  function setStatus(a: Appt, status: Appt['status']) {
    update((s) => ({ ...s, appts: s.appts.map((x) => (x.id === a.id ? { ...x, status } : x)) }));
    setEditing(null);
    toast(status === 'confirmada' ? 'Cita confirmada. El cliente recibe un aviso.' : `Cita marcada como ${status}`);
  }

  const range = `${addDays(week, 0).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${addDays(week, 5).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;

  return (
    <div>
      <PageHead
        title={sector.apptsLabel}
        sub={range}
        action={
          <div className="flex gap-2">
            <Btn kind="ghost" onClick={() => setWeek(addDays(week, -7))}>←</Btn>
            <Btn kind="ghost" onClick={() => setWeek(mondayOf(new Date()))}>Hoy</Btn>
            <Btn kind="ghost" onClick={() => setWeek(addDays(week, 7))}>→</Btn>
            <Btn onClick={() => setCreating(days[day].date)}>+ Nueva</Btn>
          </div>
        }
      />

      {/* Móvil: un día cada vez */}
      <div className="md:hidden flex gap-1.5 mb-3 overflow-x-auto">
        {days.map((d, i) => (
          <button key={d.date} onClick={() => setDay(i)} className={`flex-1 min-w-[52px] py-2 rounded-lg text-xs font-bold border-2 ${i === day ? 'bg-[#0055FF] border-[#0055FF] text-white' : d.date === today ? 'border-[#0055FF] text-[#0055FF]' : 'border-gray-200 bg-white'}`}>
            {d.label}<span className="block text-base font-black">{Number(d.date.slice(8))}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-6 gap-2">
        {days.map((d, i) => (
          <div key={d.date} className={`${i === day ? 'block' : 'hidden'} md:block bg-white border rounded-2xl p-2 min-h-[200px] ${d.date === today ? 'border-[#0055FF] border-2' : 'border-gray-200'}`}>
            <div className="hidden md:flex items-baseline justify-between px-1 mb-2">
              <span className="text-xs font-black uppercase text-gray-500">{d.label}</span>
              <span className={`font-display font-black ${d.date === today ? 'text-[#0055FF]' : ''}`}>{Number(d.date.slice(8))}</span>
            </div>
            <div className="space-y-1.5">
              {d.items.map((a) => (
                <button key={a.id} onClick={() => setEditing(a)} className={`w-full text-left p-2 rounded-lg text-xs border-l-4 ${a.status === 'cancelada' ? 'bg-gray-50 border-gray-300 text-gray-400 line-through' : a.status === 'hecha' ? 'bg-green-50 border-green-500' : a.status === 'confirmada' ? 'bg-blue-50 border-[#0055FF]' : 'bg-amber-50 border-amber-400'}`}>
                  <b className="block">{a.time} · {name(a.clientId)}</b>
                  <span className="block truncate text-gray-600">{a.service}</span>
                </button>
              ))}
              <button onClick={() => setCreating(d.date)} className="w-full py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-[#0055FF] hover:bg-blue-50">+ Añadir</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={`${editing.time} · ${name(editing.clientId)}`} onClose={() => setEditing(null)}>
          <div className="space-y-2 text-sm mb-5">
            <p>{new Date(`${editing.date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p><b>{editing.service}</b> · {editing.duration} min · con {editing.staff}</p>
            <p>Estado: <Badge tone={TONE[editing.status]}>{editing.status}</Badge></p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Btn onClick={() => setStatus(editing, 'confirmada')}>Confirmar</Btn>
            <Btn kind="green" onClick={() => setStatus(editing, 'hecha')}>Marcar hecha</Btn>
            <Btn kind="ghost" onClick={() => { toast('Recordatorio enviado por WhatsApp (simulado)'); setEditing(null); }}>Enviar recordatorio</Btn>
            <Btn kind="ghost" onClick={() => setStatus(editing, 'cancelada')}>Cancelar cita</Btn>
          </div>
        </Modal>
      )}

      {creating && (
        <Modal title="Nueva cita" onClose={() => setCreating(null)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const svc = sector.services.find((s) => s.name === f.get('service'))!;
              const a: Appt = { id: uid(), clientId: String(f.get('client')), date: String(f.get('date')), time: String(f.get('time')), duration: svc.minutes, service: svc.name, staff: String(f.get('staff')), status: 'confirmada' };
              update((s) => ({ ...s, appts: [...s.appts, a] }));
              setWeek(mondayOf(new Date(`${a.date}T12:00:00`)));
              setDay(Math.min(5, (new Date(`${a.date}T12:00:00`).getDay() + 6) % 7));
              setCreating(null);
              done('cita');
              toast('Cita creada. El cliente recibe la confirmación por WhatsApp.');
            }}
          >
            <Field label={sector.client}>
              <select name="client" className={inputCls}>{state.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Día"><input name="date" type="date" defaultValue={creating} required className={inputCls} /></Field>
              <Field label="Hora"><input name="time" type="time" defaultValue="10:00" step={900} required className={inputCls} /></Field>
            </div>
            <Field label="Servicio">
              <select name="service" className={inputCls}>{sector.services.map((s) => <option key={s.name}>{s.name}</option>)}</select>
            </Field>
            <Field label="Profesional">
              <select name="staff" className={inputCls}>{sector.staff.map((s) => <option key={s}>{s}</option>)}</select>
            </Field>
            <Btn type="submit" className="w-full">Guardar cita</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
