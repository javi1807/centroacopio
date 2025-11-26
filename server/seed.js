const db = require('./db');

const farmers = [
    { name: "Roberto Gómez", document: "45612378", document_type: "DNI", phone: "987123456", zone: "San Martín", department: "San Martín", province: "Tocache", district: "Pólvora", status: "Activo" },
    { name: "Julia Chávez", document: "78945612", document_type: "DNI", phone: "987654123", zone: "Huánuco", department: "Huánuco", province: "Leoncio Prado", district: "José Crespo y Castillo", status: "Activo" },
    { name: "Asociación Los Pinos", document: "20456789123", document_type: "RUC", phone: "062567890", zone: "Ucayali", department: "Ucayali", province: "Padre Abad", district: "Neshuya", status: "Activo" },
    { name: "Miguel Ángel Torres", document: "12378945", document_type: "DNI", phone: "987987654", zone: "San Martín", department: "San Martín", province: "Mariscal Cáceres", district: "Campanilla", status: "Inactivo" },
    { name: "Elena Vasquez", document: "65432198", document_type: "DNI", phone: "987321654", zone: "Huánuco", department: "Huánuco", province: "Leoncio Prado", district: "Hermilio Valdizán", status: "Activo" }
];

const warehouses = [
    { name: "Almacén Norte", type: "Centro de Acopio", capacity: 3000, location: "Sector Norte", status: "Activo" },
    { name: "Secadora B", type: "Secado", capacity: 1500, location: "Patio Central", status: "Mantenimiento" }
];

// Wait a bit for DB initialization from the required module
setTimeout(() => {
    db.serialize(() => {
        console.log("Iniciando carga de datos adicionales...");

        // Insert Farmers
        const stmtFarmer = db.prepare("INSERT INTO farmers (name, document, document_type, phone, zone, department, province, district, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

        farmers.forEach(f => {
            stmtFarmer.run([f.name, f.document, f.document_type, f.phone, f.zone, f.department, f.province, f.district, f.status], function (err) {
                if (err) console.error("Error inserting farmer:", err.message);
                else {
                    const farmerId = this.lastID;
                    // Insert Land for this farmer
                    const landName = `Parcela ${f.name.split(' ')[0]}`;
                    db.run("INSERT INTO lands (name, farmerId, farmer, location, area, crop, altitude, irrigation_type, cacao_variety, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [landName, farmerId, f.name, f.district, (Math.random() * 20 + 5).toFixed(1), "Cacao", 800 + Math.floor(Math.random() * 500), "Secano", "CCN-51", "Activo"]);

                    // Insert Delivery for this farmer
                    if (f.status === 'Activo') {
                        const deliveryId = `#${Math.floor(Math.random() * 9000) + 1000}`;
                        db.run("INSERT INTO deliveries (id, farmerId, farmer, product, weight, status, date, notes, storage_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            [deliveryId, farmerId, f.name, "Cacao", (Math.random() * 500 + 50).toFixed(2), "Pendiente", new Date().toISOString(), "Entrega inicial", null]);

                        // Update farmer delivery count
                        db.run("UPDATE farmers SET deliveries = deliveries + 1 WHERE id = ?", [farmerId]);
                    }
                }
            });
        });
        stmtFarmer.finalize();

        // Insert Warehouses
        const stmtWarehouse = db.prepare("INSERT INTO warehouses (name, type, capacity, location, status) VALUES (?, ?, ?, ?, ?)");
        warehouses.forEach(w => {
            stmtWarehouse.run([w.name, w.type, w.capacity, w.location, w.status]);
        });
        stmtWarehouse.finalize();

        console.log("Datos adicionales insertados correctamente.");
    });
}, 1000); // Small delay to ensure DB init
