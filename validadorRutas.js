// validadorRutas.js
const rutas = [
  "index.html",
  "clients.html",
  "quotations.html",
  "followups.html",
  "plantillas.html",
  "respuestas.html",
  "contactos.html",
  "estadisticas.html",
  "integraciones.html",
  "soporte.html",
  "iapersonalizada.html",
  "conectar.html",
];

async function validarRutas() {
  for (const ruta of rutas) {
    try {
      const res = await fetch(ruta);
      if (!res.ok) {
        console.error(`❌ Error en: ${ruta} - Status: ${res.status}`);
      } else {
        console.log(`✅ ${ruta} cargado correctamente`);
      }
    } catch (err) {
      console.error(`❌ Fallo al cargar ${ruta}:`, err.message);
    }
  }
}

validarRutas();