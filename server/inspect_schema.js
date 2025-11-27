const db = require('./db');

db.serialize(() => {
    db.all("PRAGMA table_info(farmers)", (err, rows) => {
        console.log("Farmers Columns:", rows.map(r => r.name));
    });
    db.all("PRAGMA table_info(lands)", (err, rows) => {
        console.log("Lands Columns:", rows.map(r => r.name));
    });
    db.all("PRAGMA table_info(deliveries)", (err, rows) => {
        console.log("Deliveries Columns:", rows.map(r => r.name));
    });
    db.all("PRAGMA table_info(payments)", (err, rows) => {
        console.log("Payments Columns:", rows.map(r => r.name));
    });
});
