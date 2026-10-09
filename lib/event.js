/**
 * Configuración única del evento y del producto.
 * La usan tanto la Netlify Function como server.js (desarrollo local),
 * así el precio y los textos del pago nunca quedan desalineados.
 *
 * Si cambias el precio aquí, cambia también el que muestra index.html
 * (sección "entradas") y corre:  npm run check
 */
module.exports = {
    // Dominio oficial: se usa como respaldo para las URLs de retorno y del webhook
    CANONICAL_URL: 'https://soysanticardenas.com',

    // Dominios desde los que se permite iniciar un pago (además de *.netlify.app y localhost)
    ALLOWED_HOSTS: ['soysanticardenas.com', 'www.soysanticardenas.com'],

    product: {
        id:          'BOLETA-CODIGO-DEL-FUTURO',
        title:       'Código del Futuro — Boleta General',
        description: 'Experiencia presencial · 18 de octubre de 2026 · Ágora Centro de Convenciones, Bogotá',
        categoryId:  'tickets',
        unitPrice:   280000,          // COP
        currency:    'COP',
        // Máx. 16 caracteres (límite de MercadoPago)
        statementDescriptor: 'CODIGO FUTURO',
    },

    // Número de WhatsApp (formato internacional, sin +)
    whatsapp: '573028424469',
};
