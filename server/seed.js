const db = require('./db');

// Wait a bit for DB initialization from the required module
setTimeout(() => {
    db.serialize(() => {
        console.log("Iniciando carga de datos normalizados (3FN)...");

        // ===== TABLAS DE REFERENCIA =====

        // 1. Tipos de Documento
        const tiposDocumento = [
            ["DNI", "Documento Nacional de Identidad"],
            ["RUC", "Registro Único de Contribuyentes"],
            ["CE", "Carnet de Extranjería"]
        ];
        const stmtTipoDoc = db.prepare("INSERT OR IGNORE INTO tipos_documento (codigo, descripcion) VALUES (?, ?)");
        tiposDocumento.forEach(td => stmtTipoDoc.run(td));
        stmtTipoDoc.finalize();

        // 2. Departamentos (extraídos de los datos actuales)
        const departamentos = [
            ["San Martín"],
            ["Huánuco"],
            ["Ucayali"]
        ];
        const stmtDepartamento = db.prepare("INSERT OR IGNORE INTO departamentos (nombre) VALUES (?)");
        departamentos.forEach(d => stmtDepartamento.run(d));
        stmtDepartamento.finalize();

        // 3. Provincias
        const provincias = [
            // San Martín (id=1)
            ["Tocache", 1],
            ["Mariscal Cáceres", 1],
            ["Bellavista", 1],
            ["Moyobamba", 1],
            // Huánuco (id=2)
            ["Leoncio Prado", 2],
            ["Huánuco", 2],
            // Ucayali (id=3)
            ["Padre Abad", 3],
            ["Coronel Portillo", 3]
        ];
        const stmtProvincia = db.prepare("INSERT OR IGNORE INTO provincias (nombre, departamento_id) VALUES (?, ?)");
        provincias.forEach(p => stmtProvincia.run(p));
        stmtProvincia.finalize();

        // 4. Distritos
        const distritos = [
            // Tocache (provincia_id=1)
            ["Tocache", 1],
            ["Uchiza", 1],
            // Mariscal Cáceres (provincia_id=2)
            ["Juanjuí", 2],
            // Bellavista (provincia_id=3)
            ["Bellavista", 3],
            // Moyobamba (provincia_id=4)
            ["Moyobamba", 4],
            // Leoncio Prado (provincia_id=5)
            ["Rupa-Rupa", 5],
            ["Castillo Grande", 5],
            // Huánuco (provincia_id=6)
            ["Amarilis", 6],
            // Padre Abad (provincia_id=7)
            ["Irazola", 7],
            // Coronel Portillo (provincia_id=8)
            ["Callería", 8]
        ];
        const stmtDistrito = db.prepare("INSERT OR IGNORE INTO distritos (nombre, provincia_id) VALUES (?, ?)");
        distritos.forEach(d => stmtDistrito.run(d));
        stmtDistrito.finalize();

        // 5. Tipos de Riego
        const tiposRiego = [
            ["Secano"],
            ["Gravedad"],
            ["Goteo"],
            ["Aspersión"]
        ];
        const stmtTipoRiego = db.prepare("INSERT OR IGNORE INTO tipos_riego (nombre) VALUES (?)");
        tiposRiego.forEach(tr => stmtTipoRiego.run(tr));
        stmtTipoRiego.finalize();

        // 6. Productos
        const products = [
            ["Cacao", "CCN-51", "Activo"],
            ["Cacao", "Criollo", "Activo"],
            ["Cacao", "ICS-95", "Activo"],
            ["Café", "Catimor", "Activo"],
            ["Café", "Caturra", "Activo"]
        ];
        const stmtProduct = db.prepare("INSERT OR IGNORE INTO productos (name, variety, status) VALUES (?, ?, ?)");
        products.forEach(p => stmtProduct.run(p));
        stmtProduct.finalize();

        // 7. Almacenes
        const warehouses = [
            ["Almacén Norte", "Centro de Acopio", 3000, "Sector Norte", "Activo"],
            ["Secadora B", "Secado", 1500, "Patio Central", "Mantenimiento"]
        ];
        const stmtWarehouse = db.prepare("INSERT OR IGNORE INTO almacenes (name, type, capacity, location, status) VALUES (?, ?, ?, ?, ?)");
        warehouses.forEach(w => stmtWarehouse.run(w));
        stmtWarehouse.finalize();

        // ===== DATOS PRINCIPALES (CON IDs NORMALIZADOS) =====

        // 8. Agricultores (Normalized)
        // Formato: [name, document, tipo_documento_id, phone, distrito_id, zone, status, deliveries]
        // Mapeo de distritos: Tocache=1, Uchiza=2, Juanjuí=3, Bellavista=4, Moyobamba=5, Rupa-Rupa=6, Castillo Grande=7, Amarilis=8, Irazola=9, Callería=10
        const farmers = [
            ["Juan Pérez", "12345678", 1, "987654321", 1, null, "Activo", 45], // Tocache
            ["María García", "23456789", 1, "987654322", 3, null, "Activo", 32], // Juanjuí
            ["Cooperativa Agraria", "20123456789", 2, "012345678", 6, null, "Activo", 120], // Rupa-Rupa
            ["Carlos López", "34567890", 1, "987654323", 9, null, "Activo", 28], // Irazola
            ["Ana Martínez", "45678901", 1, "987654324", 2, null, "Inactivo", 15], // Uchiza
            ["Pedro Castillo", "56789012", 1, "987654325", 4, null, "Activo", 10], // Bellavista
            ["Sofia Ramirez", "67890123", 1, "987654326", 8, null, "Activo", 5], // Amarilis
            ["Miguel Torres", "78901234", 1, "987654327", 10, null, "Activo", 60], // Callería
            ["Lucia Fernandez", "89012345", 1, "987654328", 5, null, "Activo", 22], // Moyobamba
            ["Jorge Ruiz", "90123456", 1, "987654329", 7, null, "Activo", 18] // Castillo Grande
        ];
        const stmtFarmer = db.prepare("INSERT OR IGNORE INTO agricultores (name, document, tipo_documento_id, phone, distrito_id, zone, status, deliveries) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        farmers.forEach(f => stmtFarmer.run(f));
        stmtFarmer.finalize();

        // 9. Terrenos (Normalized)
        // Formato: [name, farmerId, distrito_id, location, area, altitude, tipo_riego_id, productId, status]
        // Tipos de riego: Secano=1, Gravedad=2, Goteo=3, Aspersión=4
        const lands = [
            ["Fundo El Roble", 1, 1, "Sector La Esperanza", 15.5, 800, 1, 1, "Activo"], // Tocache, Secano, CCN-51
            ["Parcela San José", 2, 3, "Sector El Río", 8.2, 650, 2, 2, "Activo"], // Juanjuí, Gravedad, Criollo
            ["Fundo La Colina", 3, 6, "Sector Alto Bonito", 45.0, 1200, 3, 3, "Activo"], // Rupa-Rupa, Goteo, ICS-95
            ["Parcela Los Cedros", 4, 9, "Sector Bajo", 12.0, 700, 1, 1, "Activo"], // Irazola, Secano, CCN-51
            ["Fundo Santa Rosa", 6, 4, "Sector Valle", 10.0, 900, 1, 1, "Activo"], // Bellavista, Secano, CCN-51
            ["Parcela El Sol", 7, 8, "Sector Montaña", 5.5, 1500, 1, 4, "Activo"], // Amarilis, Secano, Catimor
            ["Fundo Los Andes", 8, 10, "Sector Río", 20.0, 600, 2, 3, "Activo"], // Callería, Gravedad, ICS-95
            ["Parcela La Esperanza", 9, 5, "Sector Norte", 7.0, 850, 1, 2, "Activo"] // Moyobamba, Secano, Criollo
        ];
        const stmtLand = db.prepare("INSERT OR IGNORE INTO terrenos (name, farmerId, distrito_id, location, area, altitude, tipo_riego_id, productId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        lands.forEach(l => stmtLand.run(l));
        stmtLand.finalize();

        // 10. Entregas (Normalized - con soporte para cacao en baba)
        // Formato: [id, farmerId, landId, productId, product_state, weight_fresh, weight, conversion_factor, price_per_kg, total_payment, status, date, notes, warehouseId, location_detail]
        const deliveries = [
            ["#4589", 1, 1, 1, "seco", null, 150.00, null, 8.50, 1275.00, "Pendiente", "2024-11-25T10:30", "Cacao fresco", null, null],
            ["#4588", 2, 2, 2, "seco", null, 80.50, null, 8.50, 684.25, "En Calidad", "2024-11-25T09:15", "Buen aroma", null, null],
            ["#4587", 3, 3, 3, "seco", null, 500.00, null, 9.00, 4500.00, "Almacenado", "2024-11-24T16:45", "Lote grande", 1, "Estante A"],
            ["#4586", 4, 4, 1, "seco", null, 200.00, null, 8.80, 1760.00, "Completado", "2024-11-23T14:20", "Pago realizado", 1, "Estante B"],
            ["#4590", 6, 5, 1, "seco", null, 120.00, null, null, null, "Pendiente", "2024-11-26T08:00", "Recién cosechado", null, null],
            ["#4591", 8, 7, 3, "baba", 300.00, 114.00, 0.38, null, null, "Pendiente", "2024-11-26T09:30", "Cacao en baba fresco", null, null],
            ["#4592", 9, 8, 2, "seco", null, 90.00, null, null, null, "En Calidad", "2024-11-26T10:15", "Posible humedad alta", null, null],
            ["#4593", 1, 1, 1, "seco", null, 180.00, null, 12.00, 2160.00, "Almacenado", "2024-11-22T11:00", "Calidad Premium", 2, "Secadora A"],
            ["#4594", 2, 2, 2, "seco", null, 60.00, null, 5.00, 300.00, "Rechazado", "2024-11-22T14:00", "Exceso de moho", null, null],
            ["#4595", 3, 3, 3, "baba", 1184.21, 450.00, 0.38, 10.00, 4500.00, "Completado", "2024-11-21T15:30", "Cacao en baba - Estándar", 1, "Estante C"]
        ];
        const stmtDel = db.prepare("INSERT OR IGNORE INTO entregas (id, farmerId, landId, productId, product_state, weight_fresh, weight, conversion_factor, price_per_kg, total_payment, status, date, notes, warehouseId, location_detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        deliveries.forEach(d => stmtDel.run(d));
        stmtDel.finalize();

        // 11. Precios (Quality Pricing)
        const prices = [
            ["Premium", 12.00],
            ["Estándar", 9.00],
            ["Regular", 7.00],
            ["Bajo", 5.00]
        ];
        const stmtPrice = db.prepare("INSERT OR IGNORE INTO precios (quality, price) VALUES (?, ?)");
        prices.forEach(pr => stmtPrice.run(pr));
        stmtPrice.finalize();

        // 12. Pagos (Payments)
        // Formato: [deliveryId, amount, date, method, reference, status]
        const payments = [
            ["#4586", 1760.00, "2024-11-23T15:30", "Transferencia", "TRF-2024-001", "Completado"],
            ["#4595", 4500.00, "2024-11-21T16:00", "Transferencia", "TRF-2024-002", "Completado"],
            ["#4593", 2160.00, "2024-11-22T12:00", "Efectivo", "EFE-2024-001", "Completado"],
            ["#4587", 4500.00, "2024-11-24T17:30", "Yape", "YAP-2024-001", "Completado"],
            ["#4588", 684.25, "2024-11-25T10:00", "Transferencia", "TRF-2024-003", "Completado"]
        ];
        const stmtPayment = db.prepare("INSERT OR IGNORE INTO pagos (deliveryId, amount, date, method, reference, status) VALUES (?, ?, ?, ?, ?, ?)");
        payments.forEach(p => stmtPayment.run(p));
        stmtPayment.finalize();

        console.log("✅ Datos normalizados (3FN) insertados correctamente.");
    });
}, 1000); // Small delay to ensure DB init
