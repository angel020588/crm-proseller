const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const { Client } = require('../models');

console.log("🧠 Modelo Client:", Client);

// Obtener todos los clientes del usuario
router.get('/', verifyToken, async (req, res) => {
  try {
    const clients = await Client.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']]
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener un cliente específico
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Crear nuevo cliente
router.post('/', verifyToken, async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      userId: req.user.id,
    };

    const client = await Client.create(clientData);

    res.status(201).json({ message: 'Cliente creado exitosamente', client });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Actualizar cliente
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const [updated] = await Client.update(req.body, {
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const client = await Client.findByPk(req.params.id);
    res.json({ message: 'Cliente actualizado', client });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Eliminar cliente
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Client.destroy({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Agregar nota al cliente
router.post('/:id/notes', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    const client = await Client.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const currentNotes = client.notes || [];
    currentNotes.push({
      content,
      createdBy: req.user.id,
      createdAt: new Date()
    });

    await client.update({ notes: currentNotes });
    res.json({ message: 'Nota agregada', client });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;