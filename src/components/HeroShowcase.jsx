import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import Folder from './reactbits/Folder.jsx';
import PixelBlast from './reactbits/PixelBlast.jsx';

const MODULES = [
  {
    id: 'crm',
    label: 'CRM & Ventas',
    shortLabel: 'CRM',
    badge: 'Clínica FisioVital · CRM',
    url: 'fisiovital.konte.app/crm/embudo',
    accent: '#0055FF',
    accentSecondary: '#00D2FF',
    needMatch: ['CRM a medida', 'App para gimnasio o entrenadores'],
    toastTop: {
      icon: 'whatsapp',
      color: '#25D366',
      title: 'Presupuesto aceptado por WhatsApp',
      subtitle: 'Bono Corporativo · +2.400 € · hace 12 s',
    },
    metricPill: {
      label: 'VENTAS ESTE MES',
      value: '+22.4%',
      sub: '▲ 57.740 € en embudo activo',
    },
  },
  {
    id: 'turnos',
    label: 'Turnos & Citas',
    shortLabel: 'Turnos',
    badge: 'Turnero + Cita Previa',
    url: 'citas.konte.app/sala-espera',
    accent: '#0891B2',
    accentSecondary: '#10B981',
    needMatch: ['Sistema de turnos / citas / reservas', 'Control horario / fichaje'],
    toastTop: {
      icon: 'whatsapp',
      color: '#25D366',
      title: 'Recordatorio automático enviado',
      subtitle: 'Cita mañana 10:30 · Javier confirmó ✓',
    },
    metricPill: {
      label: 'AUSENCIAS REDUCIDAS',
      value: '-89%',
      sub: '▲ Confirmación 1-clic por WhatsApp',
    },
  },
  {
    id: 'stock',
    label: 'QR & Inventario',
    shortLabel: 'Stock QR',
    badge: 'Recomotor · Multi-Sede',
    url: 'stock.konte.app/escaner-qr',
    accent: '#4F46E5',
    accentSecondary: '#06B6D4',
    needMatch: ['Inventario y stock con escáner', 'Tickets o entradas con QR'],
    toastTop: {
      icon: 'qr',
      color: '#4F46E5',
      title: 'Código QR validado con cámara',
      subtitle: 'Lote #RM-904 · Entrada confirmada 0.2s',
    },
    metricPill: {
      label: 'TIEMPO DE INVENTARIO',
      value: '-80%',
      sub: '▲ Escaneo directo desde el móvil',
    },
  },
  {
    id: 'erp',
    label: 'ERP & Planta',
    shortLabel: 'ERP',
    badge: 'Montelimar · Producción',
    url: 'erp.konte.app/planta-lotes',
    accent: '#059669',
    accentSecondary: '#0055FF',
    needMatch: ['ERP / programa de gestión', 'Otra cosa / no lo tengo claro', 'App móvil o plataforma web'],
    toastTop: {
      icon: 'bolt',
      color: '#059669',
      title: 'Orden #409 completada en planta',
      subtitle: 'Trazabilidad APPCC firmada · PDF listo',
    },
    metricPill: {
      label: 'AHORRO OPERATIVO',
      value: '14 h/sem',
      sub: '▲ Cero papel y cero Excel rotos',
    },
  },
];

const FOLDER_CARDS = [
  {
    id: 'crm',
    tag: 'CRM · EMBUDOS',
    title: 'CRM & Ventas',
    metric: '+22% cierre',
    color: '#0055FF',
    bg: '#EFF6FF',
  },
  {
    id: 'turnos',
    tag: 'TURNERO · WA',
    title: 'Turnos & Citas',
    metric: '0 ausencias',
    color: '#0891B2',
    bg: '#ECFEFF',
  },
  {
    id: 'stock',
    tag: 'QR · ALMACÉN',
    title: 'Stock & QR',
    metric: '99.8% stock',
    color: '#4F46E5',
    bg: '#EEF2FF',
  },
  {
    id: 'erp',
    tag: 'ERP · PLANTA',
    title: 'ERP & Lotes',
    metric: '0€/mes cuota',
    color: '#059669',
    bg: '#ECFDF5',
  },
];

