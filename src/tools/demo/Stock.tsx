import { useState } from 'react';
import { useDemo, eur, Modal, Field, Btn, Badge, PageHead, Card, inputCls } from './ui';
import { uid, type Product } from './data';

export default function Stock() {
  const { state, update, done, toast } = useDemo();
  const [moving, setMoving] = useState<{ p: Product; dir: 1 | -1 } | null>(null);
  const [creating, setCreating] = useState(false);
  const low = state.products.filter((p) => p.stock <= p.min);
  const value = state.products.reduce((a, p) => a + p.stock * p.price, 0);

  function apply(p: Product, qty: number) {
    update((s) => ({ ...s, products: s.products.map((x) => (x.id === p.id ? { ...x, stock: Math.max(0, x.stock + qty) } : x)) }));
    if (qty < 0) done('stock');
    const after = Math.max(0, p.stock + qty);
    toast(after <= p.min ? `⚠ ${p.name}: quedan ${after}. Aviso de stock bajo enviado.` : `${qty > 0 ? 'Entrada' : 'Salida'} registrada: ${p.name} (${after})`);
  }

  return (
    <div>
      <PageHead
        title="Inventario"
        sub={`${state.products.length} productos · valor del almacén ${eur(value)}`}
        action={
          <div className="flex gap-2">
            <Btn kind="ghost" onClick={() => toast('En tu sistema, escaneas el código de barras o QR con la cámara del móvil')}>📷 Escanear</Btn>
            <Btn onClick={() => setCreating(true)}>+ Producto</Btn>
          </div>
        }
      />

      {low.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-amber-900">📦 {low.length} producto{low.length > 1 ? 's' : ''} por debajo del mínimo: {low.map((p) => p.name).join(', ')}</p>
          <Btn kind="dark" onClick={() => toast(`Pedido al proveedor preparado con ${low.length} productos (simulado)`)}>Generar pedido</Btn>
        </div>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3 hidden md:table-cell">Ref.</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 hidden sm:table-cell text-center">Mínimo</th>
              <th className="p-3 hidden lg:table-cell text-right">Precio</th>
              <th className="p-3 text-right">Mover</th>
            </tr>
          </thead>
          <tbody>
            {state.products.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="p-3 font-bold">{p.name}</td>
                <td className="p-3 hidden md:table-cell text-gray-500">{p.sku}</td>
                <td className="p-3 text-center">{p.stock <= p.min ? <Badge tone="red">{p.stock}</Badge> : <span className="font-black">{p.stock}</span>}</td>
                <td className="p-3 hidden sm:table-cell text-center text-gray-500">{p.min}</td>
                <td className="p-3 hidden lg:table-cell text-right">{eur(p.price)}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setMoving({ p, dir: -1 })} className="px-2.5 py-1.5 rounded-md bg-gray-100 hover:bg-red-100 font-black text-xs">− Salida</button>
                    <button onClick={() => setMoving({ p, dir: 1 })} className="px-2.5 py-1.5 rounded-md bg-gray-100 hover:bg-green-100 font-black text-xs">+ Entrada</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {moving && (
        <Modal title={`${moving.dir > 0 ? 'Entrada' : 'Salida'}: ${moving.p.name}`} onClose={() => setMoving(null)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const qty = Number(new FormData(e.currentTarget).get('qty')) || 0;
              apply(moving.p, qty * moving.dir);
              setMoving(null);
            }}
          >
            <p className="text-sm text-gray-600">Stock actual: <b>{moving.p.stock}</b> · mínimo {moving.p.min}</p>
            <Field label="Cantidad"><input name="qty" type="number" min={1} defaultValue={1} required className={inputCls} autoFocus /></Field>
            <Btn type="submit" kind={moving.dir > 0 ? 'green' : 'primary'} className="w-full">Registrar {moving.dir > 0 ? 'entrada' : 'salida'}</Btn>
          </form>
        </Modal>
      )}

      {creating && (
        <Modal title="Nuevo producto" onClose={() => setCreating(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const p: Product = { id: uid(), name: String(f.get('name')), sku: `NV-${Math.floor(1000 + Math.random() * 9000)}`, stock: Number(f.get('stock')) || 0, min: Number(f.get('min')) || 0, price: Number(f.get('price')) || 0 };
              update((s) => ({ ...s, products: [...s.products, p] }));
              setCreating(false);
              toast(`${p.name} añadido al inventario`);
            }}
          >
            <Field label="Nombre *"><input name="name" required className={inputCls} autoFocus /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Stock"><input name="stock" type="number" min={0} defaultValue={10} className={inputCls} /></Field>
              <Field label="Mínimo"><input name="min" type="number" min={0} defaultValue={3} className={inputCls} /></Field>
              <Field label="Precio €"><input name="price" type="number" min={0} step={0.01} defaultValue={10} className={inputCls} /></Field>
            </div>
            <Btn type="submit" className="w-full">Guardar</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
