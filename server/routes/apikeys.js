
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const verifyToken = require("../../middlewares/verifyToken");
const { ApiKey } = require("../models");

// Obtener todas las API Keys del usuario
router.get("/", verifyToken, async (req, res) => {
  try {
    const apiKeys = await ApiKey.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'name', 'key', 'isActive', 'permissions', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // Mapear para compatibilidad con el frontend
    const formattedKeys = apiKeys.map(key => ({
      id: key.id,
      key: key.key,
      description: key.name,
      active: key.isActive,
      permissions: key.permissions,
      createdAt: key.createdAt
    }));

    res.json(formattedKeys);
  } catch (error) {
    console.error("Error al obtener API Keys:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Crear nueva API Key
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { description, permissions = [] } = req.body;

    if (!description) {
      return res.status(400).json({ message: "La descripción es requerida" });
    }

    // Generar API Key única
    const apiKey = `pk_${crypto.randomBytes(32).toString('hex')}`;

    const newApiKey = await ApiKey.create({
      name: description,
      key: apiKey,
      isActive: true,
      permissions: permissions,
      userId: req.user.id
    });

    res.status(201).json({
      message: "API Key creada exitosamente",
      key: apiKey,
      id: newApiKey.id,
      description: description,
      active: true,
      permissions: permissions
    });

  } catch (error) {
    console.error("Error al crear API Key:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Desactivar API Key
router.post("/deactivate", verifyToken, async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ message: "La API Key es requerida" });
    }

    const apiKey = await ApiKey.findOne({
      where: { 
        key: key,
        userId: req.user.id 
      }
    });

    if (!apiKey) {
      return res.status(404).json({ message: "API Key no encontrada" });
    }

    await apiKey.update({ isActive: false });

    res.json({ message: "API Key desactivada exitosamente" });

  } catch (error) {
    console.error("Error al desactivar API Key:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Reactivar API Key
router.post("/activate", verifyToken, async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ message: "La API Key es requerida" });
    }

    const apiKey = await ApiKey.findOne({
      where: { 
        key: key,
        userId: req.user.id 
      }
    });

    if (!apiKey) {
      return res.status(404).json({ message: "API Key no encontrada" });
    }

    await apiKey.update({ isActive: true });

    res.json({ message: "API Key activada exitosamente" });

  } catch (error) {
    console.error("Error al activar API Key:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Eliminar API Key permanentemente
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findOne({
      where: { 
        id: id,
        userId: req.user.id 
      }
    });

    if (!apiKey) {
      return res.status(404).json({ message: "API Key no encontrada" });
    }

    await apiKey.destroy();

    res.json({ message: "API Key eliminada exitosamente" });

  } catch (error) {
    console.error("Error al eliminar API Key:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Verificar validez de una API Key (para uso interno)
router.post("/verify", async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ message: "API Key requerida" });
    }

    const apiKey = await ApiKey.findOne({
      where: { 
        key: key,
        isActive: true 
      },
      include: [{
        model: require("../models").User,
        attributes: ['id', 'email', 'name']
      }]
    });

    if (!apiKey) {
      return res.status(401).json({ message: "API Key inválida o inactiva" });
    }

    res.json({
      valid: true,
      userId: apiKey.userId,
      permissions: apiKey.permissions,
      user: apiKey.User
    });

  } catch (error) {
    console.error("Error al verificar API Key:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
