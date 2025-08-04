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

// Ruta para recuperación de contraseña
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email es requerido" });
  }

  try {
    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({ message: "Si el email existe, se ha enviado un enlace de recuperación" });
    }

    // Por ahora solo simular el envío
    console.log(`📧 Enlace de recuperación solicitado para: ${email}`);
    
    res.json({ message: "Si el email existe, se ha enviado un enlace de recuperación" });

  } catch (error) {
    console.error("❌ Error en forgot-password:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Ruta para verificar token y obtener usuario actual
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "clave-demo");
    
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'Role' }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role?.name || 'usuario',
        permissions: user.Role?.permissions || [],
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("❌ Error en /me:", error);
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Ruta para cambiar contraseña
router.put("/change-password", async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "clave-demo");
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Contraseña actual y nueva son requeridas' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error("❌ Error en change-password:", error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
