const express = require("express");
const { Client } = require("../models");
const { Op } = require("sequelize");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/clients
 * Obtener todos los clientes asignados al usuario autenticado
 */
router.get("/", auth, async (req, res) => {
  try {
    const clients = await Client.findAll({
      where: { assignedTo: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

/**
 * POST /api/clients
 * Crear un nuevo cliente asignado al usuario actual
 */
router.post("/", auth, async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      assignedTo: req.user.id,
    });
    res.status(201).json(client);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

/**
 * GET /api/clients/:id
 * Obtener un cliente por ID si pertenece al usuario autenticado
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      where: {
        id: req.params.id,
        assignedTo: req.user.id,
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json(client);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

/**
 * PUT /api/clients/:id
 * Actualizar un cliente si pertenece al usuario autenticado
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      where: {
        id: req.params.id,
        assignedTo: req.user.id,
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await client.update(req.body);
    res.json(client);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

/**
 * DELETE /api/clients/:id
 * Eliminar un cliente si pertenece al usuario autenticado
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      where: {
        id: req.params.id,
        assignedTo: req.user.id,
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await client.destroy();
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

/**
 * GET /api/clients/search/:query
 * Buscar clientes por nombre, correo o empresa del usuario autenticado
 */
router.get("/search/:query", auth, async (req, res) => {
  try {
    const { query } = req.params;

    const clients = await Client.findAll({
      where: {
        assignedTo: req.user.id,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { company: { [Op.iLike]: `%${query}%` } },
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(clients);
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

module.exports = router;
