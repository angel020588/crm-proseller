
const express = require('express');
const { Quotation } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET all quotations
router.get('/', auth, async (req, res) => {
  try {
    const quotations = await Quotation.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// POST new quotation
router.post('/', auth, async (req, res) => {
  try {
    const quotation = await Quotation.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(quotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
