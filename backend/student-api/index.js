const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env if present
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Frontend directory (served statically)
const frontendDir = path.join(__dirname, '..', '..', 'frontend');

app.use(express.static(frontendDir));

// API router (mounted at /api)
const api = express.Router();
api.use(cors());
api.use(bodyParser.json());

// MySQL connection using environment variables (fallbacks provided)
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Mf1awot3fiC!',
  database: process.env.DB_NAME || 'studentdb',
  waitForConnections: true,
  connectionLimit: 10,
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
  } else {
    console.log('MySQL Connected!');
    connection.release();
  }
});

// API endpoints
api.get('/students', (req, res) => {
  const sql = 'SELECT * FROM students_final';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

api.get('/students/:id', (req, res) => {
  const sql = 'SELECT * FROM students_final WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

api.post('/students', (req, res) => {
  const { number_courses, time_study, Marks } = req.body;
  const sql = 'INSERT INTO students_final (number_courses, time_study, Marks) VALUES (?, ?, ?)';
  db.query(sql, [number_courses, time_study, Marks], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student added', id: results.insertId });
  });
});

api.put('/students/:id', (req, res) => {
  const { number_courses, time_study, Marks } = req.body;
  const sql = 'UPDATE students_final SET number_courses = ?, time_study = ?, Marks = ? WHERE id = ?';
  db.query(sql, [number_courses, time_study, Marks, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student updated' });
  });
});

api.delete('/students/:id', (req, res) => {
  const sql = 'DELETE FROM students_final WHERE id = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student deleted' });
  });
});

// Mount API under /api
app.use('/api', api);

// SPA fallback: serve index.html for all non-API GET requests
app.use((req, res, next) => {
  // Only serve the frontend for GET requests that are not API calls
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
