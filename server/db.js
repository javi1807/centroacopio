const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'agrosync.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  // Farmers Table
  db.run(`CREATE TABLE IF NOT EXISTS farmers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    document TEXT NOT NULL,
    phone TEXT,
    zone TEXT,
    status TEXT DEFAULT 'Activo',
    deliveries INTEGER DEFAULT 0
  )`);

  // Lands Table
  db.run(`CREATE TABLE IF NOT EXISTS lands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    farmerId INTEGER,
    location TEXT,
    area REAL,
    crop TEXT,
    status TEXT DEFAULT 'Activo',
    FOREIGN KEY(farmerId) REFERENCES farmers(id)
  )`);

  // Deliveries Table
  db.run(`CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY,
    farmerId INTEGER,
    product TEXT,
    weight REAL,
    price_per_kg REAL,
    total_payment REAL,
    status TEXT DEFAULT 'Pendiente',
    date TEXT,
    notes TEXT,
    warehouseId INTEGER,
    location_detail TEXT,
    FOREIGN KEY(farmerId) REFERENCES farmers(id),
    FOREIGN KEY(warehouseId) REFERENCES warehouses(id)
  )`);

  // Warehouses Table
  db.run(`CREATE TABLE IF NOT EXISTS warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    capacity REAL,
    location TEXT,
    status TEXT DEFAULT 'Activo'
  )`);

  // Prices Table
  db.run(`CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quality TEXT UNIQUE NOT NULL,
    price REAL NOT NULL
  )`);

  // Payments Table
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deliveryId TEXT,
    amount REAL,
    date TEXT,
    method TEXT,
    reference TEXT,
    status TEXT DEFAULT 'Completado',
    FOREIGN KEY(deliveryId) REFERENCES deliveries(id)
  )`);

  // Migration: Add warehouseId to deliveries if not exists
  db.run("ALTER TABLE deliveries ADD COLUMN warehouseId INTEGER", (err) => {
    if (err && !err.message.includes("duplicate column name")) { }
  });

  // Migration: Add location_detail to deliveries if not exists
  db.run("ALTER TABLE deliveries ADD COLUMN location_detail TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) { }
  });

  // Migration: Add price_per_kg to deliveries if not exists
  db.run("ALTER TABLE deliveries ADD COLUMN price_per_kg REAL", (err) => {
    if (err && !err.message.includes("duplicate column name")) { }
  });

  // Migration: Add total_payment to deliveries if not exists
  db.run("ALTER TABLE deliveries ADD COLUMN total_payment REAL", (err) => {
    if (err && !err.message.includes("duplicate column name")) { }
  });

  // Migration: Add Peru-specific fields to farmers
  const farmerColumns = ['document_type', 'department', 'province', 'district'];
  farmerColumns.forEach(col => {
    db.run(`ALTER TABLE farmers ADD COLUMN ${col} TEXT`, (err) => {
      if (err && !err.message.includes("duplicate column name")) { }
    });
  });

  // Migration: Add Peru-specific fields to lands
  const landColumns = ['altitude', 'irrigation_type', 'cacao_variety'];
  landColumns.forEach(col => {
    db.run(`ALTER TABLE lands ADD COLUMN ${col} TEXT`, (err) => {
      if (err && !err.message.includes("duplicate column name")) { }
    });
  });

  // Seed Data
  db.get("SELECT count(*) as count FROM farmers", (err, row) => {
    if (row.count < 15) { // Increased threshold to ensure seeding runs
      console.log("Seeding database with comprehensive Peru test data...");

      // Farmers
      const farmers = [
        ["Juan Pérez", "12345678", "DNI", "987654321", "San Martín", "Tocache", "Tocache", "Activo", 45],
        ["María García", "23456789", "DNI", "987654322", "San Martín", "Mariscal Cáceres", "Juanjuí", "Activo", 32],
        ["Cooperativa Agraria", "20123456789", "RUC", "012345678", "Huánuco", "Leoncio Prado", "Rupa-Rupa", "Activo", 120],
        ["Carlos López", "34567890", "DNI", "987654323", "Ucayali", "Padre Abad", "Irazola", "Activo", 28],
        ["Ana Martínez", "45678901", "DNI", "987654324", "San Martín", "Tocache", "Uchiza", "Inactivo", 15],
        ["Pedro Castillo", "56789012", "DNI", "987654325", "San Martín", "Bellavista", "Bellavista", "Activo", 10],
        ["Sofia Ramirez", "67890123", "DNI", "987654326", "Huánuco", "Huánuco", "Amarilis", "Activo", 5],
        ["Miguel Torres", "78901234", "DNI", "987654327", "Ucayali", "Coronel Portillo", "Callería", "Activo", 60],
        ["Lucia Fernandez", "89012345", "DNI", "987654328", "San Martín", "Moyobamba", "Moyobamba", "Activo", 22],
        ["Jorge Ruiz", "90123456", "DNI", "987654329", "Huánuco", "Leoncio Prado", "Castillo Grande", "Activo", 18]
      ];
      const stmtFarmer = db.prepare("INSERT INTO farmers (name, document, document_type, phone, department, province, district, status, deliveries) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
      farmers.forEach(f => stmtFarmer.run(f));
      stmtFarmer.finalize();

      // Lands
      const lands = [
        ["Fundo El Roble", 1, "Sector La Esperanza", 15.5, "Cacao", 800, "Secano", "CCN-51", "Activo"],
        ["Parcela San José", 2, "Sector El Río", 8.2, "Cacao", 650, "Gravedad", "Criollo", "Activo"],
        ["Fundo La Colina", 3, "Sector Alto Bonito", 45.0, "Cacao", 1200, "Goteo", "ICS-95", "Activo"],
        ["Parcela Los Cedros", 4, "Sector Bajo", 12.0, "Cacao", 700, "Secano", "CCN-51", "Activo"],
        ["Fundo Santa Rosa", 6, "Sector Valle", 10.0, "Cacao", 900, "Secano", "CCN-51", "Activo"],
        ["Parcela El Sol", 7, "Sector Montaña", 5.5, "Café", 1500, "Secano", "Catimor", "Activo"],
        ["Fundo Los Andes", 8, "Sector Río", 20.0, "Cacao", 600, "Gravedad", "ICS-95", "Activo"],
        ["Parcela La Esperanza", 9, "Sector Norte", 7.0, "Cacao", 850, "Secano", "Criollo", "Activo"]
      ];
      const stmtLand = db.prepare("INSERT INTO lands (name, farmerId, location, area, crop, altitude, irrigation_type, cacao_variety, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
      lands.forEach(l => stmtLand.run(l));
      stmtLand.finalize();

      // Deliveries
      // Note: warehouseId 1 = Bodega Principal, 2 = Secadora Solar A, 3 = Almacén de Insumos
      const deliveries = [
        ["#4589", 1, "Cacao", 150.00, 8.50, 1275.00, "Pendiente", "2024-11-25T10:30", "Cacao fresco", null, null],
        ["#4588", 2, "Cacao", 80.50, 8.50, 684.25, "En Calidad", "2024-11-25T09:15", "Buen aroma", null, null],
        ["#4587", 3, "Cacao", 500.00, 9.00, 4500.00, "Almacenado", "2024-11-24T16:45", "Lote grande", 1, "Estante A"],
        ["#4586", 4, "Cacao", 200.00, 8.80, 1760.00, "Completado", "2024-11-23T14:20", "Pago realizado", 1, "Estante B"],
        ["#4590", 6, "Cacao", 120.00, null, null, "Pendiente", "2024-11-26T08:00", "Recién cosechado", null, null],
        ["#4591", 8, "Cacao", 300.00, null, null, "Pendiente", "2024-11-26T09:30", "Lote mixto", null, null],
        ["#4592", 9, "Cacao", 90.00, null, null, "En Calidad", "2024-11-26T10:15", "Posible humedad alta", null, null],
        ["#4593", 1, "Cacao", 180.00, 12.00, 2160.00, "Almacenado", "2024-11-22T11:00", "Calidad Premium", 2, "Secadora A"],
        ["#4594", 2, "Cacao", 60.00, 5.00, 300.00, "Rechazado", "2024-11-22T14:00", "Exceso de moho", null, null],
        ["#4595", 3, "Cacao", 450.00, 10.00, 4500.00, "Completado", "2024-11-21T15:30", "Estándar", 1, "Estante C"]
      ];
      const stmtDel = db.prepare("INSERT INTO deliveries (id, farmerId, product, weight, price_per_kg, total_payment, status, date, notes, warehouseId, location_detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      deliveries.forEach(d => stmtDel.run(d));
      stmtDel.finalize();
    }
  });

  // Seed Prices (only if empty)
  db.get("SELECT count(*) as count FROM prices", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO prices (quality, price) VALUES (?, ?)");
      stmt.run("Premium", 12.00);
      stmt.run("Estándar", 10.00);
      stmt.run("Básica", 8.00);
      stmt.run("Deficiente", 5.00);
      stmt.finalize();
    }
  });

  // Seed Warehouses (only if empty)
  db.get("SELECT count(*) as count FROM warehouses", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO warehouses (name, type, capacity, location, status) VALUES (?, ?, ?, ?, ?)");
      stmt.run("Bodega Principal", "Centro de Acopio", 5000, "Sector Central", "Activo");
      stmt.run("Secadora Solar A", "Secado", 2000, "Patio Norte", "Activo");
      stmt.run("Almacén de Insumos", "Insumos", 1000, "Sector Sur", "Activo");
      stmt.finalize();
    }
  });

  // Seed Payments (only if empty)
  db.get("SELECT count(*) as count FROM payments", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO payments (deliveryId, amount, date, method, reference, status) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run("#4586", 1760.00, "2024-11-23T15:00", "Transferencia", "TRX-889900", "Completado");
      stmt.run("#4595", 4500.00, "2024-11-21T16:00", "Cheque", "CHQ-00123", "Completado");
      stmt.finalize();
    }
  });

});

module.exports = db;
