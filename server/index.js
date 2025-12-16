require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const db = require('./db');
const { errorHandler } = require('./middleware/errorHandler');
require('./seed'); // Run seeding logic

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===== HELPER FUNCTIONS =====

// Get location hierarchy from distrito_id
function getLocationHierarchy(distritoId, callback) {
    const sql = `
        SELECT d.nombre as district, p.nombre as province, dep.nombre as department
        FROM distritos d
        LEFT JOIN provincias p ON d.provincia_id = p.id
        LEFT JOIN departamentos dep ON p.departamento_id = dep.id
        WHERE d.id = ?
    `;
    db.get(sql, [distritoId], callback);
}

// Find distrito_id from department/province/district names
function findDistritoId(department, province, district, callback) {
    const sql = `
        SELECT d.id
        FROM distritos d
        LEFT JOIN provincias p ON d.provincia_id = p.id
        LEFT JOIN departamentos dep ON p.departamento_id = dep.id
        WHERE dep.nombre = ? AND p.nombre = ? AND d.nombre = ?
    `;
    db.get(sql, [department, province, district], callback);
}

// Find tipo_documento_id from code
function findTipoDocumentoId(codigo, callback) {
    db.get("SELECT id FROM tipos_documento WHERE codigo = ?", [codigo], callback);
}

// Find tipo_riego_id from name
function findTipoRiegoId(nombre, callback) {
    db.get("SELECT id FROM tipos_riego WHERE nombre = ?", [nombre], callback);
}

// GET All Farmers
app.get('/api/farmers', (req, res) => {
    db.all("SELECT * FROM agricultores", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "data": rows });
    });
});

// POST New Farmer
app.post('/api/farmers', (req, res) => {
    const { name, document, document_type, phone, zone, department, province, district, status } = req.body;

    // Find IDs for tipo_documento and distrito
    findTipoDocumentoId(document_type, (err, tipoDoc) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        findDistritoId(department, province, district, (err, dist) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            const sql = "INSERT INTO agricultores (name, document, tipo_documento_id, phone, zone, distrito_id, status) VALUES (?,?,?,?,?,?,?)";
            const params = [name, document, tipoDoc?.id, phone, zone, dist?.id, status];

            db.run(sql, params, function (err, result) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": { id: this.lastID, ...req.body, deliveries: 0 }
                });
            });
        });
    });
});

// PUT Update Farmer
app.put('/api/farmers/:id', (req, res) => {
    const { name, document, document_type, phone, zone, department, province, district, status } = req.body;

    // Find IDs for tipo_documento and distrito
    findTipoDocumentoId(document_type, (err, tipoDoc) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        findDistritoId(department, province, district, (err, dist) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            db.run(
                `UPDATE agricultores set 
                   name = COALESCE(?,name), 
                   document = COALESCE(?,document), 
                   tipo_documento_id = COALESCE(?,tipo_documento_id),
                   phone = COALESCE(?,phone), 
                   zone = COALESCE(?,zone), 
                   distrito_id = COALESCE(?,distrito_id),
                   status = COALESCE(?,status) 
                   WHERE id = ?`,
                [name, document, tipoDoc?.id, phone, zone, dist?.id, status, req.params.id],
                function (err, result) {
                    if (err) {
                        res.status(400).json({ "error": err.message })
                        return;
                    }
                    res.json({
                        message: "success",
                        data: req.body,
                        changes: this.changes
                    })
                });
        });
    });
});

// DELETE Farmer
app.delete('/api/farmers/:id', (req, res) => {
    db.run(
        'DELETE FROM agricultores WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", changes: this.changes })
        });
});

