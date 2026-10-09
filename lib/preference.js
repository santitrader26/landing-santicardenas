/**
 * Lógica compartida para crear la preferencia de pago de MercadoPago.
 * Usada por netlify/functions/create-preference.js y por server.js.
 */
const crypto = require('crypto');
const { CANONICAL_URL, ALLOWED_HOSTS, product } = require('./event');

/**
 * Decide a qué URL base volverá el cliente tras pagar.
 * Se toma del host real de la petición (así quien paga en soysanticardenas.com
 * vuelve a soysanticardenas.com y no al subdominio .netlify.app), pero solo si
 * el host está en la lista permitida; si no, se usa el dominio oficial.
 */
function resolveBaseUrl(headers = {}) {
    const h = {};
    for (const k of Object.keys(headers)) h[k.toLowerCase()] = headers[k];

    const rawHost = String(h['x-forwarded-host'] || h['host'] || '').split(',')[0].trim().toLowerCase();
    const hostname = rawHost.split(':')[0];
    if (!hostname) return CANONICAL_URL;

    const isLocal   = hostname === 'localhost' || hostname === '127.0.0.1';
    const isNetlify = hostname.endsWith('.netlify.app');
    const isAllowed = ALLOWED_HOSTS.includes(hostname);

    if (!(isLocal || isNetlify || isAllowed)) return CANONICAL_URL;

    const proto = isLocal ? 'http' : 'https';
    return `${proto}://${rawHost}`;
}

function cleanPhone(phone, country) {
    const digits = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!digits) return undefined;
    return { area_code: country === 'CO' ? '57' : '', number: digits };
}

/** Cuerpo de la preferencia que se envía a MercadoPago. */
function buildPreferenceBody(baseUrl, buyer = {}, { webhookPath = '/webhook' } = {}) {
    const { name = '', email = '', phone = '', country = 'CO' } = buyer;
    const isLocal = baseUrl.startsWith('http://localhost') || baseUrl.startsWith('http://127.0.0.1');
    const ref = `CDF-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const body = {
        items: [{
            id:          product.id,
            title:       product.title,
            description: product.description,
            category_id: product.categoryId,
            quantity:    1,
            unit_price:  product.unitPrice,
            currency_id: product.currency,
        }],
        payer: {
            name:  name  || undefined,
            email: email || undefined,
            phone: cleanPhone(phone, country),
        },
        statement_descriptor: product.statementDescriptor,
        external_reference:   ref,
    };

    // auto_return, back_urls y notification_url exigen una URL pública (no localhost)
    if (!isLocal) {
        body.back_urls = {
            success: `${baseUrl}/gracias.html?status=approved`,
            failure: `${baseUrl}/gracias.html?status=rejected`,
            pending: `${baseUrl}/gracias.html?status=in_process`,
        };
        body.auto_return = 'approved';
        body.notification_url = `${baseUrl}${webhookPath}`;
    }

    return body;
}

module.exports = { resolveBaseUrl, buildPreferenceBody };
