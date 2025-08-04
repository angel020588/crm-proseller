// server/routes/account.js
const express = require("express");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const router = express.Router();

const verifyToken = require("../../middlewares/verifyToken");
const { User, Role } = require("../models");

// ✅ Actualizar perfil
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ message: "Nombre y correo son requeridos" });
    }

    // Verifica si el correo ya lo tiene otro usuario
    const existingUser = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: req.user.id },
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Este correo ya está en uso por otro usuario" });
    }

    await User.update({ name, email }, { where: { id: req.user.id } });

    res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

// ✅ Cambiar contraseña
router.put("/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Contraseña actual y nueva son requeridas" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          message: "La nueva contraseña debe tener al menos 6 caracteres",
        });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedPassword },
      { where: { id: req.user.id } },
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al cambiar contraseña:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

// ✅ Obtener información de la cuenta
router.get("/info", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: "Role" }],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role?.name || "vendedor",
        roleDisplayName: user.Role?.displayName || "Vendedor",
        permissions: user.Role?.permissions || {},
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener la información del usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

module.exports = router;
