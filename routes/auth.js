const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");

const router = express.Router();

// Ruta de registro
router.post("/register", async (req, res) => {
  console.log("📝 Intentando registrar usuario:", req.body);
  const { name, email, password, roleName = "usuario" } = req.body;

  // Validar campos requeridos
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Buscar el rol
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ message: "Rol no válido" });
    }

    // Crear el usuario
    const user = await User.create({
      name,
      email,
      password,
      roleId: role.id,
      isActive: true
    });

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "clave-demo",
      { expiresIn: "2h" }
    );

    res.status(201).json({ 
      message: "Usuario creado exitosamente", 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId
      }
    });

  } catch (err) {
    console.error("❌ Error en /register:", err);
    res.status(500).json({ message: "Error al crear el usuario" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "clave-demo",
      {
        expiresIn: "2h",
      },
    );

    res.json({ token, user });
  } catch (err) {
    console.error("❌ Error en /login:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
