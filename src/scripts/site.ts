import { SITE, whatsappLink } from '../data/site';
import { sendForm } from './send';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    Calendly?: { initPopupWidget: (opts: { url: string }) => void };
  }
}

function track(event: string, params: Record<string, unknown> = {}) {
  window.gtag?.('event', event, params);
}

// ---- Menú móvil ----
const menuBtn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');
menuBtn?.addEventListener('click', () => {
  const open = menu?.classList.toggle('hidden') === false;
  menuBtn.setAttribute('aria-expanded', String(open));
});
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.classList.add('hidden')));

// ---- Sombra de la cabecera al hacer scroll ----
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => nav?.classList.toggle('shadow-md', window.scrollY > 20), { passive: true });

// ---- Calendly: se carga solo cuando alguien lo pide ----
let calendlyLoading: Promise<void> | null = null;
function loadCalendly() {
  calendlyLoading ??= new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://assets.calendly.com/assets/external/widget.js';
    js.onload = () => resolve();
    js.onerror = () => reject();
    document.body.appendChild(js);
  });
  return calendlyLoading;
}
document.querySelectorAll<HTMLElement>('[data-calendly]').forEach((el) => {
  el.addEventListener('click', async (e) => {
    e.preventDefault();
    track('contact_click', { method: 'calendly' });
    try {
      await loadCalendly();
      window.Calendly!.initPopupWidget({ url: SITE.calendly });
    } catch {
      window.open(SITE.calendly, '_blank');
    }
  });
});

// ---- Botones que preseleccionan "¿Qué necesitas?" en el formulario de contacto ----
document.querySelectorAll<HTMLElement>('[data-need]').forEach((el) => {
  el.addEventListener('click', () => {
    const select = document.querySelector<HTMLSelectElement>('#contacto [data-need-select]');
    if (select) select.value = el.dataset.need || '';
  });
});

// ---- Clics en canales de contacto (para analítica) ----
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('tel:')) track('contact_click', { method: 'phone' });
  else if (href.startsWith('mailto:')) track('contact_click', { method: 'email' });
  else if (href.includes('wa.me/')) track('contact_click', { method: 'whatsapp' });
});

// ---- Formularios: envío directo a contacto@konte.es ----
function summary(data: Record<string, string>) {
  return [
    `Hola, soy ${data.nombre || ''}.`,
    data.necesidad ? `Necesito: ${data.necesidad}.` : '',
    data.mensaje || '',
    data.telefono ? `Mi teléfono: ${data.telefono}.` : '',
  ].filter(Boolean).join(' ');
}

function download(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

document.querySelectorAll<HTMLFormElement>('form[data-konte-form]').forEach((form) => {
  const wrap = form.closest('[data-form-wrap]') as HTMLElement;
  const inlineError = form.querySelector<HTMLElement>('[data-form-error-inline]');
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const label = form.querySelector<HTMLElement>('[data-submit-label]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    inlineError?.classList.add('hidden');

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector<HTMLInputElement>(':invalid');
      if (inlineError) {
        inlineError.textContent = firstInvalid?.type === 'email' && firstInvalid.value
          ? 'Revisa el email, parece que no es correcto.'
          : 'Rellena los campos obligatorios (*).';
        inlineError.classList.remove('hidden');
      }
      firstInvalid?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const downloadUrl = form.dataset.download;
    const isBot = Boolean(data._honey);
    delete data._honey;

    const subject = data.necesidad ? `${form.dataset.subject}: ${data.necesidad}` : form.dataset.subject;
    const payload = { ...data, pagina: location.href, _subject: subject };

    const original = label?.textContent;
    btn.disabled = true;
    if (label) label.textContent = 'Enviando…';

    const ok = isBot || (await sendForm(payload));

    btn.disabled = false;
    if (label) label.textContent = original || '';

    const text = summary(data);
    if (ok || downloadUrl) {
      track('generate_lead', { form: data.origen || form.id, need: data.necesidad || '' });
      form.classList.add('hidden');
      const success = wrap.querySelector<HTMLElement>('[data-form-success]');
      success?.classList.remove('hidden');
      const waLink = success?.querySelector<HTMLAnchorElement>('[data-success-whatsapp]');
      if (waLink) waLink.href = whatsappLink(text);
      if (downloadUrl) {
        track('file_download', { file_name: downloadUrl });
        download(downloadUrl);
      }
    } else {
      form.classList.add('hidden');
      const failure = wrap.querySelector<HTMLElement>('[data-form-failure]');
      failure?.classList.remove('hidden');
      const wa = failure?.querySelector<HTMLAnchorElement>('[data-failure-whatsapp]');
      const mail = failure?.querySelector<HTMLAnchorElement>('[data-failure-email]');
      if (wa) wa.href = whatsappLink(text);
      if (mail) mail.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject || 'Consulta desde konte.es')}&body=${encodeURIComponent(text)}`;
    }
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
