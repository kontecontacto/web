import { SITE } from '../data/site';

// Envía un formulario. Si está configurado el Apps Script propio (SITE.formsUrl), va ahí:
// guarda el contacto en la hoja de Google y avisa por email. Si no, usa FormSubmit.
export async function sendForm(payload: Record<string, unknown>): Promise<boolean> {
  try {
    if (SITE.formsUrl) {
      // Sin cabeceras: el navegador lo envía como texto plano y Apps Script no necesita CORS previo.
      const res = await fetch(SITE.formsUrl, { method: 'POST', body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      return res.ok && json.success === true;
    }
    const res = await fetch(SITE.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...payload, _template: 'table', _captcha: 'false' }),
    });
    const json = await res.json().catch(() => ({}));
    return res.ok && String(json.success) !== 'false';
  } catch {
    return false;
  }
}
