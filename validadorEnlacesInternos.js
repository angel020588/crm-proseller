
// validadorEnlacesInternos.js - Validador avanzado de enlaces internos
const rutasHTML = [
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
  "conectar.html"
];

class ValidadorEnlaces {
  constructor() {
    this.erroresEncontrados = [];
    this.enlacesValidados = new Set();
  }

  async validarTodasLasRutas() {
    console.log('🔍 Iniciando validación completa de rutas y enlaces internos...\n');
    
    for (const ruta of rutasHTML) {
      await this.validarRutaYEnlaces(ruta);
    }
    
    this.mostrarResumen();
  }

  async validarRutaYEnlaces(ruta) {
    try {
      // 1. Validar que el archivo existe
      const response = await fetch(ruta);
      if (!response.ok) {
        console.error(`❌ Archivo no encontrado: ${ruta} - Status: ${response.status}`);
        this.erroresEncontrados.push(`Archivo ${ruta} no existe`);
        return;
      }

      console.log(`✅ ${ruta} cargado correctamente`);
      
      // 2. Obtener contenido HTML y validar enlaces internos
      const contenidoHTML = await response.text();
      await this.validarEnlacesInternos(ruta, contenidoHTML);
      
    } catch (error) {
      console.error(`❌ Error al cargar ${ruta}:`, error.message);
      this.erroresEncontrados.push(`Error en ${ruta}: ${error.message}`);
    }
  }

  async validarEnlacesInternos(rutaArchivo, contenidoHTML) {
    // Crear un DOM temporal para parsear el HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(contenidoHTML, 'text/html');
    
    // Encontrar todos los enlaces <a href="...">
    const enlaces = doc.querySelectorAll('a[href]');
    
    for (const enlace of enlaces) {
      const href = enlace.getAttribute('href');
      
      // Solo validar enlaces internos (no externos, no anclas)
      if (this.esEnlaceInterno(href)) {
        await this.validarEnlaceInterno(rutaArchivo, href);
      }
    }

    // Validar también enlaces de botones con onclick="window.location.href='...'"
    const botonesConRedirect = doc.querySelectorAll('button[onclick*="window.location.href"]');
    for (const boton of botonesConRedirect) {
      const onclick = boton.getAttribute('onclick');
      const match = onclick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (match && this.esEnlaceInterno(match[1])) {
        await this.validarEnlaceInterno(rutaArchivo, match[1]);
      }
    }
  }

  esEnlaceInterno(href) {
    // Es enlace interno si:
    // - No empieza con http:// o https://
    // - No empieza con mailto: o tel:
    // - No es solo un ancla (#)
    // - No es javascript:
    return href && 
           !href.startsWith('http://') && 
           !href.startsWith('https://') &&
           !href.startsWith('mailto:') &&
           !href.startsWith('tel:') &&
           !href.startsWith('javascript:') &&
           !href.startsWith('#') &&
           href.includes('.html');
  }

  async validarEnlaceInterno(rutaOrigen, enlace) {
    // Evitar validar el mismo enlace múltiples veces
    if (this.enlacesValidados.has(enlace)) {
      return;
    }
    
    this.enlacesValidados.add(enlace);
    
    try {
      const response = await fetch(enlace);
      if (!response.ok) {
        console.warn(`⚠️  Enlace roto en ${rutaOrigen}: ${enlace} (Status: ${response.status})`);
        this.erroresEncontrados.push(`Enlace roto: ${enlace} en ${rutaOrigen}`);
      } else {
        console.log(`   🔗 Enlace válido: ${enlace}`);
      }
    } catch (error) {
      console.warn(`⚠️  Error al validar enlace en ${rutaOrigen}: ${enlace} - ${error.message}`);
      this.erroresEncontrados.push(`Error en enlace: ${enlace} en ${rutaOrigen}`);
    }
  }

  mostrarResumen() {
    console.log('\n📊 RESUMEN DE VALIDACIÓN');
    console.log('========================');
    
    if (this.erroresEncontrados.length === 0) {
      console.log('🎉 ¡Excelente! No se encontraron errores en rutas ni enlaces.');
    } else {
      console.log(`❌ Se encontraron ${this.erroresEncontrados.length} errores:`);
      this.erroresEncontrados.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log(`\n🔍 Enlaces internos validados: ${this.enlacesValidados.size}`);
    console.log('✅ Validación completa terminada.');
  }
}

// Ejecutar validación automáticamente
const validador = new ValidadorEnlaces();
validador.validarTodasLasRutas();

// Exportar para uso manual si es necesario
module.exports = ValidadorEnlaces;indow.ValidadorEnlaces = ValidadorEnlaces;
