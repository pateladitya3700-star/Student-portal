const { Pool } = require('pg');
require('dotenv').config();
const dns = require('dns');

// Force IPv4 resolution
dns.setDefaultResultOrder('ipv4first');

// Determine SSL configuration
let sslConfig = false;
if (process.env.DB_SSL === 'true' || process.env.DATABASE_URL) {
  sslConfig = {
    rejectUnauthorized: false
  };
}

// Build pool config
let poolConfig = {
  max: 20,
  idleTimeoutMillis: 50000,
  connectionTimeoutMillis: 50000,  // Increased from 10s to 30s for Render
  keepAlives: true,
  keepAliveInitialDelayMillis: 10000,
  statement_timeout: 50000,  // Statement timeout
  query_timeout: 50000,      // Query timeout
};

// Add connection parameters
if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  poolConfig.ssl = sslConfig;
} else {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.user = process.env.DB_USER || 'postgres';
  poolConfig.password = process.env.DB_PASSWORD || '';
  poolConfig.database = process.env.DB_NAME || 'nic_portal';
  poolConfig.port = process.env.DB_PORT || 5432;
  poolConfig.ssl = sslConfig;
  poolConfig.family = 4;
}

const pool = new Pool(poolConfig);

// Test connection on first query, not on startup
let connectionTested = false;

pool.on('connect', () => {
  if (!connectionTested) {
    connectionTested = true;
    console.log('✓ Database connected successfully');
    console.log(`✓ Using ${process.env.DATABASE_URL ? 'Connection String (Pooler)' : 'Individual Parameters'}`);
  }
});

pool.on('error', (err) => {
  console.error('✗ Database connection error:', err.message);
});

module.exports = pool;
