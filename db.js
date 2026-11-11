// npm i mysql2
// MYSQL2
const mysql = require("mysql2/promise")
const pool = mysql.createPool({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "", // nos pcs da escola, senha "escola"
    database: "2DSB"
})
module.exports = Object.freeze({
    pool: pool
})