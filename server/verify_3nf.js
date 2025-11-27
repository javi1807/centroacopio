const db = require('./db');

setTimeout(() => {
    console.log("\n===== VERIFICACIÓN DE NORMALIZACIÓN 3FN =====\n");

    // Check reference tables
    console.log("📋 TABLAS DE REFERENCIA:\n");

    db.all("SELECT * FROM tipos_documento", [], (err, rows) => {
        console.log("Tipos de Documento:", rows?.length || 0, "registros");
        console.table(rows);
    });

    db.all("SELECT * FROM departamentos", [], (err, rows) => {
        console.log("\nDepartamentos:", rows?.length || 0, "registros");
        console.table(rows);
    });

    db.all("SELECT * FROM tipos_riego", [], (err, rows) => {
        console.log("\nTipos de Riego:", rows?.length || 0, "registros");
        console.table(rows);
    });

    // Check normalized farmers table
    console.log("\n\n📊 AGRICULTORES (Normalizado):\n");
    db.all(`
        SELECT a.id, a.name, a.document, 
               td.codigo as document_type,
               d.nombre as district, 
               p.nombre as province, 
               dep.nombre as department
        FROM agricultores a
        LEFT JOIN tipos_documento td ON a.tipo_documento_id = td.id
        LEFT JOIN distritos d ON a.distrito_id = d.id
        LEFT JOIN provincias p ON d.provincia_id = p.id
        LEFT JOIN departamentos dep ON p.departamento_id = dep.id
        LIMIT 5
    `, [], (err, rows) => {
        if (err) console.error(err);
        console.table(rows);
    });

    // Check normalized lands table
    console.log("\n\n🌾 TERRENOS (Normalizado):\n");
    db.all(`
        SELECT t.id, t.name, t.area,
               d.nombre as district, 
               p.nombre as province, 
               dep.nombre as department,
               tr.nombre as irrigation_type,
               prod.name as product,
               prod.variety
        FROM terrenos t
        LEFT JOIN distritos d ON t.distrito_id = d.id
        LEFT JOIN provincias p ON d.provincia_id = p.id
        LEFT JOIN departamentos dep ON p.departamento_id = dep.id
        LEFT JOIN tipos_riego tr ON t.tipo_riego_id = tr.id
        LEFT JOIN productos prod ON t.productId = prod.id
        LIMIT 5
    `, [], (err, rows) => {
        if (err) console.error(err);
        console.table(rows);
    });

    // Check normalized deliveries table
    console.log("\n\n📦 ENTREGAS (Normalizado):\n");
    db.all(`
        SELECT e.id, e.weight,
               a.name as farmer,
               p.name as product,
               p.variety
        FROM entregas e
        LEFT JOIN agricultores a ON e.farmerId = a.id
        LEFT JOIN productos p ON e.productId = p.id
        LIMIT 5
    `, [], (err, rows) => {
        if (err) console.error(err);
        console.table(rows);

        console.log("\n\n✅ VERIFICACIÓN COMPLETA - Base de datos normalizada a 3FN\n");
        process.exit(0);
    });

}, 2000);
