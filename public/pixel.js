/**
 * Meta Pixel — configuración ÚNICA para todo el sitio (index.html y gracias.html).
 *
 * 1) Crea tu píxel en el Administrador de eventos de Meta (business.facebook.com).
 * 2) Pega aquí su ID (solo números) y haz commit/push. Netlify lo publica solo.
 *
 * Mientras META_PIXEL_ID esté vacío no se carga nada de Meta y la página
 * funciona igual (las llamadas a fbq() quedan como funciones vacías).
 *
 * Eventos que la página ya envía cuando hay píxel:
 *   PageView          → al cargar cualquier página
 *   InitiateCheckout  → al pulsar "Quiero asegurar mi cupo" (index)
 *   Contact           → al pulsar cualquier botón de WhatsApp (index)
 *   Purchase          → al volver de MercadoPago con el pago aprobado (gracias)
 */
window.META_PIXEL_ID = '';   // ← ej: '1234567890123456'

window.fbq = window.fbq || function () {};

if (window.META_PIXEL_ID) {
  !function (f, b, e, v, n, t, s) {
    if (f.fbq && f.fbq.callMethod) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', window.META_PIXEL_ID);
  fbq('track', 'PageView');
}
