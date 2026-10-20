/**
 * Receptor de formularios de www.konte.es
 *
 * Cada envío de la web:
 *   1. se guarda como fila en la pestaña "Contactos" de esta hoja de cálculo,
 *   2. te llega por email a DESTINO (al pulsar «Responder» le contestas directamente al cliente),
 *   3. y, si el formulario lo pide, el cliente recibe una respuesta automática.
 *
 * Instalación (una sola vez):
 *   1. Crea una hoja de Google Sheets, por ejemplo «Contactos konte.es».
 *   2. Extensiones → Apps Script. Borra lo que haya, pega este archivo y guarda.
 *   3. Ejecuta la función `probar` (botón ▶) y acepta los permisos: te llegará un email de prueba.
 *   4. Implementar → Nueva implementación → tipo «Aplicación web».
 *      Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario → Implementar.
 *   5. Copia la URL que termina en /exec y pásasela a quien mantiene la web
 *      (va en `formsUrl` de src/data/site.ts).
 *
 * Si cambias este código: Implementar → Gestionar implementaciones → editar (lápiz)
 * → Versión: Nueva versión → Implementar. Así la URL no cambia.
 */

const DESTINO = 'contacto@konte.es';
const NOMBRE_REMITENTE = 'Konte';
const WEB = 'https://www.konte.es';
const TELEFONO = '+34 602 194 331';

const COLUMNAS = ['Fecha', 'Origen', 'Nombre', 'Email', 'Teléfono', 'Necesidad', 'Mensaje', 'Negocio', 'Equipo', 'Días de uso', 'Página', 'Otros datos'];
const CAMPOS = ['origen', 'nombre', 'email', 'telefono', 'necesidad', 'mensaje', 'negocio', 'equipo', 'dias_de_uso', 'pagina'];

// Respuestas automáticas. La web solo indica cuál usar; el texto vive aquí para que
// nadie pueda usar el formulario para enviar mensajes inventados a otras personas.
const RESPUESTAS = {
  'plantilla-crm': {
    asunto: 'Tu plantilla CRM gratis de Konte',
    texto: (d) => `Hola ${d.nombre || ''}:

¡Gracias por descargar la Plantilla CRM de Konte!

Si la descarga no empezó sola, aquí la tienes:
${WEB}/descargas/plantilla-crm-konte.xlsx

Para usarla en Google Sheets: súbela a Google Drive > clic derecho > Abrir con > Hojas de cálculo de Google.

Y si algún día se te queda pequeña, la convertimos en un CRM online con app móvil, varios usuarios y recordatorios por WhatsApp. Solo tienes que responder a este email o escribirnos al ${TELEFONO}.

Konte · ${WEB}`,
  },
  'turnero-enlace': {
    asunto: 'Tu turnero gratis de Konte',
    texto: (d) => `Hola:

Aquí tienes tu turnero gratis. Ábrelo en el ordenador de tu negocio:
${WEB}/turnero-online-gratis/app/

Pulsa «Abrir pantalla», lleva esa ventana a la TV y pulsa F11. Después, «Siguiente» para llamar cada turno.

¿Quieres llamar desde el móvil, que tus clientes saquen turno con un QR o recibir avisos por WhatsApp? Responde a este email o escríbenos al ${TELEFONO}.

Konte · ${WEB}`,
  },
};

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d._honey) return respuesta_({ success: true }); // bot

    const email = limpiar_(d.email, 200).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respuesta_({ success: false, error: 'email' });
    if (demasiados_(email)) return respuesta_({ success: false, error: 'limite' });

    const datos = {};
    CAMPOS.forEach((c) => (datos[c] = limpiar_(d[c], c === 'mensaje' ? 3000 : 300)));
    datos.email = email;
    const otros = Object.keys(d)
      .filter((k) => CAMPOS.indexOf(k) === -1 && k.charAt(0) !== '_')
      .reduce((o, k) => ((o[k] = limpiar_(d[k], 300)), o), {});

    guardar_(datos, otros);
    avisar_(limpiar_(d._subject, 150) || 'Nuevo contacto desde konte.es', datos, otros);

    const r = RESPUESTAS[d.respuesta];
    if (r) {
      MailApp.sendEmail({ to: email, subject: r.asunto, body: r.texto(datos), name: NOMBRE_REMITENTE, replyTo: DESTINO });
    }
    return respuesta_({ success: true });
  } catch (err) {
    console.error(err);
    return respuesta_({ success: false, error: String(err) });
  }
}

function doGet() {
  return respuesta_({ ok: true, servicio: 'formularios konte.es' });
}

function guardar_(datos, otros) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = libro.getSheetByName('Contactos') || libro.insertSheet('Contactos', 0);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(COLUMNAS);
    hoja.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold').setBackground('#0055FF').setFontColor('#FFFFFF');
    hoja.setFrozenRows(1);
  }
  hoja.appendRow([
    new Date(), datos.origen, datos.nombre, datos.email, datos.telefono, datos.necesidad, datos.mensaje,
    datos.negocio, datos.equipo, datos.dias_de_uso, datos.pagina,
    Object.keys(otros).length ? JSON.stringify(otros) : '',
  ]);
}

function avisar_(asunto, datos, otros) {
  const filas = COLUMNAS.slice(1, -1)
    .map((titulo, i) => [titulo, datos[CAMPOS[i]]])
    .concat(Object.keys(otros).map((k) => [k, otros[k]]))
    .filter((f) => f[1])
    .map((f) => `<tr><td style="padding:6px 12px;background:#f3f4f6;font-weight:bold">${esc_(f[0])}</td><td style="padding:6px 12px">${esc_(f[1]).replace(/\n/g, '<br>')}</td></tr>`)
    .join('');
  const wa = datos.telefono ? `<p><a href="https://wa.me/${datos.telefono.replace(/\D/g, '')}">Escribirle por WhatsApp</a></p>` : '';
  MailApp.sendEmail({
    to: DESTINO,
    replyTo: datos.email,
    subject: asunto,
    name: 'Web konte.es',
    htmlBody: `<p>Nuevo contacto desde la web. Pulsa <b>Responder</b> para contestarle directamente.</p><table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${filas}</table>${wa}`,
  });
}

// Como mucho 5 envíos por email cada hora y 60 en total por hora: frena a los bots.
function demasiados_(email) {
  const cache = CacheService.getScriptCache();
  const k1 = 'e:' + email;
  const k2 = 'total:' + new Date().getHours();
  const n1 = Number(cache.get(k1) || 0) + 1;
  const n2 = Number(cache.get(k2) || 0) + 1;
  cache.put(k1, String(n1), 3600);
  cache.put(k2, String(n2), 3600);
  return n1 > 5 || n2 > 60;
}

function limpiar_(v, max) {
  return v === undefined || v === null ? '' : String(v).trim().slice(0, max);
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Ejecútala una vez desde el editor para dar permisos y comprobar que llega el email.
function probar() {
  doPost({
    postData: {
      contents: JSON.stringify({
        origen: 'Prueba desde Apps Script',
        nombre: 'Prueba',
        email: DESTINO,
        necesidad: 'Comprobar que funciona',
        mensaje: 'Si lees esto, los formularios de la web ya llegan aquí y a la hoja.',
        _subject: 'Prueba de formularios konte.es',
      }),
    },
  });
}
