// Cargar variables de entorno PRIMERO
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Sequelize } = require("sequelize");

const app = express();
const PORT = process.env.PORT || 3000;

// Verificar que DATABASE_URL esté presente
console.log("🔍 DATABASE_URL cargada:", process.env.DATABASE_URL ? "SÍ" : "NO");
console.log(
  "🔍 Primera parte de la URL:",
  process.env.DATABASE_URL
    ? process.env.DATABASE_URL.substring(0, 20) + "..."
    : "UNDEFINED",
);

// Configuración de conexión a PostgreSQL con Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // necesario para Render
    },
  },
});

// Importar modelos y seeder
const db = require("./models");
const seedRoles = require("./seeders/seedRoles");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas activas
const pingRoutes = require("./routes/pings");
const pingsRoutes = require("./routes/pings"); // Alias
const supabaseClientsRoutes = require("./routes/supabase-clients");

// API Routes activas
app.use("/api/ping", pingRoutes);
app.use("/api/pings", pingsRoutes);
app.use("/api/supabase-clients", supabaseClientsRoutes);

// Static files desde React
app.use(express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Iniciar base de datos y servidor
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("✅ Base de datos sincronizada correctamente");
    await seedRoles();
    console.log("✅ Roles base creados/verificados");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Servidor CRM corriendo en http://0.0.0.0:${PORT}`);
      console.log(`🚀 Backend API disponible en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar base de datos:", err);
    process.exit(1);
  });
