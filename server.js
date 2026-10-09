/**
 * Código del Futuro — servidor local de desarrollo (pagos MercadoPago)
 * Evento: 18 de octubre de 2026 · Bogotá
 *
 * En producción el sitio corre en Netlify (ver netlify.toml); este servidor
 * es solo para probar en tu computador:
 *   1. npm install
 *   2. Copia .env.example → .env y pon tus credenciales de MercadoPago
 *   3. npm start        → http://localhost:3000
 */

require('dotenv').config();
const express = require('express');
const path    = require('path');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { resolveBaseUrl, buildPreferenceBody } = require('./lib/preference');

const app = express();
app.use(express.json());

// Landing y assets estáticos (solo la carpeta public/, igual que en Netlify)
app.use(express.static(path.join(__dirname, 'public')));

const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 8000 }
});

// ─── Crear preferencia de pago ───────────────────────────────────────────────
app.post('/create-preference', async (req, res) => {
    try {
        const baseUrl = resolveBaseUrl(req.headers);
        const result  = await new Preference(mpClient).create({
            body: buildPreferenceBody(baseUrl, req.body || {})
        });

        res.json({
            id:                 result.id,
            init_point:         result.init_point,
            sandbox_init_point: result.sandbox_init_point
        });
    } catch (err) {
        console.error('[MercadoPago] Error creando preferencia:', err?.message || err);
        res.status(500).json({ error: 'No se pudo crear la preferencia de pago. Intenta nuevamente.' });
    }
});

// ─── Webhook de notificaciones ───────────────────────────────────────────────
app.post('/webhook', async (req, res) => {
    res.sendStatus(200); // responder rápido para que MP no reintente

    const { type, data } = req.body || {};
    if (type === 'payment' && data?.id) {
        try {
            const payment = await new Payment(mpClient).get({ id: data.id });
            console.log(`[Webhook] Pago ${data.id} — ${payment.status} — ${payment.payer?.email} — ${payment.external_reference}`);
        } catch (err) {
            console.error('[Webhook] Error procesando notificación:', err?.message);
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const hasToken = !!process.env.MP_ACCESS_TOKEN;
    const mode = (process.env.MP_ACCESS_TOKEN || '').startsWith('TEST-') ? 'SANDBOX' : 'PRODUCCIÓN';
    console.log(`\n  Código del Futuro — http://localhost:${PORT}`);
    console.log(`  MercadoPago: ${hasToken ? `configurado (${mode})` : '⚠ falta MP_ACCESS_TOKEN en .env'}\n`);
});
