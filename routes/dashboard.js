const express = require('express');
const { Client, Lead, Quotation, Followup } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET dashboard stats
router.get('/', auth, async (req, res) => {
  try {
    const [clientsCount, leadsCount, quotationsCount, followupsCount] = await Promise.all([
      Client.count({ where: { userId: req.user.id } }),
      Lead.count({ where: { userId: req.user.id } }),
      Quotation.count({ where: { userId: req.user.id } }),
      Followup.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      clients: clientsCount,
      leads: leadsCount,
      quotations: quotationsCount,
      followups: followupsCount
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;