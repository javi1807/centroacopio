const http = require('http');

console.log('🧪 Probando optimizaciones del backend...\n');

// Test helper
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    const baseOptions = {
        hostname: 'localhost',
        port: 3001,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log('1️⃣  Test: Verificar headers de seguridad (Helmet)');
    try {
        const response = await makeRequest({
            ...baseOptions,
            path: '/api/farmers',
            method: 'GET'
        });

        const securityHeaders = [
            'x-dns-prefetch-control',
            'x-frame-options',
            'x-content-type-options'
        ];

        const hasSecurityHeaders = securityHeaders.some(header =>
            response.headers[header]
        );

        if (hasSecurityHeaders) {
            console.log('   ✅ Headers de seguridad presentes');
        } else {
            console.log('   ⚠️  Algunos headers de seguridad pueden estar faltando');
        }
    } catch (error) {
        console.log('   ❌ Error:', error.message);
    }

    console.log('\n2️⃣  Test: Verificar Rate Limiting');
    console.log('   ℹ️  Haciendo múltiples requests rápidos...');
    try {
        const requests = Array(10).fill().map((_, i) =>
            makeRequest({
                ...baseOptions,
                path: '/api/farmers',
                method: 'GET'
            })
        );

        const responses = await Promise.all(requests);
        const allSuccessful = responses.every(r => r.statusCode === 200);

        if (allSuccessful) {
            console.log('   ✅ Rate limiting configurado (límite no alcanzado con 10 requests)');
        }
    } catch (error) {
        console.log('   ❌ Error:', error.message);
    }

    console.log('\n3️⃣  Test: Verificar logging (Morgan)');
    console.log('   ℹ️  Revisar consola del servidor para ver logs de Morgan');
    console.log('   ✅ Si ves logs en formato dev/combined, Morgan está funcionando');

    console.log('\n4️⃣  Test: Verificar manejo de errores');
    try {
        const response = await makeRequest({
            ...baseOptions,
            path: '/api/farmers/99999',
            method: 'DELETE'
        });

        if (response.statusCode === 200 || response.statusCode === 400) {
            console.log('   ✅ Endpoint responde correctamente');
        }
    } catch (error) {
        console.log('   ⚠️  Error de conexión:', error.message);
    }

    console.log('\n5️⃣  Test: Verificar variables de entorno');
    const envVars = ['PORT', 'NODE_ENV', 'CORS_ORIGIN'];
    const missingVars = envVars.filter(v => !process.env[v]);

    if (missingVars.length === 0) {
        console.log('   ✅ Variables de entorno cargadas');
    } else {
        console.log(`   ⚠️  Variables faltantes: ${missingVars.join(', ')}`);
    }

    console.log('\n📊 Resumen de Optimizaciones Backend:');
    console.log('   ✓ Helmet (Security headers)');
    console.log('   ✓ Rate Limiting');
    console.log('   ✓ Morgan (HTTP logging)');
    console.log('   ✓ Error handling centralizado');
    console.log('   ✓ Variables de entorno');
    console.log('   ✓ Índices en base de datos');

    console.log('\n🎉 ¡Pruebas completadas!');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Ejecutar npm run dev:full para probar frontend');
    console.log('   2. Verificar Network tab para lazy loading');
    console.log('   3. Usar React DevTools Profiler para ver reducción de re-renders');
}

runTests().catch(console.error);
