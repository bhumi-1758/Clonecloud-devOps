const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'clonecloud',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Liveness probe
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Readiness probe
app.get('/readyz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send('Ready');
  } catch (error) {
    console.error('Readiness check failed:', error);
    res.status(503).send('Not Ready');
  }
});

app.get('/api/data', async (req, res) => {
  res.json({
    message: 'Hello from CloneCloud Backend!',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
