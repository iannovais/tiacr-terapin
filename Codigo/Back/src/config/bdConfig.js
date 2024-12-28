require('dotenv').config(); 

const mysql = require('mysql');

var db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

function encerrarPool() {
    console.log('Tentando encerrar o pool de conexões...');
    db.end((err) => {
        if (err) {
            console.error('Erro ao encerrar o pool de conexões:', err);
        } else {
            console.log('Pool de conexões encerrado.');
        }
    });
}

module.exports ={
    db,
    encerrarPool
};