export default function HeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Interactive states per module
  const [appts, setAppts] = useState([
    { id: 1, time: '09:30', name: 'Javier Romero', desc: 'Fisioterapia · Laura', status: 'confirmada' },
    { id: 2, time: '11:00', name: 'David López', desc: 'Revisión · Box 2', status: 'pendiente' },
    { id: 3, time: '12:30', name: 'Marta Pujol', desc: 'Valoración · Sara', status: 'confirmada' },
  ]);
  const [currentTurn, setCurrentTurn] = useState(14);
  const [scanTick, setScanTick] = useState(1420);
  const [stockItems, setStockItems] = useState([
    { sku: 'ACE-5W30', name: 'Aceite Sintético 5W30', qty: 42, min: 15, loc: 'Almacén BCN' },
    { sku: 'FIL-904', name: 'Filtro de Aire Bosch', qty: 18, min: 10, loc: 'Almacén BCN' },
    { sku: 'PAS-DEL', name: 'Pastillas Freno Del.', qty: 6, min: 8, loc: 'Taller Central' },
  ]);
  const [folderOpen, setFolderOpen] = useState(false);
  const stageRef = useRef(null);

  const activeModule = MODULES[activeIndex];

  // 3D Tilt spring values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 24, stiffness: 160, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const floatX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);
  const floatY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), springConfig);
  const counterFloatX = useSpring(useTransform(mouseX, [-0.5, 0.5], [9, -9]), springConfig);
  const counterFloatY = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);

  // Auto-cycle modules every 6s unless hovered/folder open
  useEffect(() => {
    if (isPaused || folderOpen) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % MODULES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, folderOpen]);

  // Listen to left-side hero pills hover/focus
  useEffect(() => {
    const handleNeedHover = (e) => {
      const need = e.currentTarget?.dataset?.need;
      if (!need) return;
      const idx = MODULES.findIndex((m) => m.needMatch.includes(need));
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    };

    const pills = document.querySelectorAll('[data-need]');
    pills.forEach((pill) => {
      pill.addEventListener('mouseenter', handleNeedHover);
      pill.addEventListener('focus', handleNeedHover);
    });
    return () => {
      pills.forEach((pill) => {
        pill.removeEventListener('mouseenter', handleNeedHover);
        pill.removeEventListener('focus', handleNeedHover);
      });
    };
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(Math.max(-0.5, Math.min(0.5, nx)));
      mouseY.set(Math.max(-0.5, Math.min(0.5, ny)));
    },
    [mouseX, mouseY]
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsPaused(false);
  }, [mouseX, mouseY]);

  const toggleApptStatus = (id) => {
    setAppts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'confirmada' ? 'pendiente' : 'confirmada' }
          : a
      )
    );
  };

  const handleSimulateScan = () => {
    setScanTick((prev) => prev + 1);
    setStockItems((prev) =>
      prev.map((item, idx) =>
        idx === 0 ? { ...item, qty: Math.max(1, item.qty - 1) } : item
      )
    );
  };

  const folderItems = FOLDER_CARDS.map((card) => ({
    content: (
      <div
        key={card.id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          padding: '10px',
          backgroundColor: card.bg,
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontSize: '8px',
            fontWeight: 800,
            color: card.color,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          {card.tag}
        </span>
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.15,
              marginBottom: '3px',
            }}
          >
            {card.title}
          </div>
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              color: card.color,
            }}
          >
            {card.metric}
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <div
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={handlePointerLeave}
      className="relative w-full select-none pt-2 pb-10 sm:py-6"
      style={{ perspective: '1400px' }}
    >
      {/* ===================== ESPECTRO & PIXELBLAST SIN CAJA NI BORDES (SOLO DETRÁS DE LA PANTALLA) ===================== */}
      <div className="absolute -inset-10 sm:-inset-14 pointer-events-none overflow-visible">
        {/* Orbes de espectro difuminados sin rectángulo ni borde */}
        <motion.div
          animate={{
            scale: [1, 1.14, 1],
            opacity: [0.32, 0.5, 0.32],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 left-4 right-4 bottom-4 rounded-full blur-[70px]"
          style={{
            background: `radial-gradient(circle at 35% 40%, ${activeModule.accent}55 0%, ${activeModule.accentSecondary}33 45%, transparent 72%)`,
          }}
        />
      </div>

      {/* PixelBlast transparente fundido suavemente con edgeFade */}
      <div className="absolute -inset-6 sm:-inset-10 pointer-events-none opacity-75">
        <PixelBlast
          variant="circle"
          pixelSize={3}
          color={activeModule.accent}
          accentColor={activeModule.accentSecondary}
          patternScale={2.2}
          patternDensity={0.85}
          softness={0.7}
          glow={0.55}
          twinkle={0.35}
          drift={0.22}
          speed={0.55}
          hoverEffect="reveal"
          hoverRadius={160}
          enableRipples={true}
          autoRipple={3.5}
          edgeFade={0.45}
          lightMode={true}
        />
      </div>

      {/* ===================== VENTANA FLOTANTE 3D ===================== */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 mx-auto"
      >
        {/* Barra superior de módulos (sin scroll horizontal) */}
        <div className="relative z-20 flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl border border-slate-800 shadow-lg">
            {MODULES.map((mod, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold tracking-tight transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="hero-active-tab"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${mod.accent}, ${mod.accentSecondary})`,
                      }}
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-white animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                    <span className="hidden xl:inline">{mod.label}</span>
                    <span className="xl:hidden">{mod.shortLabel}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <a
            href="/demo/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] font-black text-white uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 shadow-md"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Demo en vivo →
          </a>
        </div>

        {/* Ventana Principal Flotante */}
        <div className="relative rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 shadow-[0_30px_70px_-15px_rgba(15,23,42,0.45)] overflow-hidden">
          {/* Línea de progreso cromática */}
          <div className="h-[2px] w-full bg-slate-900 overflow-hidden">
            <motion.div
              key={`${activeModule.id}-${isPaused}`}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{
                duration: isPaused ? 0.35 : 6,
                ease: 'linear',
              }}
              className="h-full"
              style={{
                background: `linear-gradient(90deg, ${activeModule.accent}, ${activeModule.accentSecondary}, #10B981)`,
              }}
            />
          </div>

          {/* Cabecera del navegador */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/95 border-b border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 flex-shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 flex-shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 flex-shrink-0" />
              <div className="ml-2 flex items-center gap-1.5 bg-slate-950/90 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-300 truncate">
                <span className="text-emerald-400">🔒</span>
                <span className="truncate">{activeModule.url}</span>
              </div>
            </div>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white border border-white/15 flex-shrink-0 ml-2"
              style={{
                background: `linear-gradient(135deg, ${activeModule.accent}66, ${activeModule.accentSecondary}44)`,
              }}
            >
              {activeModule.badge}
            </span>
          </div>

          {/* Contenido dinámico distinto por cada aplicación */}
          <div className="p-4 sm:p-5 min-h-[305px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {/* ============ 1. CRM & VENTAS (EMBUDO KANBAN) ============ */}
              {activeModule.id === 'crm' && (
                <motion.div
                  key="view-crm"
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                  transition={{ duration: 0.28 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">
                        Embudo de ventas · Pipeline activo
                      </span>
                      <div className="text-sm font-black text-white">
                        57.740 € en oportunidades abiertas
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black text-emerald-300">
                      Conversión 68.5%
                    </span>
                  </div>

                  {/* 3 Columnas Kanban */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      {
                        col: 'Nuevos',
                        count: 12,
                        color: 'border-slate-700 bg-slate-900/90',
                        dot: 'bg-slate-400',
                        cards: [
                          { title: 'Clínica Norte', val: '3.200 €', tag: 'Web' },
                          { title: 'Grupo Soler', val: '1.850 €', tag: 'Meta Ads' },
                        ],
                      },
                      {
                        col: 'Propuesta',
                        count: 7,
                        color: 'border-blue-500/40 bg-blue-950/30',
                        dot: 'bg-sky-400',
                        cards: [
                          { title: 'FisioVital Bono', val: '2.400 €', tag: 'WhatsApp' },
                          { title: 'Taller Hermanos', val: '4.900 €', tag: 'PDF enviado' },
                        ],
                      },
                      {
                        col: 'Ganados ✓',
                        count: 5,
                        color: 'border-emerald-500/40 bg-emerald-950/30',
                        dot: 'bg-emerald-400',
                        cards: [
                          { title: 'AutoRecambios', val: '6.500 €', tag: 'Cobrado' },
                          { title: 'Studio Pilates', val: '1.950 €', tag: 'Cobrado' },
                        ],
                      },
                    ].map((lane) => (
                      <div
                        key={lane.col}
                        className={`rounded-xl border p-2.5 ${lane.color} flex flex-col gap-2`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white">
                            <span className={`w-1.5 h-1.5 rounded-full ${lane.dot}`} />
                            {lane.col}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {lane.count}
                          </span>
                        </div>
                        {lane.cards.map((c) => (
                          <div
                            key={c.title}
                            className="rounded-lg bg-slate-950/90 border border-white/10 p-2 shadow-sm"
                          >
                            <div className="text-[11px] font-bold text-white truncate">
                              {c.title}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] font-black text-sky-400">{c.val}</span>
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                                {c.tag}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ============ 2. TURNOS & CITAS (TURNERO EN SALA + AGENDA) ============ */}
              {activeModule.id === 'turnos' && (
                <motion.div
                  key="view-turnos"
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                  transition={{ duration: 0.28 }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3"
                >
                  {/* Pantalla Turnero TV */}
                  <div className="sm:col-span-5 rounded-xl bg-gradient-to-br from-cyan-950/90 to-slate-900 border border-cyan-500/35 p-3.5 flex flex-col justify-between text-center">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-cyan-300">
                        Pantalla TV Sala
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="my-3">
                      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                        Turno Actual
                      </div>
                      <motion.div
                        key={currentTurn}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-display text-4xl font-black text-white tracking-tight my-1"
                      >
                        A-{currentTurn}
                      </motion.div>
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-[10px] font-bold text-cyan-200">
                        Box 2 · Dra. Laura
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentTurn((t) => t + 1)}
                      className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] uppercase tracking-wider transition-colors shadow-md"
                    >
                      Llamar siguiente →
                    </button>
                  </div>

                  {/* Agenda Interactiva */}
                  <div className="sm:col-span-7 rounded-xl bg-slate-900/90 border border-white/10 p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Citas de hoy (clic para confirmar)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400">28 / 30 hoy</span>
                    </div>
                    <div className="space-y-2 my-auto">
                      {appts.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleApptStatus(a.id)}
                          className="w-full text-left p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-white/5 flex items-center justify-between gap-2 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-cyan-400">
                                {a.time}
                              </span>
                              <span className="text-xs font-bold text-white truncate">{a.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{a.desc}</div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${
                              a.status === 'confirmada'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {a.status === 'confirmada' ? '✓ Confirmada' : 'Pendiente'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============ 3. QR & INVENTARIO (ESCÁNER + TABLA DE STOCK) ============ */}
              {activeModule.id === 'stock' && (
                <motion.div
                  key="view-stock"
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                  transition={{ duration: 0.28 }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3"
                >
                  {/* Escáner QR */}
                  <div className="sm:col-span-5 rounded-xl bg-slate-900/95 border border-indigo-500/35 p-3 flex flex-col items-center justify-between relative overflow-hidden">
                    <div className="w-full flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-indigo-300">
                      <span>Escáner Móvil</span>
                      <span>#{scanTick}</span>
                    </div>
                    <div className="relative my-2 p-2.5 bg-white rounded-xl shadow-inner">
                      <motion.div
                        animate={{ top: ['10%', '88%', '10%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute left-1 right-1 h-0.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                      />
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-2.5 h-2.5 rounded-[2px] ${
                              [0, 1, 2, 4, 5, 7, 10, 12, 13, 14, 16, 18, 20, 21, 22, 24].includes(i)
                                ? 'bg-slate-900'
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="w-full py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[10px] uppercase tracking-wider transition-colors"
                    >
                      Simular escaneo (-1 ud)
                    </button>
                  </div>

                  {/* Tabla Stock Multi-Sede */}
                  <div className="sm:col-span-7 rounded-xl bg-slate-900/90 border border-white/10 p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Stock en tiempo real · 4 sedes
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400">99.8% precisión</span>
                    </div>
                    <div className="space-y-2 my-auto">
                      {stockItems.map((item) => {
                        const low = item.qty < item.min;
                        const pct = Math.min(100, Math.round((item.qty / 50) * 100));
                        return (
                          <div
                            key={item.sku}
                            className="p-2 rounded-lg bg-slate-950/80 border border-white/5"
                          >
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-white truncate">{item.name}</span>
                              <span
                                className={`font-mono font-black text-[11px] ${
                                  low ? 'text-amber-400' : 'text-emerald-400'
                                }`}
                              >
                                {item.qty} uds
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    low ? 'bg-amber-400' : 'bg-indigo-400'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-400">{item.loc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============ 4. ERP & PLANTA (ÓRDENES, SENSORES Y FINANZAS) ============ */}
              {activeModule.id === 'erp' && (
                <motion.div
                  key="view-erp"
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                  transition={{ duration: 0.28 }}
                  className="space-y-3"
                >
                  {/* Fila superior financiera / sensores */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-xl bg-slate-900/90 border border-white/10 p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Cámara Curado 1
                      </span>
                      <div className="font-display text-lg font-black text-emerald-400">4.2 °C</div>
                      <span className="text-[9px] text-slate-400">APPCC en rango</span>
                    </div>
                    <div className="rounded-xl bg-slate-900/90 border border-white/10 p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Margen Obra/Lote
                      </span>
                      <div className="font-display text-lg font-black text-white">34.8%</div>
                      <span className="text-[9px] text-emerald-400 font-bold">+5.2% vs objetivo</span>
                    </div>
                    <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                        Cuota Servidor
                      </span>
                      <div className="font-display text-lg font-black text-white">0 €/mes</div>
                      <span className="text-[9px] text-emerald-300">Google Workspace</span>
                    </div>
                  </div>

                  {/* Órdenes de fabricación / Trazabilidad */}
                  <div className="rounded-xl bg-slate-900/90 border border-white/10 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Órdenes de producción y trazabilidad
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400">3 líneas activas</span>
                    </div>
                    {[
                      { lote: 'Lote #409 · Mezcla A', pct: 100, state: 'Completado ✓', color: 'bg-emerald-400' },
                      { lote: 'Lote #410 · Curado Nave 2', pct: 74, state: 'En cámara (74%)', color: 'bg-sky-400' },
                      { lote: 'Lote #411 · Envasado', pct: 35, state: 'Operario: Marc', color: 'bg-indigo-400' },
                    ].map((ord) => (
                      <div key={ord.lote} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white">{ord.lote}</span>
                          <span className="text-[10px] font-semibold text-slate-300">{ord.state}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${ord.color}`}
                            style={{ width: `${ord.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Barra inferior de integraciones */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                <span>WhatsApp API, PDF automáticos y Google Workspace</span>
              </div>
              <a
                href="#contacto"
                className="font-black text-sky-400 hover:text-sky-300 uppercase tracking-wider flex items-center gap-1"
              >
                Quiero un sistema así →
              </a>
            </div>
          </div>
        </div>

        {/* ===================== ELEMENTOS FLOTANTES SIN CAJAS NI SOLAPAMIENTOS ===================== */}

        {/* Aviso lateral izquierdo */}
        <motion.div
          style={{ x: floatX, y: floatY, translateZ: '40px' }}
          className="hidden sm:flex absolute top-[38%] -left-6 lg:-left-10 z-30 bg-white/95 backdrop-blur-xl text-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.28)] border border-slate-200/80 p-3 pr-4 items-center gap-3 max-w-[260px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule.toastTop.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3"
            >
              <span
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ backgroundColor: activeModule.toastTop.color }}
              >
                {activeModule.toastTop.icon === 'whatsapp' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z" />
                  </svg>
                ) : activeModule.toastTop.icon === 'qr' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h7v7h-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                )}
              </span>
              <span className="leading-tight">
                <span className="block text-xs font-black text-slate-900">
                  {activeModule.toastTop.title}
                </span>
                <span className="block text-[11px] font-semibold text-slate-500 mt-0.5">
                  {activeModule.toastTop.subtitle}
                </span>
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Métrica inferior izquierda */}
        <motion.div
          style={{ x: counterFloatX, y: counterFloatY, translateZ: '50px' }}
          className="mt-3 sm:mt-0 sm:absolute sm:-bottom-7 sm:left-3 z-30 bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/15 px-4 py-3 flex items-center justify-between sm:block"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule.metricPill.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                {activeModule.metricPill.label}
              </span>
              <span className="flex items-baseline gap-2 mt-0.5">
                <span className="font-display text-2xl font-black text-white">
                  {activeModule.metricPill.value}
                </span>
                <span className="text-emerald-400 text-xs font-bold">
                  {activeModule.metricPill.sub}
                </span>
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Carpeta React Bits <Folder /> flotante (sin fondo ni caja) */}
        <motion.div
          style={{ x: floatX, y: counterFloatY, translateZ: '65px' }}
          className="mt-5 sm:mt-0 sm:absolute sm:-bottom-12 sm:-right-3 z-40 flex items-center justify-center"
        >
          <Folder
            label="Módulos"
            mode="flap"
            variant="glass"
            color={activeModule.accent}
            paperColor="#ffffff"
            tabPosition="left"
            layout="spread"
            size={0.72}
            frost={0.25}
            tilt={0.85}
            bounce={0.45}
            peek={true}
            intro={true}
            draggable={true}
            zoomOnClick={false}
            theme="light"
            items={folderItems}
            onOpenChange={(open) => setFolderOpen(open)}
            onItemClick={(_, idx) => {
              if (idx >= 0 && idx < MODULES.length) {
                setActiveIndex(idx);
              }
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
