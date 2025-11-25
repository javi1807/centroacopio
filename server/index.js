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
    const { name, document, phone, zone, status } = req.body;
    const sql = "INSERT INTO farmers (name, document, phone, zone, status) VALUES (?,?,?,?,?)";
    const params = [name, document, phone, zone, status];

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
    db.all("SELECT * FROM lands", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "data": rows });
    });
});

// POST New Land
app.post('/api/lands', (req, res) => {
    const { name, farmerId, farmer, location, area, crop, status } = req.body;
    const sql = "INSERT INTO lands (name, farmerId, farmer, location, area, crop, status) VALUES (?,?,?,?,?,?,?)";
    const params = [name, farmerId, farmer, location, area, crop, status];

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

// GET All Deliveries
app.get('/api/deliveries', (req, res) => {
    db.all("SELECT * FROM deliveries ORDER BY date DESC", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "data": rows });
    });
});

// POST New Delivery
app.post('/api/deliveries', (req, res) => {
    const { farmerId, farmer, product, weight, date, notes } = req.body;
    const id = `#${Math.floor(Math.random() * 10000)}`;
    const status = 'Pendiente';

    const sql = "INSERT INTO deliveries (id, farmerId, farmer, product, weight, status, date, notes) VALUES (?,?,?,?,?,?,?,?)";
    const params = [id, farmerId, farmer, product, weight, status, date, notes];

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
