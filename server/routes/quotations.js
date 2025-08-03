const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/verifyToken");
const quotationController = require("../controllers/quotationController");

// Obtener todas las cotizaciones del usuario
router.get("/", verifyToken, quotationController.getUserQuotations);

// Obtener una cotización específica
router.get("/:id", verifyToken, quotationController.getQuotationById);

// Crear nueva cotización
router.post("/", verifyToken, quotationController.createQuotation);

// Actualizar cotización
router.put("/:id", verifyToken, quotationController.updateQuotation);

// Eliminar cotización
router.delete("/:id", verifyToken, quotationController.deleteQuotation);

// Cambiar estado de cotización
router.patch("/:id/status", verifyToken, quotationController.updateQuotationStatus);

// Obtener estadísticas de cotizaciones
router.get("/stats/summary", verifyToken, quotationController.getQuotationStats);

const PDFDocument = require("pdfkit");

// Descargar PDF de cotización
router.get("/:id/pdf", verifyToken, async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Client }]
    });

    if (!quotation) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=cotizacion-${quotation.id}.pdf`);

    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text("Cotización Profesional", { align: "center" });
    doc.moveDown();
    
    // Información del cliente
    doc.fontSize(14).text("Información del Cliente:", { underline: true });
    doc.fontSize(12);
    doc.text(`Cliente: ${quotation.Client.name}`);
    doc.text(`Correo: ${quotation.Client.email || 'No especificado'}`);
    doc.text(`Teléfono: ${quotation.Client.phone || 'No especificado'}`);
    if (quotation.Client.company) {
      doc.text(`Empresa: ${quotation.Client.company}`);
    }
    doc.moveDown();

    // Información de la cotización
    doc.fontSize(14).text("Detalles de la Cotización:", { underline: true });
    doc.fontSize(12);
    doc.text(`Título: ${quotation.title}`);
    doc.text(`Fecha de creación: ${new Date(quotation.createdAt).toLocaleDateString('es-ES')}`);
    doc.text(`Estado: ${quotation.status.toUpperCase()}`);
    if (quotation.deliveryDate) {
      doc.text(`Fecha de entrega: ${new Date(quotation.deliveryDate).toLocaleDateString('es-ES')}`);
    }
    doc.moveDown();

    // Descripción
    if (quotation.description) {
      doc.fontSize(14).text("Descripción:", { underline: true });
      doc.fontSize(12);
      doc.text(quotation.description, { width: 450, align: 'justify' });
      doc.moveDown();
    }

    // Total
    doc.fontSize(16).text(`TOTAL: $${parseFloat(quotation.total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, { 
      align: 'right',
      underline: true 
    });

    // Pie de página
    doc.moveDown(2);
    doc.fontSize(10).text("Cotización generada automáticamente por CRM ProSeller", { 
      align: 'center',
      color: 'gray' 
    });

    doc.end();
  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).json({ message: "Error al generar PDF" });
  }
});

module.exports = router;