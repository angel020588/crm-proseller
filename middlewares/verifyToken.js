// server/middlewares/verifyToken.js
const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu_jwt_secret_aqui",
    );

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: "Role" }],
    });

    if (!user) {
      return res.status(401).json({ message: "Usuario no válido" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.Role?.name || "vendedor",
      permissions: user.Role?.permissions || {},
    };

    next();
  } catch (err) {
    console.error("❌ Token inválido:", err.message);
    res.status(403).json({ message: "Token inválido" });
  }
};

module.exports = verifyToken;
