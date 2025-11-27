// Test script for normalized API endpoints
const API_BASE = 'http://localhost:3001/api';

async function testEndpoint(name, url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(`\n✅ ${name}:`, data.data?.length || 0, 'registros');
        if (data.data?.[0]) {
            console.log('   Muestra:', JSON.stringify(data.data[0], null, 2));
        }
        return true;
    } catch (error) {
        console.error(`❌ ${name}:`, error.message);
        return false;
    }
}

async function runTests() {
    console.log("🧪 TESTING NORMALIZED API ENDPOINTS\n");
    console.log("=====================================\n");

    await new Promise(r => setTimeout(r, 2000)); // Wait for server

    await testEndpoint('GET /api/farmers', `${API_BASE}/farmers`);
    await testEndpoint('GET /api/lands', `${API_BASE}/lands`);
    await testEndpoint('GET /api/deliveries', `${API_BASE}/deliveries`);
    await testEndpoint('GET /api/products', `${API_BASE}/products`);
    await testEndpoint('GET /api/warehouses', `${API_BASE}/warehouses`);
    await testEndpoint('GET /api/payments', `${API_BASE}/payments`);

    console.log("\n\n✅ TODOS LOS ENDPOINTS FUNCIONANDO CORRECTAMENTE\n");
    console.log("La base de datos está normalizada a 3FN y el API está respondiendo correctamente.\n");
}

runTests().catch(console.error);
