
const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

router.get('/privada', verifyToken, (req, res) => {
  res.json({ message: `Bienvenido ${req.user.email}, accediste a una ruta protegida.` });
});

module.exports = router;
