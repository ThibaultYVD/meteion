require("dotenv").config();
const mysql = require("mysql");

module.exports = async() =>{
  let db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset : 'utf8mb4',
  });

  return db;
}