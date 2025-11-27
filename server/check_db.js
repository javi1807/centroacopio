const db = require('./db');

setTimeout(() => {
    db.all("SELECT * FROM deliveries", [], (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Deliveries count:", rows.length);
            console.log(rows);
        }
    });
}, 1000);