// GET All Lands (with location and irrigation data)
app.get('/api/lands', (req, res) => {
    const sql = `
        SELECT t.*, 
               productos.name as cropName, 
               productos.variety as cropVariety,
               d.nombre as district, 
               p.nombre as province, 
               dep.nombre as department,
               tr.nombre as irrigation_type,
               productos.variety as cacao_variety
        FROM terrenos t
        LEFT JOIN productos ON t.productId = productos.id
        LEFT JOIN distritos d ON t.distrito_id = d.id
        LEFT JOIN provincias p ON d.provincia_id = p.id
        LEFT JOIN departamentos dep ON p.departamento_id = dep.id
        LEFT JOIN tipos_riego tr ON t.tipo_riego_id = tr.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        const data = rows.map(row => ({
            ...row,
            crop: row.cropName ? `${row.cropName} ${row.cropVariety || ''}`.trim() : null
        }));
        res.json({ "data": data });
    });
});

// POST New Land
app.post('/api/lands', (req, res) => {
    const { name, farmerId, location, area, productId, altitude, irrigation_type, cacao_variety, status, department, province, district } = req.body;

    // Find IDs for distrito and tipo_riego
    findDistritoId(department, province, district, (err, dist) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        findTipoRiegoId(irrigation_type, (err, tipoRiego) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            const sql = "INSERT INTO terrenos (name, farmerId, location, area, productId, altitude, tipo_riego_id, distrito_id, status) VALUES (?,?,?,?,?,?,?,?,?)";
            const params = [name, farmerId, location, area, productId, altitude, tipoRiego?.id, dist?.id, status];

            db.run(sql, params, function (err, result) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": { id: this.lastID, ...req.body }
                });
            });
        });
    });
});

// PUT Update Land
app.put('/api/lands/:id', (req, res) => {
    const { name, location, area, productId, altitude, irrigation_type, cacao_variety, status, department, province, district } = req.body;

    // Find IDs for distrito and tipo_riego
    findDistritoId(department, province, district, (err, dist) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        findTipoRiegoId(irrigation_type, (err, tipoRiego) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }

            db.run(
                `UPDATE terrenos set 
                   name = COALESCE(?,name), 
                   location = COALESCE(?,location), 
                   area = COALESCE(?,area), 
                   productId = COALESCE(?,productId), 
                   altitude = COALESCE(?,altitude),
                   tipo_riego_id = COALESCE(?,tipo_riego_id),
                   distrito_id = COALESCE(?,distrito_id),
                   status = COALESCE(?,status)
                   WHERE id = ?`,
                [name, location, area, productId, altitude, tipoRiego?.id, dist?.id, status, req.params.id],
                function (err, result) {
                    if (err) {
                        res.status(400).json({ "error": err.message })
                        return;
                    }
                    res.json({
                        message: "success",
                        data: req.body,
                        changes: this.changes
                    })
                });
        });
    });
});

// DELETE Land
app.delete('/api/lands/:id', (req, res) => {
    db.run(
        'DELETE FROM terrenos WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", changes: this.changes })
        });
});

// GET All Deliveries
app.get('/api/deliveries', (req, res) => {
    const sql = `
        SELECT entregas.*, agricultores.name as farmer, terrenos.name as landName, productos.name as product, productos.variety as productVariety, almacenes.name as warehouseName 
        FROM entregas 
        LEFT JOIN agricultores ON entregas.farmerId = agricultores.id 
        LEFT JOIN terrenos ON entregas.landId = terrenos.id
        LEFT JOIN productos ON entregas.productId = productos.id
        LEFT JOIN almacenes ON entregas.warehouseId = almacenes.id
        ORDER BY date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        // Construct storage_location string for frontend compatibility
        const data = rows.map(row => ({
            ...row,
            product: row.product ? `${row.product} ${row.productVariety || ''}`.trim() : row.product,
            storage_location: row.warehouseName ? `${row.warehouseName}${row.location_detail ? ` - ${row.location_detail}` : ''}` : null
        }));
        res.json({ "data": data });
    });
});

// --- Products Endpoints ---

// GET All Products
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "data": rows });
    });
});

// POST New Delivery (productId required, no 'product' text field)
app.post('/api/deliveries', (req, res) => {
    const { farmerId, landId, productId, product_state, weight, price_per_kg, total_payment, date, notes } = req.body;
    const id = `#${Math.floor(Math.random() * 10000)}`;
    const status = 'Pendiente';

    // Handle conversion for wet cocoa (baba)
    let weightDry, weightFresh, conversionFactor;

    if (product_state === 'baba') {
        // If baba, weight is the fresh weight
        weightFresh = weight;
        conversionFactor = 0.38;
        weightDry = weight * conversionFactor;  // Convert to dry
    } else {
        // If seco, weight is already dry weight
        weightDry = weight;
        weightFresh = null;
        conversionFactor = null;
    }

    const sql = "INSERT INTO entregas (id, farmerId, landId, productId, product_state, weight_fresh, weight, conversion_factor, price_per_kg, total_payment, status, date, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const params = [id, farmerId, landId, productId, product_state || 'seco', weightFresh, weightDry, conversionFactor, price_per_kg, total_payment, status, date, notes];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // Update farmer delivery count
        db.run("UPDATE agricultores SET deliveries = deliveries + 1 WHERE id = ?", [farmerId]);

        res.json({
            "message": "success",
            "data": { id, ...req.body, product_state: product_state || 'seco', weight_fresh: weightFresh, weight: weightDry, conversion_factor: conversionFactor, status }
        });
    });
});

