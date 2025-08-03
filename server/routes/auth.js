
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { User, Role } = require("../models");

// Registro
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, roleName = "vendedor" } = req.body;

    // Validaciones básicas
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password y name son requeridos" });
    }

    // Buscar el rol
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ message: "Rol no válido" });
    }

    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      roleId: role.id,
    });

    // Generar token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email,
        roleId: role.id,
        roleName: role.name 
      },
      process.env.JWT_SECRET || "tu_jwt_secret_aqui",
      { expiresIn: "7d" }
    );

    res.status(201).json({ 
      message: "Usuario registrado exitosamente",
      token, 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        role: role.name,
        roleDisplayName: role.displayName
      } 
    });

  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y password son requeridos" });
    }

    // Buscar usuario con rol
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Role, as: 'Role' }]
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        roleId: user.roleId,
        roleName: user.Role?.name || 'vendedor'
      },
      process.env.JWT_SECRET || "tu_jwt_secret_aqui",
      { expiresIn: "7d" }
    );

    res.json({ 
      message: "Login exitoso",
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.Role?.name || 'vendedor',
        roleDisplayName: user.Role?.displayName || 'Vendedor',
        permissions: user.Role?.permissions || {}
      } 
    });

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Verificar token
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: "Token requerido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tu_jwt_secret_aqui");
    
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'Role' }]
    });

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.Role?.name || 'vendedor',
        roleDisplayName: user.Role?.displayName || 'Vendedor',
        permissions: user.Role?.permissions || {}
      } 
    });

  } catch (error) {
    console.error("❌ Error verificando token:", error);
    res.status(401).json({ message: "Token inválido" });
  }
});

// Ruta para recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El email es requerido' });
    }

    // Buscar el usuario
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({ message: 'Si el correo existe, recibirás un enlace de recuperación' });
    }

    // Generar token temporal (en producción, usar JWT con expiración)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Aquí normalmente guardarías el token en la base de datos con expiración
    // y enviarías un email real. Por ahora solo logueamos
    console.log(`🔑 Token de recuperación para ${email}: ${resetToken}`);
    console.log(`📧 Enlace de recuperación: http://localhost:3000/reset-password?token=${resetToken}&email=${email}`);

    res.json({ 
      message: 'Si el correo existe, recibirás un enlace de recuperación',
      // En desarrollo, mostrar el token
      ...(process.env.NODE_ENV === 'development' && { resetToken, email })
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
