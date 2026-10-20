// Resumen de Konte para buscadores con IA (estándar llms.txt). Se genera con los mismos datos que la web.
import type { APIRoute } from 'astro';
import { SITE } from '../data/site';
import { SOLUTIONS } from '../data/soluciones';
import { PROJECTS } from '../data/projects';

const posts = Object.entries(import.meta.glob('./blog/*.astro', { eager: false }))
  .map(([file]) => file.replace('./blog/', '').replace('.astro', ''))
  .filter((slug) => slug !== 'index');

export const GET: APIRoute = () => {
  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.name} (konte.es) es un estudio de desarrollo de software a medida con base en ${SITE.city} (España) que trabaja en remoto con empresas de toda España y Latinoamérica. Desarrolla CRM, sistemas de turnos y cita previa, tickets y entradas con QR, sistemas de tickets de soporte, control de inventario con escáner, ERP, control horario y fichaje, control de producción y trazabilidad, apps para gimnasios y entrenadores, y apps o plataformas web a medida.`,
    '',
    'Trabaja con dos modalidades:',
    '- En la nube: servidor y base de datos propios, app móvil, acceso para clientes, pagos e integraciones. Pago único por el desarrollo + cuota mensual de servidor y mantenimiento según el proyecto.',
    '- Sobre Google Workspace (Google Sheets + Apps Script): pago único y 0 €/mes. Desde 300 € las mejoras de hojas de cálculo; aplicaciones completas entre 2.500 € y 8.000 €.',
    '',
    `Contacto: ${SITE.email} · ${SITE.phone} (teléfono y WhatsApp) · ${SITE.url}/contacto/`,
    'Presupuesto gratuito y cerrado en 48 h después de una llamada de 30 minutos. Plazos habituales: 1-2 semanas las automatizaciones sencillas y 4-8 semanas la primera versión de una aplicación completa.',
    '',
    '## Soluciones',
    ...SOLUTIONS.map((s) => `- [${s.name}](${SITE.url}/soluciones/${s.slug}/): ${s.cardDesc}`),
    '',
    '## Páginas principales',
    `- [Inicio](${SITE.url}/)`,
    `- [Servicios](${SITE.url}/servicios/): sistemas en la nube, apps móviles, integraciones con WhatsApp y APIs, automatización con Google Sheets, dashboards y formularios.`,
    `- [Software a medida en Barcelona](${SITE.url}/desarrollo-software-a-medida-barcelona/)`,
    `- [Software a medida en Latinoamérica](${SITE.url}/software-a-medida-latinoamerica/)`,
    `- [Plantilla CRM gratis para Excel y Google Sheets](${SITE.url}/plantilla-crm-gratis/)`,
    `- [Turnero online gratis](${SITE.url}/turnero-online-gratis/): sistema de turnos gratuito en el navegador con pantalla para TV, aviso por voz, varias colas y tickets impresos. Uso libre 15 días y después registro gratuito; versión Pro a medida con varios dispositivos, QR, WhatsApp y cita previa.`,
    `- [Herramientas gratis](${SITE.url}/herramientas-gratis/)`,
    `- [Contacto](${SITE.url}/contacto/)`,
    '',
    '## Casos reales',
    ...PROJECTS.map((p) => `- ${p.title}: ${p.desc.replace(/<[^>]+>/g, '')}`),
    '',
    '## Blog',
    ...posts.map((slug) => `- ${SITE.url}/blog/${slug}/`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
