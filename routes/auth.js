const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { User, Role } = require("../models");

const router = express.Router();

// Configuración removida - sin verificación de email

// Validar email real
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const commonDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
  const domain = email.split('@')[1];
  return emailRegex.test(email) && commonDomains.includes(domain);
};

// Evaluar fuerza de contraseña
const evaluatePasswordStrength = (password) => {
  let score = 0;
  let feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push("Mínimo 8 caracteres");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Incluye minúsculas");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Incluye mayúsculas");

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push("Incluye números");

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push("Incluye símbolos");

  const strength = score <= 2 ? 'débil' : score <= 3 ? 'media' : score <= 4 ? 'fuerte' : 'muy fuerte';
  
  return { score, strength, feedback };
};

// Sistema de límites de intentos (en memoria - para producción usar Redis)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 15 * 60 * 1000; // 15 minutos

// Función para verificar intentos
const checkAttempts = (ip) => {
  const attempts = loginAttempts.get(ip);
  if (!attempts) return { allowed: true, remaining: MAX_ATTEMPTS };
  
  if (attempts.count >= MAX_ATTEMPTS) {
    const timeLeft = attempts.blockedUntil - Date.now();
    if (timeLeft > 0) {
      return { 
        allowed: false, 
        remaining: 0, 
        blockedUntil: new Date(attempts.blockedUntil),
        timeLeft: Math.ceil(timeLeft / 60000) // minutos
      };
    } else {
      // Reset después del bloqueo
      loginAttempts.delete(ip);
      return { allowed: true, remaining: MAX_ATTEMPTS };
    }
  }
  
  return { allowed: true, remaining: MAX_ATTEMPTS - attempts.count };
};

// Función para registrar intento fallido
const recordFailedAttempt = (ip) => {
  const attempts = loginAttempts.get(ip) || { count: 0 };
  attempts.count++;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.blockedUntil = Date.now() + BLOCK_TIME;
  }
  
  loginAttempts.set(ip, attempts);
};

// Ruta de registro simplificada
router.post("/register", async (req, res) => {
  console.log("📝 Intentando registrar usuario:", req.body);
  const { name, email, password, roleName = "usuario", recaptchaToken } = req.body;

  // Validar que todos los campos requeridos estén presentes
  if (!name || !email || !password) {
    console.log("❌ Campos faltantes:", { name: !!name, email: !!email, password: !!password });
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  // Verificar ReCaptcha (opcional - implementar si es necesario)
  if (process.env.RECAPTCHA_SECRET && recaptchaToken) {
    try {
      const recaptchaResponse = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
        secret: process.env.RECAPTCHA_SECRET,
        response: recaptchaToken
      });
      
      if (!recaptchaResponse.data.success) {
        return res.status(400).json({ message: "Verificación de ReCaptcha fallida" });
      }
    } catch (error) {
      console.error("Error verificando ReCaptcha:", error);
    }
  }

  // Validar campos requeridos
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  // Validar email real
  if (!isValidEmail(email)) {
    return res.status(400).json({ 
      message: "Ingresa un email válido de un proveedor reconocido (Gmail, Hotmail, Outlook, Yahoo, iCloud)" 
    });
  }

  // Evaluar contraseña
  const passwordEval = evaluatePasswordStrength(password);
  if (passwordEval.score < 3) {
    return res.status(400).json({ 
      message: `Contraseña ${passwordEval.strength}. Mejoras: ${passwordEval.feedback.join(', ')}`,
      passwordStrength: passwordEval
    });
  }

  try {
    console.log("🔍 Verificando usuario existente...");
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("❌ Usuario ya existe:", email);
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    console.log("🔍 Buscando rol:", roleName);
    // Buscar el rol
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      console.log("❌ Rol no encontrado:", roleName);
      return res.status(400).json({ message: "Rol no válido" });
    }

    console.log("🔄 Creando usuario...");
    // Crear el usuario activo directamente
    const user = await User.create({
      name,
      email,
      password,
      roleId: role.id,
      isActive: true,
      emailVerified: true // Simplificado - sin verificación
    });

    console.log("🔑 Generando token...");
    // Generar token de sesión inmediatamente
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "clave-demo",
      { expiresIn: "24h" }
    );

    console.log(`✅ Usuario registrado exitosamente: ${email}`);
    
    res.status(201).json({ 
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId
      },
      passwordStrength: passwordEval.strength
    });

  } catch (err) {
    console.error("❌ Error detallado en /register:", err);
    console.error("❌ Stack trace:", err.stack);
    res.status(500).json({ 
      message: "Error al crear el usuario",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

  // Verificar límites de intentos
  const attemptCheck = checkAttempts(clientIP);
  if (!attemptCheck.allowed) {
    return res.status(429).json({ 
      message: `Demasiados intentos fallidos. Bloqueado por ${attemptCheck.timeLeft} minutos.`,
      blockedUntil: attemptCheck.blockedUntil,
      code: 'TOO_MANY_ATTEMPTS'
    });
  }

  // Verificar ReCaptcha si hay muchos intentos
  if (attemptCheck.remaining <= 2 && process.env.RECAPTCHA_SECRET && recaptchaToken) {
    try {
      const recaptchaResponse = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
        secret: process.env.RECAPTCHA_SECRET,
        response: recaptchaToken
      });
      
      if (!recaptchaResponse.data.success) {
        return res.status(400).json({ 
          message: "Verificación de ReCaptcha requerida",
          requiresRecaptcha: true
        });
      }
    } catch (error) {
      console.error("Error verificando ReCaptcha:", error);
    }
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      recordFailedAttempt(clientIP);
      return res.status(404).json({ 
        message: "Credenciales incorrectas",
        remaining: attemptCheck.remaining - 1
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Cuenta desactivada. Contacta al administrador." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      recordFailedAttempt(clientIP);
      return res.status(401).json({ 
        message: "Credenciales incorrectas",
        remaining: attemptCheck.remaining - 1,
        requiresRecaptcha: attemptCheck.remaining <= 2
      });
    }

    // Login exitoso - limpiar intentos
    loginAttempts.delete(clientIP);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "clave-demo",
      { expiresIn: "24h" }
    );

    res.json({ 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        isActive: user.isActive
      }
    });
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

// Rutas de verificación removidas - sistema simplificado

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
