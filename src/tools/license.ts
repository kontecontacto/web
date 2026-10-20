// Licencia de las herramientas gratuitas: uso libre durante TRIAL_DAYS y, a partir de ahí,
// registro gratuito obligatorio (el registro llega como contacto a contacto@konte.es).
import { sendForm } from '../scripts/send';

export const TRIAL_DAYS = 15;

export interface License {
  firstUse: number;
  registered?: { name: string; email: string; business: string; phone?: string; at: number };
}

const key = (tool: string) => `konte-license-${tool}`;

export function getLicense(tool: string): License {
  try {
    const raw = localStorage.getItem(key(tool));
    if (raw) return JSON.parse(raw);
  } catch {}
  const fresh = { firstUse: Date.now() };
  saveLicense(tool, fresh);
  return fresh;
}

function saveLicense(tool: string, license: License) {
  try {
    localStorage.setItem(key(tool), JSON.stringify(license));
  } catch {}
}

export function daysUsed(license: License) {
  return Math.floor((Date.now() - license.firstUse) / 86_400_000);
}

export function daysLeft(license: License) {
  return Math.max(0, TRIAL_DAYS - daysUsed(license));
}

export function needsRegistration(license: License) {
  return !license.registered && daysUsed(license) >= TRIAL_DAYS;
}

// Envía el registro a contacto@konte.es. Si el envío falla, el usuario sigue pudiendo usar la herramienta.
export async function register(tool: string, toolName: string, data: { name: string; email: string; business: string; phone?: string }) {
  const license = getLicense(tool);
  await sendForm({
    _subject: `Registro herramienta gratis: ${toolName}`,
    origen: toolName,
    nombre: data.name,
    email: data.email,
    negocio: data.business,
    telefono: data.phone || '',
    dias_de_uso: daysUsed(license),
    pagina: location.href,
  });
  const updated = { ...license, registered: { ...data, at: Date.now() } };
  saveLicense(tool, updated);
  (window as any).gtag?.('event', 'generate_lead', { form: toolName });
  return updated;
}
