const express = require("express");
const os = require("os");
const router = express.Router();

router.get("/", (req, res) => {
  const uptime = process.uptime(); // en segundos
  const memoryUsage = process.memoryUsage();

  res.json({
    message: "✅ Backend activo",
    status: "ok",
    timestamp: new Date(),
    uptime: `${Math.floor(uptime)}s`,
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemMB: Math.round(os.totalmem() / 1024 / 1024),
      freeMemMB: Math.round(os.freemem() / 1024 / 1024),
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
    },
  });
});

module.exports = router;
