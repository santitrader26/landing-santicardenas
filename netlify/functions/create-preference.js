/**
 * Netlify Function — Crear preferencia de pago MercadoPago
 * Se invoca desde la landing con POST /create-preference
 * (netlify.toml reescribe /create-preference → /.netlify/functions/create-preference)
 *
 * Variables de entorno necesarias en Netlify:
 *   MP_ACCESS_TOKEN  → Access Token PRIVADO de MercadoPago (producción: APP_USR-...)
 */

const { MercadoPagoConfig, Preference } = require('mercadopago');
const { resolveBaseUrl, buildPreferenceBody } = require('../../lib/preference');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

const reply = (statusCode, payload) => ({
    statusCode,
    headers: CORS_HEADERS,
    body: payload === '' ? '' : JSON.stringify(payload)
});

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return reply(200, '');
    if (event.httpMethod !== 'POST')    return reply(405, { error: 'Method Not Allowed' });

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('[MP] MP_ACCESS_TOKEN no configurado en Netlify');
        return reply(500, { error: 'Servidor mal configurado' });
    }

    try {
        const buyer   = JSON.parse(event.body || '{}');
        const baseUrl = resolveBaseUrl(event.headers);

        const client     = new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } });
        const preference = new Preference(client);

        const result = await preference.create({
            body: buildPreferenceBody(baseUrl, buyer, { webhookPath: '/.netlify/functions/webhook' })
        });

        console.log(`[MP] Preferencia ${result.id} creada — retorno a ${baseUrl}`);

        return reply(200, {
            id:                 result.id,
            init_point:         result.init_point,
            sandbox_init_point: result.sandbox_init_point
        });

    } catch (err) {
        console.error('[MP] Error creando preferencia:', err?.message || err);
        return reply(500, { error: 'No se pudo crear la preferencia de pago' });
    }
};
