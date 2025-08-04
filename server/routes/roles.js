const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/verifyToken");
const {
  crearRol,
  obtenerRoles,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol,
} = require("../controllers/rolesController");

// Crear nuevo rol
router.post("/crear", verifyToken, crearRol);

// Obtener todos los roles
router.get("/", verifyToken, obtenerRoles);

// Obtener un rol por ID
router.get("/:id", verifyToken, obtenerRolPorId);

// Actualizar un rol por ID
router.put("/:id", verifyToken, actualizarRol);

// Eliminar un rol por ID
router.delete("/:id", verifyToken, eliminarRol);

module.exports = router;
