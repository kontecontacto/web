// Datos de contacto y configuración global. Cambia aquí y se actualiza en toda la web.

export const SITE = {
  name: 'Konte',
  legalName: 'Konte Solutions',
  url: 'https://www.konte.es',
  email: 'contacto@konte.es',
  phone: '+34 602 194 331',
  phoneHref: 'tel:+34602194331',
  whatsappNumber: '34602194331',
  city: 'Barcelona',
  region: 'Cataluña',
  country: 'ES',
  calendly: 'https://calendly.com/konte-contacto/30min',
  // URL /exec del Apps Script de apps-script/formularios.gs: guarda cada contacto en una hoja
  // de Google y lo envía a contacto@konte.es. Mientras esté vacío se usa FormSubmit (formEndpoint).
  formsUrl: '',
  // FormSubmit: la primera vez manda un email de activación a contacto@konte.es que hay que confirmar.
  formEndpoint: 'https://formsubmit.co/ajax/contacto@konte.es',
  // ID de Google Analytics 4 (G-XXXXXXX). Vacío = sin analítica.
  gaId: '',
  // Perfiles sociales (para Google y buscadores IA). Añade las URLs reales cuando existan.
  sameAs: [] as string[],
  areaServed: [
    'España', 'Barcelona', 'Cataluña', 'México', 'Argentina', 'Colombia', 'Chile',
    'Perú', 'Uruguay', 'Ecuador', 'Paraguay', 'Bolivia', 'Venezuela', 'Costa Rica',
    'Panamá', 'República Dominicana', 'Guatemala',
  ],
} as const;

export function whatsappLink(text = 'Hola, vengo de konte.es y quiero información sobre un proyecto.') {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

// Opciones del selector "¿Qué necesitas?" de los formularios.
export const NEEDS = [
  'CRM a medida',
  'Sistema de turnos / citas / reservas',
  'Tickets o entradas con QR',
  'Sistema de tickets de soporte / incidencias',
  'Inventario y stock con escáner',
  'ERP / programa de gestión',
  'Control horario / fichaje',
  'Producción y trazabilidad',
  'App para gimnasio o entrenadores',
  'Automatizar Google Sheets / AppScript',
  'App móvil o plataforma web',
  'Otra cosa / no lo tengo claro',
];
