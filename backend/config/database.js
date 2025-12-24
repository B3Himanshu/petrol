import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Build connection config
const getConnectionConfig = () => {
  // If DATABASE_URL is provided, use it (but add SSL for Google Cloud SQL)
  if (process.env.DATABASE_URL) {
    // Check if it's a Google Cloud SQL connection (has IP address or cloud sql domain)
    const isCloudSQL = process.env.DATABASE_URL.includes('104.198.46.255') || 
                       process.env.DATABASE_URL.includes('cloudsql') ||
                       process.env.DATABASE_URL.includes('googleapis.com');
    
    // Remove sslmode from URL - we'll handle SSL programmatically
    // This prevents the URL parameter from overriding our SSL config
    let connectionString = process.env.DATABASE_URL;
    connectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
    
    return {
      connectionString: connectionString,
      // Google Cloud SQL requires SSL but we need to disable certificate verification
      ssl: isCloudSQL ? {
        rejectUnauthorized: false // Disable certificate verification for Google Cloud SQL
      } : false,
      // Connection pool settings
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased timeout for cloud connections
    };
  }
  
  // Otherwise use individual settings
  const isCloudSQL = process.env.DB_HOST && 
                     (process.env.DB_HOST.includes('104.198.46.255') || 
                      process.env.DB_HOST.includes('cloudsql') ||
                      process.env.DB_HOST !== 'localhost');
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'petroleum_db',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Google Cloud SQL requires SSL
    ssl: isCloudSQL ? {
      rejectUnauthorized: false // Disable certificate verification for Google Cloud SQL
    } : false,
    // Connection pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased timeout for cloud connections
  };
};

// Create connection pool
const pool = new Pool(getConnectionConfig());

// Test database connection
pool.on('connect', (client) => {
  console.log('✅ [Database] Client connected to database:', {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    timestamp: new Date().toISOString()
  });
});

pool.on('acquire', (client) => {
  console.log('🔌 [Database] Client acquired from pool:', {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  });
});

pool.on('remove', (client) => {
  console.log('🔌 [Database] Client removed from pool:', {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  });
});

pool.on('error', (err) => {
  console.error('❌ [Database] Unexpected error on idle client:', {
    error: err.message,
    code: err.code,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    console.log('🗄️ [Database] Executing query:', {
      query: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      fullQuery: text,
      params: params,
      paramCount: params?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('✅ [Database] Query executed successfully:', {
      duration: `${duration}ms`,
      rowCount: res.rowCount,
      hasData: res.rows.length > 0,
      sampleData: res.rows.length > 0 ? res.rows[0] : null,
      allRows: res.rows.length <= 5 ? res.rows : `${res.rows.length} rows (showing first 5)`,
      timestamp: new Date().toISOString()
    });
    
    return res;
  } catch (error) {
    console.error('❌ [Database] Query error:', {
      error: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      query: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      params: params,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

// Get database connection pool
export const getPool = () => pool;

// Close database connection
export const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

export default pool;

