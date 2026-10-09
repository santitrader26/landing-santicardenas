# soysanticardenas.com — Código del Futuro (Bogotá · 18 de octubre de 2026)

Landing de venta de boletas con pago por **MercadoPago**, publicada en **Netlify**.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/santitrader26/landing-santicardenas)

> Un clic: Netlify pide iniciar sesión, crea el sitio desde este repo y te muestra un formulario para pegar
> tu `MP_ACCESS_TOKEN`. Después solo queda apuntar el dominio (ver abajo).

```
public/              ← lo único que se publica
  index.html           landing
  gracias.html         página de retorno de MercadoPago (aprobado / en proceso / rechazado)
  pixel.js             ★ aquí se pega el ID del Pixel de Meta
  img/  media/         fotos (WebP) y video de testimonios
  favicon.svg robots.txt sitemap.xml
netlify/functions/   create-preference (crea el pago) y webhook (notificaciones de MP)
lib/                 event.js (precio, producto, WhatsApp) y preference.js (lógica compartida)
server.js            servidor local de pruebas (npm start)
scripts/check.js     verificación previa a publicar (npm run check)
```

## Puesta en producción (Netlify)

1. **Variable de entorno** (Netlify → Site configuration → Environment variables):
   `MP_ACCESS_TOKEN` = Access Token de **producción** de MercadoPago (`APP_USR-…`).
2. **Build settings:** publish directory `public`, functions `netlify/functions` (ya definido en `netlify.toml`).
3. Conecta el sitio a este repositorio (`santitrader26/landing-santicardenas`, rama `master`); cada `git push` publica solo.
4. En MercadoPago → Tus integraciones → Notificaciones, la URL de webhook se envía en cada pago
   (`/.netlify/functions/webhook`); no hay que configurarla a mano.

## Cosas que se editan seguido

| Qué | Dónde |
|---|---|
| Pixel de Meta | `public/pixel.js` → `META_PIXEL_ID` |
| Precio de la boleta | `lib/event.js` → `unitPrice` **y** el precio visible en `public/index.html` (sección entradas) y `PRICE_COP` en `index.html`/`gracias.html`. Luego `npm run check` |
| WhatsApp | `lib/event.js` (`whatsapp`), los links `wa.me/...` de `index.html` y `WA_NUMBER` en `gracias.html` |
| Más testimonios en video | copia el `<article class="video-testimonial">` en `index.html` y sube el video a `public/media/` |
| Fecha del evento / cuenta regresiva | `index.html` → `new Date('2026-10-18T09:00:00-05:00')` |

## Probar en tu computador

```
npm install
copy .env.example .env      (y pon un MP_ACCESS_TOKEN de prueba TEST-...)
npm start                   → http://localhost:3000
npm run check
```
