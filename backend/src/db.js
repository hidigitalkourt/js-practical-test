/**
 * Sample code for conneting to MySQL/PostgreSQL/SQLite databases.
 */

/**
 * MySQL DB connection
 */
function mysqlDb() {
  const mysql = require('mysql');

  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#SuperS3creT!',
    database: 'bugs',
  });

  connection.connect();

  return connection;
}

/**
 * Postgres DB connection
 */
function postgresDb() {
  const pgp = require('pg-promise')(/* options */);

  return pgp('postgres://localhost/postgres');
}

/**
 * SQLite DB connection
 */
function sqliteDb() {
  const sqlite3 = require('sqlite3').verbose();
  return new sqlite3.Database('bugtracker.db');
}

module.exports = {
  mysqlDb,
  postgresDb,
  sqliteDb,
};
