import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import Folder from './reactbits/Folder.jsx';
import PixelBlast from './reactbits/PixelBlast.jsx';

const MODULES = [
  {
    id: 'crm',
    label: 'CRM & Ventas',
    shortLabel: 'CRM',
    badge: 'Clínica FisioVital · Cloud',
    url: 'fisiovital.konte.app/crm',
    accent: '#0055FF',
    accentSecondary: '#00D2FF',
    needMatch: ['CRM a medida', 'App para gimnasio o entrenadores'],
    kpis: [
      { label: 'Facturado mes', value: '24.850 €', delta: '+22.4%', positive: true },
      { label: 'Pendiente cobro', value: '1.379 €', delta: '3 facturas', positive: false },
      { label: 'Embudo activo', value: '57.740 €', delta: '14 leads', positive: true },
      { label: 'Conversión', value: '68.5%', delta: '+12% vs oct', positive: true },
    ],
    chartTitle: 'EVOLUCIÓN DE INGRESOS · TIEMPO REAL',
    bars: [
      { m: 'Jun', v: 42, amount: '11.2k €' },
      { m: 'Jul', v: 56, amount: '14.8k €' },
      { m: 'Ago', v: 64, amount: '16.9k €' },
      { m: 'Sep', v: 61, amount: '15.7k €' },
      { m: 'Oct', v: 78, amount: '20.3k €' },
      { m: 'Nov', v: 96, amount: '24.8k €', active: true },
    ],
    toastTop: {
      icon: 'whatsapp',
      color: '#25D366',
      title: 'Presupuesto aceptado por WhatsApp',
      subtitle: 'Bono Corporativo · +2.400 € · hace 12 s',
    },
    toastBottom: {
      icon: 'euro',
      color: '#0055FF',
      title: 'Factura #F-2049 cobrada',
      subtitle: '+ 1.250,00 € · Stripe Auto-Sync',
    },
    metricPill: {
      label: 'VENTAS ESTE MES',
      value: '+22.4%',
      sub: '▲ +4.550 € vs. mes pasado',
    },
  },
  {
    id: 'turnos',
    label: 'Turnos & Citas',
    shortLabel: 'Turnos',
    badge: 'Agenda + Turnero Live',
    url: 'citas.konte.app/agenda',
    accent: '#06B6D4',
    accentSecondary: '#10B981',
    needMatch: ['Sistema de turnos / citas / reservas', 'Control horario / fichaje'],
    kpis: [
      { label: 'Citas de hoy', value: '28 / 30', delta: '93% ocupación', positive: true },
      { label: 'Ausencias (No-show)', value: '0', delta: '-100% con WA', positive: true },
      { label: 'Turno en sala', value: 'A-14', delta: 'Box 2 · Laura', positive: true },
      { label: 'Espera media', value: '3 min', delta: 'Tiempo real', positive: true },
    ],
    chartTitle: 'OCUPACIÓN POR FRANJA HORARIA · HOY',
    bars: [
      { m: '09h', v: 75, amount: '4 citas' },
      { m: '11h', v: 95, amount: '6 citas', active: true },
      { m: '13h', v: 60, amount: '3 citas' },
      { m: '16h', v: 85, amount: '5 citas' },
      { m: '18h', v: 100, amount: '6 citas', active: true },
      { m: '20h', v: 70, amount: '4 citas' },
    ],
    toastTop: {
      icon: 'whatsapp',
      color: '#25D366',
      title: 'Recordatorio automático enviado',
      subtitle: 'Cita mañana 10:30 · Javier confirmó ✓',
    },
    toastBottom: {
      icon: 'bell',
      color: '#06B6D4',
      title: 'Turno A-14 llamado en pantalla TV',
      subtitle: 'Sala de espera · Aviso por voz activo',
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
    url: 'stock.konte.app/scanner',
    accent: '#6366F1',
    accentSecondary: '#0055FF',
    needMatch: ['Inventario y stock con escáner', 'Tickets o entradas con QR'],
    kpis: [
      { label: 'Escaneos hoy', value: '1.420', delta: '4 almacenes', positive: true },
      { label: 'Precisión stock', value: '99.8%', delta: 'Sin descuadres', positive: true },
      { label: 'Alertas mínimo', value: '2 SKUs', delta: 'Pedido auto', positive: false },
      { label: 'Tickets QR', value: '412 / 450', delta: 'Aforo 91%', positive: true },
    ],
    chartTitle: 'MOVIMIENTOS DE ALMACÉN & ESCANEOS QR',
    bars: [
      { m: 'Lun', v: 55, amount: '820 uds' },
      { m: 'Mar', v: 72, amount: '1.050 uds' },
      { m: 'Mié', v: 68, amount: '980 uds' },
      { m: 'Jue', v: 94, amount: '1.420 uds', active: true },
      { m: 'Vie', v: 84, amount: '1.210 uds' },
      { m: 'Sáb', v: 48, amount: '640 uds' },
    ],
    toastTop: {
      icon: 'qr',
      color: '#6366F1',
      title: 'Código QR validado con cámara',
      subtitle: 'Lote #RM-904 · Entrada confirmada 0.2s',
    },
    toastBottom: {
      icon: 'box',
      color: '#10B981',
      title: 'Sincronización Multi-Almacén',
      subtitle: 'Sede Barcelona ↔ Madrid · Stock OK',
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
    badge: 'Montelimar · Google / Cloud',
    url: 'erp.konte.app/produccion',
    accent: '#10B981',
    accentSecondary: '#0055FF',
    needMatch: ['ERP / programa de gestión', 'Otra cosa / no lo tengo claro', 'App móvil o plataforma web'],
    kpis: [
      { label: 'Lotes activos', value: '16', delta: '100% trazables', positive: true },
      { label: 'Temp. Cámara 1', value: '4.2 °C', delta: 'Óptimo APPCC', positive: true },
      { label: 'Margen neto', value: '34.8%', delta: '+5.2% este mes', positive: true },
      { label: 'Cuota servidor', value: '0 €/mes', delta: 'Workspace Mode', positive: true },
    ],
    chartTitle: 'RENDIMIENTO DE PLANTA & FLUJO DE CAJA',
    bars: [
      { m: 'L-01', v: 78, amount: '94% efic.' },
      { m: 'L-02', v: 85, amount: '96% efic.' },
      { m: 'L-03', v: 92, amount: '98% efic.', active: true },
      { m: 'L-04', v: 74, amount: '91% efic.' },
      { m: 'L-05', v: 88, amount: '97% efic.' },
      { m: 'L-06', v: 97, amount: '99% efic.', active: true },
    ],
    toastTop: {
      icon: 'bolt',
      color: '#10B981',
      title: 'Orden de producción #409 completada',
      subtitle: 'Trazabilidad APPCC firmada · PDF generado',
    },
    toastBottom: {
      icon: 'euro',
      color: '#0055FF',
      title: 'ROI de obra actualizado en vivo',
      subtitle: 'Constructora BCN · Margen +34.8%',
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
    tag: 'CRM · CLÍNICA',
    title: 'FisioVital OS',
    metric: '+22% ventas',
    color: '#0055FF',
    bg: '#EFF6FF',
  },
  {
    id: 'turnos',
    tag: 'AGENDA · WA',
    title: 'Turnero & Citas',
    metric: '0 ausencias',
    color: '#0891B2',
    bg: '#ECFEFF',
  },
  {
    id: 'stock',
    tag: 'QR · STOCK',
    title: 'Recomotor App',
    metric: '1.4k escaneos',
    color: '#4F46E5',
    bg: '#EEF2FF',
  },
  {
    id: 'erp',
    tag: 'ERP · PLANTA',
    title: 'Montelimar ERP',
    metric: '0€/mes cuota',
    color: '#059669',
    bg: '#ECFDF5',
  },
];

export default function HeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [appts, setAppts] = useState([
    { id: 1, time: '09:30', name: 'Javier Romero', desc: 'Fisioterapia · Laura', status: 'confirmada' },
    { id: 2, time: '11:00', name: 'David López', desc: 'Revisión ITV · Taller', status: 'pendiente' },
    { id: 3, time: '12:30', name: 'Marta Pujol', desc: 'Bono 10 sesiones · Sara', status: 'confirmada' },
  ]);
  const [scanTick, setScanTick] = useState(1420);
  const [folderOpen, setFolderOpen] = useState(false);
  const stageRef = useRef(null);

  const activeModule = MODULES[activeIndex];

  // 3D Tilt spring values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 24, stiffness: 160, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-9, 9]), springConfig);
  const floatX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const floatY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), springConfig);
  const counterFloatX = useSpring(useTransform(mouseX, [-0.5, 0.5], [10, -10]), springConfig);
  const counterFloatY = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);

  // Auto-cycle modules every 5.5s unless hovered/paused
  useEffect(() => {
    if (isPaused || folderOpen) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % MODULES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, folderOpen]);

  // Subtle live ticker for realism
  useEffect(() => {
    const ticker = setInterval(() => {
      setScanTick((prev) => prev + (Math.random() > 0.5 ? 1 : 0));
    }, 2800);
    return () => clearInterval(ticker);
  }, []);

  // Listen to left-side hero pills hover/click
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
      {/* ===================== AMBIENT SPECTRUM & PIXELBLAST STAGE BACKDROP ===================== */}
      <div className="absolute -inset-3 sm:-inset-6 lg:-inset-8 rounded-[36px] overflow-hidden pointer-events-none">
        {/* Dark high-contrast spectrum container */}
        <div className="absolute inset-0 bg-[#070B19] rounded-[36px] shadow-[0_30px_90px_-15px_rgba(0,85,255,0.45)] border border-white/10" />

        {/* Animated Fluid Spectrum / Aurora Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            rotate: [0, 45, 0],
            opacity: [0.55, 0.8, 0.55],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[80px]"
          style={{
            background: `radial-gradient(circle, ${activeModule.accent} 0%, transparent 70%)`,
          }}
        />
        <motion.div
          animate={{
            scale: [1.1, 0.9, 1.1],
            rotate: [0, -60, 0],
            opacity: [0.45, 0.75, 0.45],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full blur-[90px]"
          style={{
            background: `radial-gradient(circle, ${activeModule.accentSecondary} 0%, #6366F1 50%, transparent 75%)`,
          }}
        />

        {/* Animated Spectrum Conic Rim */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 50%, #0055FF 0deg, #00E5FF 90deg, #6366F1 180deg, #10B981 270deg, #0055FF 360deg)',
            filter: 'blur(55px)',
          }}
        />
      </div>

      {/* Interactive PixelBlast WebGL Layer inside the Stage */}
      <div className="absolute -inset-3 sm:-inset-6 lg:-inset-8 rounded-[36px] overflow-hidden opacity-85">
        <PixelBlast
          variant="circle"
          pixelSize={3}
          color={activeModule.accent}
          accentColor={activeModule.accentSecondary}
          patternScale={2.2}
          patternDensity={0.95}
          softness={0.65}
          glow={0.75}
          twinkle={0.35}
          drift={0.25}
          speed={0.6}
          hoverEffect="reveal"
          hoverRadius={160}
          enableRipples={true}
          autoRipple={3.2}
          edgeFade={0.18}
        />
      </div>

      {/* ===================== 3D TILT INTERACTIVE APP WINDOW ===================== */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 mx-auto"
      >
        {/* Top Interactive Module Switcher Bar */}
        <div className="relative z-20 flex items-center justify-between gap-2 mb-3 px-0.5">
          <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-xl p-1 rounded-2xl border border-white/15 shadow-lg">
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-[11px] font-black text-white uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Demo en vivo →
          </a>
        </div>

        {/* Main Glassmorphic OS Window */}
        <div className="relative rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-white/15 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.75)] overflow-hidden">
          {/* Animated Spectrum Top Progress Line */}
          <div className="h-[2px] w-full bg-slate-900 overflow-hidden">
            <motion.div
              key={`${activeModule.id}-${isPaused}`}
              initial={{ width: '0%' }}
              animate={{ width: isPaused ? '100%' : '100%' }}
              transition={{
                duration: isPaused ? 0.4 : 5.5,
                ease: 'linear',
              }}
              className="h-full"
              style={{
                background: `linear-gradient(90deg, ${activeModule.accent}, ${activeModule.accentSecondary}, #10B981)`,
              }}
            />
          </div>

          {/* Window Chrome Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
              <div className="ml-2 flex items-center gap-1.5 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-300">
                <span className="text-emerald-400">🔒</span>
                <span className="truncate max-w-[160px] sm:max-w-[240px]">{activeModule.url}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white border border-white/15"
                style={{
                  background: `linear-gradient(135deg, ${activeModule.accent}66, ${activeModule.accentSecondary}44)`,
                }}
              >
                {activeModule.badge}
              </span>
            </div>
          </div>

          {/* Window Body */}
          <div className="p-4 sm:p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule.id}
                initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
              >
                {/* 4 KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                  {activeModule.kpis.map((kpi, i) => (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 rounded-xl p-2.5 sm:p-3 transition-colors group"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                        {kpi.label}
                      </div>
                      <div className="font-display text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight">
                        {activeModule.id === 'stock' && i === 0
                          ? scanTick.toLocaleString('es-ES')
                          : kpi.value}
                      </div>
                      <div
                        className={`text-[10px] font-extrabold mt-0.5 flex items-center gap-1 ${
                          kpi.positive ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        <span>{kpi.positive ? '●' : '▲'}</span>
                        <span>{kpi.delta}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Middle Row: Dynamic Spectrum Chart + Interactive Module Widget */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Animated Spectrum Bar & Wave Chart */}
                  <div className="sm:col-span-7 bg-slate-900/75 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {activeModule.chartTitle}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    </div>

                    {/* Interactive Bars */}
                    <div className="h-32 flex items-end gap-2 pt-4 px-1">
                      {activeModule.bars.map((bar, idx) => {
                        const isHovered = hoveredBar === idx;
                        return (
                          <div
                            key={bar.m}
                            onMouseEnter={() => setHoveredBar(idx)}
                            onMouseLeave={() => setHoveredBar(null)}
                            className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                          >
                            <div className="text-[9px] font-extrabold text-slate-300 opacity-85 group-hover:opacity-100 group-hover:text-white transition-opacity whitespace-nowrap">
                              {bar.amount}
                            </div>
                            <div className="w-full h-20 bg-slate-800/70 rounded-lg overflow-hidden flex items-end p-0.5 relative">
                              <motion.div
                                initial={{ height: '10%' }}
                                animate={{ height: `${bar.v}%` }}
                                transition={{
                                  type: 'spring',
                                  damping: 18,
                                  stiffness: 140,
                                  delay: idx * 0.05,
                                }}
                                className="w-full rounded-md relative"
                                style={{
                                  background:
                                    bar.active || isHovered
                                      ? `linear-gradient(180deg, ${activeModule.accentSecondary} 0%, ${activeModule.accent} 100%)`
                                      : 'linear-gradient(180deg, rgba(148,163,184,0.45) 0%, rgba(71,85,105,0.35) 100%)',
                                  boxShadow:
                                    bar.active || isHovered
                                      ? `0 0 16px ${activeModule.accent}88`
                                      : 'none',
                                }}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                bar.active ? 'text-white' : 'text-slate-400'
                              }`}
                            >
                              {bar.m}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Live Action Panel (Right 5 cols) */}
                  <div className="sm:col-span-5 bg-slate-900/75 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {activeModule.id === 'stock'
                          ? 'ESCÁNER QR EN VIVO'
                          : activeModule.id === 'erp'
                          ? 'CONTROL DE PLANTA'
                          : 'AGENDA INTERACTIVA'}
                      </span>
                      <span className="text-[10px] font-bold text-sky-400">
                        {activeModule.id === 'stock' ? 'Cámara activa' : 'Haz clic ↓'}
                      </span>
                    </div>

                    {activeModule.id === 'stock' ? (
                      <div className="my-auto flex flex-col items-center justify-center p-2 bg-slate-950/80 rounded-xl border border-indigo-500/30 relative overflow-hidden">
                        {/* Animated Laser Line */}
                        <motion.div
                          animate={{ top: ['12%', '86%', '12%'] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] z-10"
                        />
                        <div className="grid grid-cols-5 gap-1 p-2 bg-white rounded-lg shadow-inner">
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
                        <div className="mt-2 text-center">
                          <div className="text-[11px] font-black text-white">
                            #SKU-{scanTick} · Escaneado
                          </div>
                          <div className="text-[10px] font-bold text-emerald-400">
                            ✓ Stock descontado en 0.1s
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 my-auto">
                        {appts.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggleApptStatus(a.id)}
                            className="w-full text-left p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-white/5 flex items-center justify-between gap-2 transition-all group"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold text-sky-400">
                                  {a.time}
                                </span>
                                <span className="text-xs font-bold text-white truncate">
                                  {a.name}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{a.desc}</div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex-shrink-0 transition-colors ${
                                a.status === 'confirmada'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {a.status === 'confirmada' ? '✓ OK' : 'Pendiente'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Interactive Bar inside Window */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                <span>Conectado con WhatsApp API, Facturación PDF y Google Workspace</span>
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

        {/* ===================== FLOATING PARALLAX TOAST & REACT BITS <FOLDER /> ===================== */}

        {/* Mid-Left Floating Notification Toast (sin tapar pestañas ni botones) */}
        <motion.div
          style={{ x: floatX, y: floatY, translateZ: '40px' }}
          className="hidden sm:flex absolute top-[36%] -left-6 lg:-left-10 z-30 bg-white/95 backdrop-blur-xl text-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200/80 p-3 pr-4 items-center gap-3 max-w-[265px]"
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

        {/* Bottom-Left Metric Spectrum Pill */}
        <motion.div
          style={{ x: counterFloatX, y: counterFloatY, translateZ: '50px' }}
          className="mt-3 sm:mt-0 sm:absolute sm:-bottom-7 sm:left-3 z-30 bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-white/15 px-4 py-3 flex items-center justify-between sm:block"
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

        {/* Bottom-Right Floating React Bits <Folder /> (sin fondo ni caja alrededor) */}
        <motion.div
          style={{ x: floatX, y: counterFloatY, translateZ: '65px' }}
          className="mt-5 sm:mt-0 sm:absolute sm:-bottom-12 sm:-right-4 z-40 flex items-center justify-center"
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
