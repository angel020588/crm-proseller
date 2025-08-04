const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { User, Role } = require("../models");

const router = express.Router();

// Configurar nodemailer
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'tu-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'tu-app-password'
  }
});

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

// Ruta de registro
router.post("/register", async (req, res) => {
  console.log("📝 Intentando registrar usuario:", req.body);
  const { name, email, password, roleName = "usuario" } = req.body;

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
      message: `Contraseña ${passwordEval.strength}. Mejoras: ${passwordEval.feedback.join(', ')}` 
    });
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

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Crear el usuario (inactivo hasta verificar email)
    const user = await User.create({
      name,
      email,
      password,
      roleId: role.id,
      isActive: false,
      emailVerified: false,
      verificationToken
    });

    // Enviar email de verificación
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@crm.com',
        to: email,
        subject: '✅ Verifica tu cuenta - CRM ProSeller',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">¡Bienvenido a CRM ProSeller!</h2>
            <p>Hola <strong>${name}</strong>,</p>
            <p>Tu cuenta ha sido creada exitosamente. Para activarla, haz clic en el siguiente enlace:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verificar mi cuenta
              </a>
            </div>
            <p>Este enlace expira en 24 horas.</p>
            <p>Si no solicitaste esta cuenta, puedes ignorar este email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">CRM ProSeller - Sistema de gestión profesional</p>
          </div>
        `
      });

      console.log(`📧 Email de verificación enviado a: ${email}`);
      
      res.status(201).json({ 
        message: "Usuario registrado. Revisa tu email para verificar tu cuenta.",
        emailSent: true,
        passwordStrength: passwordEval.strength
      });

    } catch (emailError) {
      console.error("❌ Error enviando email:", emailError);
      // Si falla el email, eliminar usuario creado
      await user.destroy();
      res.status(500).json({ message: "Error enviando email de verificación" });
    }

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

    if (!user.emailVerified) {
      return res.status(401).json({ 
        message: "Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada." 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Cuenta desactivada. Contacta al administrador." });
    }

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

    res.json({ 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        isActive: user.isActive,
        emailVerified: user.emailVerified
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

// Ruta para verificar email
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ 
      where: { 
        verificationToken: token,
        emailVerified: false 
      } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Token de verificación inválido o expirado' });
    }

    // Activar usuario
    await user.update({
      isActive: true,
      emailVerified: true,
      verificationToken: null
    });

    // Generar token de sesión
    const sessionToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "clave-demo",
      { expiresIn: "2h" }
    );

    res.json({ 
      message: "Email verificado exitosamente",
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId
      }
    });

  } catch (error) {
    console.error("❌ Error en verify-email:", error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para reenviar verificación
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ 
      where: { 
        email, 
        emailVerified: false 
      } 
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado o ya verificado' });
    }

    // Generar nuevo token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await user.update({ verificationToken });

    // Reenviar email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@crm.com',
      to: email,
      subject: '🔄 Reenvío verificación - CRM ProSeller',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Reenvío de verificación</h2>
          <p>Hola <strong>${user.name}</strong>,</p>
          <p>Aquí tienes un nuevo enlace de verificación:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verificar mi cuenta
            </a>
          </div>
        </div>
      `
    });

    res.json({ message: "Email de verificación reenviado" });

  } catch (error) {
    console.error("❌ Error en resend-verification:", error);
    res.status(500).json({ message: 'Error del servidor' });
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
