const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// --- API Endpoints ---

// GET All Farmers
app.get('/api/farmers', (req, res) => {
    db.all("SELECT * FROM farmers", [], (err, rows) => {
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
    const sql = "INSERT INTO farmers (name, document, document_type, phone, zone, department, province, district, status) VALUES (?,?,?,?,?,?,?,?,?)";
    const params = [name, document, document_type, phone, zone, department, province, district, status];

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

// PUT Update Farmer
app.put('/api/farmers/:id', (req, res) => {
    const { name, document, document_type, phone, zone, department, province, district, status } = req.body;
    db.run(
        `UPDATE farmers set 
           name = COALESCE(?,name), 
           document = COALESCE(?,document), 
           document_type = COALESCE(?,document_type),
           phone = COALESCE(?,phone), 
           zone = COALESCE(?,zone), 
           department = COALESCE(?,department),
           province = COALESCE(?,province),
           district = COALESCE(?,district),
           status = COALESCE(?,status) 
           WHERE id = ?`,
        [name, document, document_type, phone, zone, department, province, district, status, req.params.id],
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

// DELETE Farmer
app.delete('/api/farmers/:id', (req, res) => {
    db.run(
        'DELETE FROM farmers WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", changes: this.changes })
        });
});

// GET All Lands
app.get('/api/lands', (req, res) => {
    const sql = `
        SELECT lands.*, farmers.name as farmer 
        FROM lands 
        LEFT JOIN farmers ON lands.farmerId = farmers.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "data": rows });
    });
});

// POST New Land
app.post('/api/lands', (req, res) => {
    const { name, farmerId, location, area, crop, altitude, irrigation_type, cacao_variety, status } = req.body;
    const sql = "INSERT INTO lands (name, farmerId, location, area, crop, altitude, irrigation_type, cacao_variety, status) VALUES (?,?,?,?,?,?,?,?,?)";
    const params = [name, farmerId, location, area, crop, altitude, irrigation_type, cacao_variety, status];

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

// PUT Update Land
app.put('/api/lands/:id', (req, res) => {
    const { name, location, area, crop, altitude, irrigation_type, cacao_variety, status } = req.body;
    db.run(
        `UPDATE lands set 
           name = COALESCE(?,name), 
           location = COALESCE(?,location), 
           area = COALESCE(?,area), 
           crop = COALESCE(?,crop), 
           altitude = COALESCE(?,altitude),
           irrigation_type = COALESCE(?,irrigation_type),
           cacao_variety = COALESCE(?,cacao_variety),
           status = COALESCE(?,status) 
           WHERE id = ?`,
        [name, location, area, crop, altitude, irrigation_type, cacao_variety, status, req.params.id],
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

// DELETE Land
app.delete('/api/lands/:id', (req, res) => {
    db.run(
        'DELETE FROM lands WHERE id = ?',
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
        SELECT deliveries.*, farmers.name as farmer, warehouses.name as warehouseName 
        FROM deliveries 
        LEFT JOIN farmers ON deliveries.farmerId = farmers.id 
        LEFT JOIN warehouses ON deliveries.warehouseId = warehouses.id
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
            storage_location: row.warehouseName ? `${row.warehouseName}${row.location_detail ? ` - ${row.location_detail}` : ''}` : null
        }));
        res.json({ "data": data });
    });
});

// POST New Delivery
app.post('/api/deliveries', (req, res) => {
    const { farmerId, product, weight, price_per_kg, total_payment, date, notes } = req.body;
    const id = `#${Math.floor(Math.random() * 10000)}`;
    const status = 'Pendiente';

    const sql = "INSERT INTO deliveries (id, farmerId, product, weight, price_per_kg, total_payment, status, date, notes) VALUES (?,?,?,?,?,?,?,?,?)";
    const params = [id, farmerId, product, weight, price_per_kg, total_payment, status, date, notes];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // Update farmer delivery count
        db.run("UPDATE farmers SET deliveries = deliveries + 1 WHERE id = ?", [farmerId]);

        res.json({
            "message": "success",
            "data": { id, ...req.body, status }
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
    const sql = `UPDATE deliveries SET ${updates.join(", ")} WHERE id = ?`;

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
        'DELETE FROM deliveries WHERE id = ?',
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
    db.all("SELECT * FROM warehouses", [], (err, rows) => {
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
    const sql = "INSERT INTO warehouses (name, type, capacity, location, status) VALUES (?,?,?,?,?)";
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
        `UPDATE warehouses set 
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
        'DELETE FROM warehouses WHERE id = ?',
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
    db.all("SELECT * FROM prices", [], (err, rows) => {
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
        `UPDATE prices set price = ? WHERE quality = ?`,
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
        SELECT payments.*, farmers.name as farmerName, farmers.id as farmerId
        FROM payments 
        LEFT JOIN deliveries ON payments.deliveryId = deliveries.id
        LEFT JOIN farmers ON deliveries.farmerId = farmers.id 
        ORDER BY payments.date DESC
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
    const sql = "INSERT INTO payments (deliveryId, amount, date, method, reference, status) VALUES (?,?,?,?,?,?)";
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
        'DELETE FROM payments WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", changes: this.changes })
        });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
