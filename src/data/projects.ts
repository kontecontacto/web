// Casos reales. Se usan en la home y en las páginas de soluciones.

export interface Project {
  id: string;
  tags: string[];
  title: string;
  desc: string;
  folder: string;
  logo: string;
  mainImg: string;
  thumbs: string[];
}

export const PROJECTS: Project[] = [
  {
    id: 'flagship',
    tags: ['Gastronomía', 'Control de Inventario', 'App Integral'],
    title: 'Inventario Multi-Sede: FlagShip',
    desc: 'Una <strong>app de inventario</strong> diseñada para gestionar los utensilios y equipamiento en cientos de cafeterías por todo Estados Unidos. Escalabilidad total y sincronización en tiempo real.',
    folder: 'FlagShip',
    logo: 'logo.png',
    mainImg: '1.png',
    thumbs: ['Captura de pantalla 2026-04-01 124439.png', 'Captura de pantalla 2026-04-01 124448.png'],
  },
  {
    id: 'montelimar',
    tags: ['Manufactura', 'Gestión de Lotes'],
    title: 'Aplicación Integral de Producción: Montelimar',
    desc: 'Un sistema integral para la <strong>gestión de procesos</strong> y <strong>control de temperatura</strong>. Permite a los operarios saber qué fabricar, controlar las variables de la <strong>cámara de curado</strong> y lotes, mientras los jefes visualizan dashboards de rendimiento en tiempo real sin perder datos en papel.',
    folder: 'Montelimar',
    logo: 'logo.png',
    mainImg: '1.png',
    thumbs: ['image copy.png', 'image copy 2.png'],
  },
  {
    id: 'recomotor',
    tags: ['Logística Autopartes', 'Control de Stock Automotriz'],
    title: 'Software de Inventario Dinámico: Recomotor',
    desc: 'Una plataforma para la <strong>trazabilidad de recambios</strong> e inventariado de cada vehículo mediante escáner. Cualquier empleado puede registrar trazabilidad actualizando el flujo de entrada y salida, asegurando una gestión total del <strong>stock de talleres</strong>.',
    folder: 'Recomotor',
    logo: 'logo.png',
    mainImg: '1.png',
    thumbs: ['Untitled design (2).png', 'Untitled design (3).png'],
  },
  {
    id: 'gym',
    tags: ['Salud & Fitness', 'Planificador de Rutinas'],
    title: 'App Integral para Entrenadores',
    desc: 'Un <strong>dashboard de seguimiento de clientes</strong> para entrenadores deportivos. Control absoluto y <strong>gestión de pagos recurrentes</strong>, asignación de rutinas personalizadas, centralizando historiales y ahorrando un 80% del tiempo organizativo manual.',
    folder: 'Gestion Gym -Entrenador personal',
    logo: 'logo.png',
    mainImg: '1.png',
    thumbs: ['Captura de pantalla 2026-03-31 181347.png', 'Captura de pantalla 2026-03-31 181353.png', 'Captura de pantalla 2026-03-31 181404.png'],
  },
  {
    id: 'hefe',
    tags: ['Agroindustria', 'Gestión de Materia Prima'],
    title: 'Hefe: ERP de Automatización Agrícola',
    desc: 'De caos logístico a control maestro. Los operarios visualizan en piso la <strong>escalabilidad de recetas industriales</strong>, el sistema computa el alta de las <strong>órdenes de producción y stock</strong> automáticamente, actuando como un <strong>ERP a medida</strong> 100% digitalizado.',
    folder: 'Hefe - Planta fertilizantes',
    logo: 'logo.png',
    mainImg: '1.png',
    thumbs: ['Captura de pantalla 2026-03-31 175019.png', 'Captura de pantalla 2026-03-31 175208.png', 'Captura de pantalla 2026-03-31 175213.png'],
  },
  {
    id: 'constructoras',
    tags: ['Construcción', 'Flujo de Caja'],
    title: 'Gestor Financiero Constructoras',
    desc: 'Sistema de alta capacidad para la auditoría y el <strong>control de presupuestos de obra</strong>. Un robusto <strong>dashboard financiero</strong> donde se supervisan gastos de proveedores, flujos de pagos y el índice de <strong>rentabilidad por proyecto</strong>.',
    folder: 'Gestor Financiero Constructoras',
    logo: 'logo.png',
    mainImg: '1.png',
    thumbs: ['Captura de pantalla 2026-03-31 190931.png', 'Captura de pantalla 2026-03-31 190950.png'],
  },
];

export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);
