const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:    parseInt(process.env.DB_PORT)    || 3306,
  database:         process.env.DB_NAME,
  user:             process.env.DB_USER,
  password:         process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit:  10,
  timezone: 'Z',
});

// Verify connection on startup
pool.getConnection()
  .then(conn => { console.log('MySQL connected'); conn.release(); })
  .catch(err  => console.error('MySQL connection error:', err.message));

module.exports = pool;
