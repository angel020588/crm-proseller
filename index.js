const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - agregar aquí las rutas cuando las muevas
app.get('/api/ping', (req, res) => {
  res.json({ 
    message: 'CRM ProSeller API funcionando',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date()
  });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Catch all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor CRM ejecutándose en puerto ${PORT}`);
});