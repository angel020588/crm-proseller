const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando reparación completa del CRM...\n');

// 1. Arreglar middleware de auth
const authMiddlewarePath = 'server/middleware/auth.js';
const authMiddlewareContent = `const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No hay token, acceso denegado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Token no válido' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token no válido' });
  }
};

module.exports = auth;`;

fs.writeFileSync(authMiddlewarePath, authMiddlewareContent);
console.log('✅ Arreglado: server/middleware/auth.js');

// 2. Arreglar modelo User para Sequelize
const userModelPath = 'server/models/User.js';
const userModelContent = `const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'manager'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;`;

fs.writeFileSync(userModelPath, userModelContent);
console.log('✅ Arreglado: server/models/User.js');

// 3. Arreglar modelo Client para Sequelize
const clientModelPath = 'server/models/Client.js';
const clientModelContent = `const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  whatsapp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('activo', 'inactivo', 'potencial'),
    defaultValue: 'activo'
  },
  notes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'clients',
  timestamps: true
});

module.exports = Client;`;

fs.writeFileSync(clientModelPath, clientModelContent);
console.log('✅ Arreglado: server/models/Client.js');

// 4. Arreglar modelo Followup para Sequelize
const followupModelPath = 'server/models/Followup.js';
const followupModelContent = `const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Followup = sequelize.define('Followup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('llamada', 'email', 'whatsapp', 'reunion', 'cotizacion', 'otro'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'completado', 'cancelado'),
    defaultValue: 'pendiente'
  },
  priority: {
    type: DataTypes.ENUM('baja', 'media', 'alta'),
    defaultValue: 'media'
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  leadId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'leads',
      key: 'id'
    }
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  result: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'followups',
  timestamps: true
});

module.exports = Followup;`;

fs.writeFileSync(followupModelPath, followupModelContent);
console.log('✅ Arreglado: server/models/Followup.js');

// 5. Arreglar archivo routes/followups.js
const followupsRoutePath = 'server/routes/followups.js';
const followupsRouteContent = `const express = require('express');
const router = express.Router();
const Followup = require('../models/Followup');
const auth = require('../middleware/auth');

// Get all followups for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const followups = await Followup.findAll({
      where: { assignedTo: req.user.id },
      order: [['dueDate', 'ASC']]
    });
    res.json(followups);
  } catch (error) {
    console.error('Error getting followups:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Create new followup
router.post('/', auth, async (req, res) => {
  try {
    const followupData = {
      ...req.body,
      assignedTo: req.user.id,
    };

    const followup = await Followup.create(followupData);
    res.status(201).json(followup);
  } catch (error) {
    console.error('Error creating followup:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Update followup
router.put('/:id', auth, async (req, res) => {
  try {
    const [updated] = await Followup.update(req.body, {
      where: { id: req.params.id, assignedTo: req.user.id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Seguimiento no encontrado' });
    }

    const followup = await Followup.findByPk(req.params.id);
    res.json({ message: 'Seguimiento actualizado exitosamente', followup });
  } catch (error) {
    console.error('Error updating followup:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Delete followup
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Followup.destroy({
      where: { id: req.params.id, assignedTo: req.user.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Seguimiento no encontrado' });
    }

    res.json({ message: 'Seguimiento eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting followup:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;`;

fs.writeFileSync(followupsRoutePath, followupsRouteContent);
console.log('✅ Arreglado: server/routes/followups.js');

console.log('\n🎉 ¡Reparación completa del CRM terminada!');
console.log('📋 Errores corregidos:');
console.log('   • Middleware de autenticación');
console.log('   • Modelos User, Client y Followup convertidos a Sequelize');
console.log('   • Rutas de followups corregidas');
console.log('   • Referencias de base de datos actualizadas');
console.log('\n✅ Tu CRM debería funcionar correctamente ahora!');