// PUT Update Delivery
app.put('/api/deliveries/:id', (req, res) => {
    const { weight, status, notes, warehouseId, location_detail, price_per_kg, total_payment } = req.body;
    const id = decodeURIComponent(req.params.id);

    // Dynamic update query
    let updates = [];
    let params = [];

    if (status) { updates.push("status = ?"); params.push(status); }
    if (notes) { updates.push("notes = ?"); params.push(notes); }
    if (warehouseId !== undefined) { updates.push("warehouseId = ?"); params.push(warehouseId); }
    if (location_detail !== undefined) { updates.push("location_detail = ?"); params.push(location_detail); }
    if (weight) { updates.push("weight = ?"); params.push(weight); }
    if (price_per_kg) { updates.push("price_per_kg = ?"); params.push(price_per_kg); }
    if (total_payment) { updates.push("total_payment = ?"); params.push(total_payment); }

    if (updates.length === 0) {
        res.status(400).json({ "error": "No fields to update" });
        return;
    }

    params.push(id);
    const sql = `UPDATE entregas SET ${updates.join(", ")} WHERE id = ?`;

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: "success", changes: this.changes });
    });
});

// DELETE Delivery
app.delete('/api/deliveries/:id', (req, res) => {
    db.run(
        'DELETE FROM entregas WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", changes: this.changes })
        });
});

// --- Warehouses Endpoints ---

// GET All Warehouses
app.get('/api/warehouses', (req, res) => {
    db.all("SELECT * FROM almacenes", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "data": rows });
    });
});

// POST New Warehouse
app.post('/api/warehouses', (req, res) => {
    const { name, type, capacity, location, status } = req.body;
    const sql = "INSERT INTO almacenes (name, type, capacity, location, status) VALUES (?,?,?,?,?)";
    const params = [name, type, capacity, location, status];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, ...req.body }
        });
    });
});

// PUT Update Warehouse
app.put('/api/warehouses/:id', (req, res) => {
    const { name, type, capacity, location, status } = req.body;
    db.run(
        `UPDATE almacenes set 
           name = COALESCE(?,name), 
           type = COALESCE(?,type), 
           capacity = COALESCE(?,capacity), 
           location = COALESCE(?,location), 
           status = COALESCE(?,status) 
           WHERE id = ?`,
        [name, type, capacity, location, status, req.params.id],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({
                message: "success",
                data: req.body,
                changes: this.changes
            })
        });
});

// DELETE Warehouse
app.delete('/api/warehouses/:id', (req, res) => {
    db.run(
        'DELETE FROM almacenes WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", changes: this.changes })
        });
});


// --- Prices Endpoints ---

// GET All Prices
app.get('/api/prices', (req, res) => {
    db.all("SELECT * FROM precios", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "data": rows });
    });
});

// PUT Update Price
app.put('/api/prices', (req, res) => {
    const { quality, price } = req.body;
    db.run(
        `UPDATE precios set price = ? WHERE quality = ?`,
        [price, quality],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({
                message: "success",
                data: req.body,
                changes: this.changes
            })
        });
});

// --- Payments Endpoints ---

// GET All Payments
app.get('/api/payments', (req, res) => {
    const sql = `
        SELECT pagos.*, agricultores.name as farmerName, agricultores.id as farmerId
        FROM pagos 
        LEFT JOIN entregas ON pagos.deliveryId = entregas.id
        LEFT JOIN agricultores ON entregas.farmerId = agricultores.id 
        ORDER BY pagos.date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "data": rows });
    });
});

// POST New Payment
app.post('/api/payments', (req, res) => {
    const { deliveryId, amount, date, method, reference, status } = req.body;
    const sql = "INSERT INTO pagos (deliveryId, amount, date, method, reference, status) VALUES (?,?,?,?,?,?)";
    const params = [deliveryId, amount, date, method, reference, status || 'Completado'];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, ...req.body }
        });
    });
});

// DELETE Payment
app.delete('/api/payments/:id', (req, res) => {
    db.run(
        'DELETE FROM pagos WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", changes: this.changes })
        });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});
