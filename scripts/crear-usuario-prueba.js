/**
 * Crea un usuario de prueba (comprador) en MercadoPago Sandbox.
 * Úsalo UNA sola vez para obtener las credenciales del comprador de prueba.
 *
 * Ejecutar: node crear-usuario-prueba.js
 */

require('dotenv').config();

async function crearUsuarioPrueba() {
    // Para crear usuarios de prueba, MercadoPago exige el token de PRODUCCIÓN.
    // Pásalo como argumento: node crear-usuario-prueba.js TU_PRODUCTION_TOKEN
    // O agrégalo como MP_PROD_ACCESS_TOKEN en tu .env
    const accessToken = process.argv[2] || process.env.MP_PROD_ACCESS_TOKEN;

    if (!accessToken) {
        console.error('\n❌ Se necesita el Access Token de PRODUCCIÓN (no el de sandbox).\n');
        console.error('   Cómo obtenerlo:');
        console.error('   1. Abre: https://www.mercadopago.com.co/developers/panel/credentials');
        console.error('   2. Cambia a la pestaña "Credenciales de producción"');
        console.error('   3. Copia el "Access Token" de producción\n');
        console.error('   Luego ejecuta:');
        console.error('   node crear-usuario-prueba.js APP_USR-tu-token-de-produccion\n');
        process.exit(1);
    }

    if (accessToken.includes('sandbox') || accessToken === process.env.MP_ACCESS_TOKEN) {
        console.warn('\n⚠  Parece que estás usando el token de SANDBOX.');
        console.warn('   Este script necesita el token de PRODUCCIÓN.\n');
    }

    console.log('Creando usuario de prueba en MercadoPago...\n');

    const res = await fetch('https://api.mercadopago.com/users/test', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `test-buyer-${Date.now()}`
        },
        body: JSON.stringify({
            site_id: 'MCO',          // MCO = Colombia
            description: 'Comprador de prueba — Be Imparables'
        })
    });

    const data = await res.json();

    if (!res.ok) {
        console.error('❌ Error:', JSON.stringify(data, null, 2));
        process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ USUARIO DE PRUEBA CREADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  📧 Email:      ', data.email);
    console.log('  🔑 Password:   ', data.password);
    console.log('  🆔 ID:         ', data.id);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n  ➡ Usa estas credenciales para INICIAR SESIÓN');
    console.log('     en el checkout de MercadoPago durante las pruebas.');
    console.log('\n  📌 Tarjeta de prueba para usar DENTRO de esa cuenta:');
    console.log('     Número:      5031 7557 3453 0604');
    console.log('     Vencimiento: 11/30');
    console.log('     CVV:         123');
    console.log('     Titular:     APRO  (para simular pago aprobado)');
    console.log('═══════════════════════════════════════════════════════\n');
}

crearUsuarioPrueba().catch(console.error);
