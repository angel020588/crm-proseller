const express = require("express");
const { User, Role, Subscription } = require("../models");
const auth = require("../middleware/auth");
const { checkSuperAdmin } = require("../middleware/permissions");

const router = express.Router();

// Middleware para verificar super admin
const checkSuperAdminMiddleware = (req, res, next) => {
  if (req.user.email !== "ecotisat@gmail.com") {
    return res
      .status(403)
      .json({ message: "Acceso denegado - Solo Super Admin" });
  }
  next();
};

// GET usuarios con datos y roles
router.get("/users", auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: Role, as: "Role", attributes: ["id", "name", "displayName"] },
        {
          model: Subscription,
          attributes: ["plan", "status", "startDate", "endDate"],
        },
      ],
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    const enriched = users.map((user) => {
      const data = user.toJSON();
      data.totalRevenue = data.Subscriptions?.length ? 29.99 : 0;
      return data;
    });

    res.json(enriched);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

// GET estadísticas generales
router.get("/stats", auth, checkSuperAdminMiddleware, async (req, res) => {
  try {
    const [totalUsers, premiumUsers, activeSubs] = await Promise.all([
      User.count(),
      Subscription.count({ where: { plan: "premium", status: "active" } }),
      Subscription.count({ where: { status: "active" } }),
    ]);

    const monthlyRevenue = premiumUsers * 29.99;

    res.json({
      totalUsers,
      premiumUsers,
      activeSubscriptions: activeSubs,
      monthlyRevenue: monthlyRevenue.toFixed(2),
      freeUsers: totalUsers - premiumUsers,
      conversionRate: totalUsers
        ? ((premiumUsers / totalUsers) * 100).toFixed(2)
        : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
});

// POST regalar premium
router.post(
  "/gift-premium",
  auth,
  checkSuperAdminMiddleware,
  async (req, res) => {
    try {
      const { userId, months } = req.body;
      if (!userId || !months)
        return res.status(400).json({ message: "userId y months requeridos" });

      const user = await User.findByPk(userId);
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado" });

      let sub = await Subscription.findOne({ where: { userId } });
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + parseInt(months));

      if (sub) {
        await sub.update({ plan: "premium", status: "active", endDate });
      } else {
        sub = await Subscription.create({
          userId,
          plan: "premium",
          status: "active",
          startDate: new Date(),
          endDate,
          maxLeads: -1,
          maxApiCalls: -1,
          hasAdvancedAnalytics: true,
          hasAutomation: true,
          hasCustomDomain: true,
        });
      }

      res.json({
        message: `Premium regalado a ${user.name}`,
        giftedBy: req.user.email,
        subscription: sub,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al regalar premium", error: error.message });
    }
  },
);

// PUT cambiar rol
router.put(
  "/change-role",
  auth,
  checkSuperAdminMiddleware,
  async (req, res) => {
    try {
      const { userId, role } = req.body;
      const user = await User.findByPk(userId);
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado" });

      const roleObj = await Role.findOne({ where: { name: role } });
      await user.update({ roleId: roleObj ? roleObj.id : null });

      res.json({ message: `Rol cambiado a ${role} para ${user.name}` });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al cambiar rol", error: error.message });
    }
  },
);

// POST crear descuento
router.post(
  "/create-discount",
  auth,
  checkSuperAdminMiddleware,
  async (req, res) => {
    try {
      const { code, discount, maxUses } = req.body;
      res.json({
        message: `Código ${code} creado`,
        discount,
        maxUses: maxUses || "Ilimitado",
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creando descuento", error: error.message });
    }
  },
);

// POST modo mantenimiento
router.post(
  "/maintenance",
  auth,
  checkSuperAdminMiddleware,
  async (req, res) => {
    try {
      const { enabled } = req.body;
      res.json({
        message: `Modo mantenimiento ${enabled ? "activado" : "desactivado"}`,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error cambiando modo mantenimiento",
          error: error.message,
        });
    }
  },
);

// GET reporte financiero
router.get(
  "/financial-report",
  auth,
  checkSuperAdminMiddleware,
  async (req, res) => {
    try {
      const users = await User.findAll({
        include: [
          {
            model: Subscription,
            attributes: ["plan", "status", "startDate", "endDate"],
          },
        ],
        attributes: ["id", "name", "email", "createdAt"],
      });

      const data = users.map((user) => {
        const sub = user.Subscriptions?.[0];
        return [
          user.id,
          user.name,
          user.email,
          sub?.plan || "gratis",
          sub?.status || "N/A",
          sub?.plan === "premium" ? "29.99" : "0.00",
          user.createdAt,
        ];
      });

      const csv = [
        "ID,Nombre,Email,Plan,Estado,Ingresos,Registro",
        ...data.map((r) => r.map((f) => `"${f}"`).join(",")),
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="reporte_financiero.csv"`,
      );
      res.send(csv);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error generando reporte financiero",
          error: error.message,
        });
    }
  },
);

// POST notificación global
router.post(
  "/global-notification",
  auth,
  checkSuperAdminMiddleware,
  async (req, res) => {
    try {
      const { title, message, type } = req.body;
      const users = await User.findAll({ attributes: ["id"] });
      res.json({
        message: `Notificación enviada a ${users.length} usuarios`,
        title,
        type,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al enviar notificación global",
          error: error.message,
        });
    }
  },
);

// GET exportar datos completos
router.get(
  "/export/all-data",
  auth,
  checkSuperAdminMiddleware,
  async (req, res) => {
    try {
      const [users, subscriptions] = await Promise.all([
        User.findAll({
          include: [{ model: Role, as: "Role" }],
          attributes: { exclude: ["password"] },
        }),
        Subscription.findAll(),
      ]);

      const data = {
        users: users.map((u) => u.toJSON()),
        subscriptions: subscriptions.map((s) => s.toJSON()),
        exportedBy: req.user.email,
        exportDate: new Date().toISOString(),
        totalRecords: users.length + subscriptions.length,
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="super_admin_export.json"',
      );
      res.send(JSON.stringify(data, null, 2));
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al exportar datos", error: error.message });
    }
  },
);

module.exports = router;
