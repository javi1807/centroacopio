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
    farmer TEXT,
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
    farmer TEXT,
    product TEXT,
    weight REAL,
    status TEXT DEFAULT 'Pendiente',
    date TEXT,
    notes TEXT,
    FOREIGN KEY(farmerId) REFERENCES farmers(id)
  )`);

  // Seed Data (only if empty)
  db.get("SELECT count(*) as count FROM farmers", (err, row) => {
    if (row.count === 0) {
      console.log("Seeding database...");
      const stmt = db.prepare("INSERT INTO farmers (name, document, phone, zone, status, deliveries) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run("Juan Pérez", "12345678", "555-0101", "Norte", "Activo", 45);
      stmt.run("María García", "23456789", "555-0102", "Sur", "Activo", 32);
      stmt.run("Carlos López", "34567890", "555-0103", "Este", "Activo", 28);
      stmt.run("Ana Martínez", "45678901", "555-0104", "Oeste", "Inactivo", 15);
      stmt.finalize();

      const landStmt = db.prepare("INSERT INTO lands (name, farmerId, farmer, location, area, crop, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
      landStmt.run("El Roble", 1, "Juan Pérez", "Vereda La Esperanza", 15.5, "Cacao", "Activo");
      landStmt.run("San José", 2, "María García", "Sector El Río", 8.2, "Cacao", "Activo");
      landStmt.run("La Colina", 3, "Carlos López", "Vereda Alto Bonito", 24.0, "Cacao", "Descanso");
      landStmt.finalize();

      const delStmt = db.prepare("INSERT INTO deliveries (id, farmerId, farmer, product, weight, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)");
      delStmt.run("#4589", 1, "Juan Pérez", "Cacao", 150.00, "Pendiente", "2024-11-25T10:30");
      delStmt.run("#4588", 2, "María García", "Cacao", 80.50, "En Calidad", "2024-11-25T09:15");
      delStmt.run("#4587", 3, "Carlos López", "Cacao", 200.00, "Almacenado", "2024-11-24T16:45");
      delStmt.finalize();
    }
  });
});

module.exports = db;
