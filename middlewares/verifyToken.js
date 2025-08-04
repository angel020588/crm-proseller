// server/middlewares/verifyToken.js
const jwt = require("jsonwebtoken");
const { User, Role } = require("../server/models");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu_jwt_secreto_seguro",
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
    console.error("❌ Error al verificar token:", err.message);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

module.exports = verifyToken;
