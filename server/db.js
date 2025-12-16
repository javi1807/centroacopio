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
  // ===== TABLAS DE REFERENCIA (3FN) =====

  // Tipos de Documento
  db.run(`CREATE TABLE IF NOT EXISTS tipos_documento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    descripcion TEXT
  )`);

  // Departamentos
  db.run(`CREATE TABLE IF NOT EXISTS departamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL
  )`);

  // Provincias
  db.run(`CREATE TABLE IF NOT EXISTS provincias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    departamento_id INTEGER NOT NULL,
    FOREIGN KEY(departamento_id) REFERENCES departamentos(id),
    UNIQUE(nombre, departamento_id)
  )`);

  // Distritos
  db.run(`CREATE TABLE IF NOT EXISTS distritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    provincia_id INTEGER NOT NULL,
    FOREIGN KEY(provincia_id) REFERENCES provincias(id),
    UNIQUE(nombre, provincia_id)
  )`);

  // Tipos de Riego
  db.run(`CREATE TABLE IF NOT EXISTS tipos_riego (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL
  )`);

  // Productos Table
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    variety TEXT,
    status TEXT DEFAULT 'Activo'
  )`);

  // ===== TABLAS PRINCIPALES (NORMALIZADAS) =====

  // Agricultores Table (Normalized)
  db.run(`CREATE TABLE IF NOT EXISTS agricultores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    document TEXT NOT NULL,
    tipo_documento_id INTEGER,
    phone TEXT,
    distrito_id INTEGER,
    zone TEXT,
    status TEXT DEFAULT 'Activo',
    deliveries INTEGER DEFAULT 0,
    FOREIGN KEY(distrito_id) REFERENCES distritos(id),
    FOREIGN KEY(tipo_documento_id) REFERENCES tipos_documento(id)
  )`);

  // Terrenos Table (Normalized)
  db.run(`CREATE TABLE IF NOT EXISTS terrenos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    farmerId INTEGER NOT NULL,
    distrito_id INTEGER,
    location TEXT,
    area REAL,
    altitude REAL,
    tipo_riego_id INTEGER,
    productId INTEGER,
    status TEXT DEFAULT 'Activo',
    FOREIGN KEY(farmerId) REFERENCES agricultores(id),
    FOREIGN KEY(distrito_id) REFERENCES distritos(id),
    FOREIGN KEY(tipo_riego_id) REFERENCES tipos_riego(id),
    FOREIGN KEY(productId) REFERENCES productos(id)
  )`);

  // Entregas Table (Normalized) - Con soporte para cacao en baba
  db.run(`CREATE TABLE IF NOT EXISTS entregas (
    id TEXT PRIMARY KEY,
    farmerId INTEGER NOT NULL,
    landId INTEGER,
    productId INTEGER,
    product_state TEXT DEFAULT 'seco' CHECK(product_state IN ('baba', 'seco')),
    weight_fresh REAL,
    weight REAL NOT NULL,
    conversion_factor REAL DEFAULT 0.38,
    price_per_kg REAL,
    total_payment REAL,
    status TEXT DEFAULT 'Pendiente',
    date TEXT NOT NULL,
    notes TEXT,
    warehouseId INTEGER,
    location_detail TEXT,
    FOREIGN KEY(farmerId) REFERENCES agricultores(id),
    FOREIGN KEY(landId) REFERENCES terrenos(id),
    FOREIGN KEY(productId) REFERENCES productos(id),
    FOREIGN KEY(warehouseId) REFERENCES almacenes(id)
  )`);

  // Almacenes Table
  db.run(`CREATE TABLE IF NOT EXISTS almacenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    capacity REAL,
    location TEXT,
    status TEXT DEFAULT 'Activo'
  )`);

  // Precios Table
  db.run(`CREATE TABLE IF NOT EXISTS precios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quality TEXT UNIQUE NOT NULL,
    price REAL NOT NULL
  )`);

  // Pagos Table
  db.run(`CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deliveryId TEXT,
    amount REAL,
    date TEXT,
    method TEXT,
    reference TEXT,
    status TEXT DEFAULT 'Completado',
    FOREIGN KEY(deliveryId) REFERENCES entregas(id)
  )`);


  // ===== ÍNDICES PARA OPTIMIZACIÓN DE QUERIES =====

  // Índices para agricultores
  db.run(`CREATE INDEX IF NOT EXISTS idx_agricultores_status ON agricultores(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_agricultores_distrito ON agricultores(distrito_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_agricultores_document ON agricultores(document)`);

  // Índices para terrenos
  db.run(`CREATE INDEX IF NOT EXISTS idx_terrenos_farmer ON terrenos(farmerId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_terrenos_status ON terrenos(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_terrenos_product ON terrenos(productId)`);

  // Índices para entregas (crítico para rendimiento)
  db.run(`CREATE INDEX IF NOT EXISTS idx_entregas_farmer ON entregas(farmerId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_entregas_status ON entregas(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_entregas_date ON entregas(date DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_entregas_warehouse ON entregas(warehouseId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_entregas_product ON entregas(productId)`);

  // Índices para pagos
  db.run(`CREATE INDEX IF NOT EXISTS idx_pagos_delivery ON pagos(deliveryId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_pagos_date ON pagos(date DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_pagos_status ON pagos(status)`);

  // Índices para almacenes
  db.run(`CREATE INDEX IF NOT EXISTS idx_almacenes_status ON almacenes(status)`);

  // Seeding is now handled by seed.js
});

module.exports = db;
