
const { ApiKey, User } = require("../models");

const checkApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
      return res.status(401).json({ message: "API Key requerida" });
    }

    const keyRecord = await ApiKey.findOne({
      where: { 
        key: apiKey,
        isActive: true 
      },
      include: [{
        model: User,
        attributes: ['id', 'email', 'name', 'roleId']
      }]
    });

    if (!keyRecord) {
      return res.status(401).json({ message: "API Key inválida o inactiva" });
    }

    // Adjuntar información del usuario a la request
    req.user = {
      id: keyRecord.User.id,
      email: keyRecord.User.email,
      name: keyRecord.User.name,
      roleId: keyRecord.User.roleId,
      apiKeyPermissions: keyRecord.permissions
    };

    req.apiKey = {
      id: keyRecord.id,
      key: keyRecord.key,
      permissions: keyRecord.permissions
    };

    next();
  } catch (error) {
    console.error("Error verificando API Key:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = checkApiKey;
