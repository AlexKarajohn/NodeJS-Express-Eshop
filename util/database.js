const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: 'q12wq12wq!@WQ!@WQ',
    
});

module.exports = pool.promise();