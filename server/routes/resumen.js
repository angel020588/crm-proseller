
const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/verifyToken");
const PDFDocument = require("pdfkit");
const { Quotation, User, Client, Lead, Followup } = require("../models");

// Generar PDF completo del resumen
router.get("/pdf", verifyToken, async (req, res) => {
  try {
    // Obtener todos los datos del usuario
    const [user, clients, quotations, leads, followups] = await Promise.all([
      User.findByPk(req.user.id, {
        attributes: ['id', 'name', 'email', 'createdAt']
      }),
      Client.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      }),
      Quotation.findAll({
        where: { userId: req.user.id },
        include: [{ model: Client, attributes: ['name'] }],
        order: [['createdAt', 'DESC']]
      }),
      Lead.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      }),
      Followup.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      })
    ]);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=resumen-crm-completo-${new Date().toISOString().split('T')[0]}.pdf`);

    doc.pipe(res);

    // PORTADA
    doc.fontSize(24).text("CRM PROSELLER", { align: "center" });
    doc.fontSize(18).text("Resumen Completo del Sistema", { align: "center" });
    doc.moveDown(2);

    // Información del usuario
    doc.fontSize(16).text("Información del Usuario", { underline: true });
    doc.fontSize(12);
    doc.text(`Nombre: ${user.name || 'No especificado'}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Fecha de registro: ${new Date(user.createdAt).toLocaleDateString('es-ES')}`);
    doc.text(`Fecha del reporte: ${new Date().toLocaleDateString('es-ES')}`);
    doc.moveDown(2);

    // ESTADÍSTICAS GENERALES
    doc.fontSize(16).text("📊 Estadísticas Generales", { underline: true });
    doc.fontSize(12);
    doc.text(`Total de Clientes: ${clients.length}`);
    doc.text(`Total de Cotizaciones: ${quotations.length}`);
    doc.text(`Total de Leads: ${leads.length}`);
    doc.text(`Total de Seguimientos: ${followups.length}`);
    
    // Estadísticas de cotizaciones por estado
    const quotationStats = quotations.reduce((acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1;
      return acc;
    }, {});
    
    doc.moveDown();
    doc.text("Cotizaciones por Estado:");
    Object.entries(quotationStats).forEach(([status, count]) => {
      doc.text(`  • ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`);
    });

    // Valor total de cotizaciones
    const totalValue = quotations.reduce((sum, q) => sum + parseFloat(q.total || 0), 0);
    doc.text(`Valor Total de Cotizaciones: €${totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`);
    doc.moveDown(2);

    // CLIENTES
    doc.addPage();
    doc.fontSize(16).text("👥 Lista de Clientes", { underline: true });
    doc.fontSize(10);
    
    if (clients.length === 0) {
      doc.text("No hay clientes registrados.");
    } else {
      // Tabla de clientes
      let yPosition = doc.y + 10;
      doc.text("Nombre", 50, yPosition);
      doc.text("Email", 200, yPosition);
      doc.text("Empresa", 350, yPosition);
      doc.text("Fecha", 450, yPosition);
      
      yPosition += 20;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      clients.forEach((client) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
          // Repetir encabezados
          doc.text("Nombre", 50, yPosition);
          doc.text("Email", 200, yPosition);
          doc.text("Empresa", 350, yPosition);
          doc.text("Fecha", 450, yPosition);
          yPosition += 30;
        }

        doc.text(client.name || 'N/A', 50, yPosition);
        doc.text(client.email || 'N/A', 200, yPosition);
        doc.text(client.company || 'N/A', 350, yPosition);
        doc.text(new Date(client.createdAt).toLocaleDateString('es-ES'), 450, yPosition);
        yPosition += 20;
      });
    }

    // COTIZACIONES
    doc.addPage();
    doc.fontSize(16).text("💰 Lista de Cotizaciones", { underline: true });
    doc.fontSize(10);
    
    if (quotations.length === 0) {
      doc.text("No hay cotizaciones registradas.");
    } else {
      let yPosition = doc.y + 10;
      doc.text("Título", 50, yPosition);
      doc.text("Cliente", 200, yPosition);
      doc.text("Estado", 320, yPosition);
      doc.text("Total", 400, yPosition);
      doc.text("Fecha", 480, yPosition);
      
      yPosition += 20;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      quotations.forEach((quotation) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
          // Repetir encabezados
          doc.text("Título", 50, yPosition);
          doc.text("Cliente", 200, yPosition);
          doc.text("Estado", 320, yPosition);
          doc.text("Total", 400, yPosition);
          doc.text("Fecha", 480, yPosition);
          yPosition += 30;
        }

        doc.text(quotation.title.substring(0, 25) || 'N/A', 50, yPosition);
        doc.text((quotation.Client?.name || 'N/A').substring(0, 15), 200, yPosition);
        doc.text(quotation.status, 320, yPosition);
        doc.text(`€${parseFloat(quotation.total).toLocaleString('es-ES')}`, 400, yPosition);
        doc.text(new Date(quotation.createdAt).toLocaleDateString('es-ES'), 480, yPosition);
        yPosition += 20;
      });
    }

    // LEADS
    doc.addPage();
    doc.fontSize(16).text("🎯 Lista de Leads", { underline: true });
    doc.fontSize(10);
    
    if (leads.length === 0) {
      doc.text("No hay leads registrados.");
    } else {
      let yPosition = doc.y + 10;
      doc.text("Nombre", 50, yPosition);
      doc.text("Email", 180, yPosition);
      doc.text("Estado", 320, yPosition);
      doc.text("Fuente", 400, yPosition);
      doc.text("Fecha", 480, yPosition);
      
      yPosition += 20;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      leads.forEach((lead) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
          // Repetir encabezados
          doc.text("Nombre", 50, yPosition);
          doc.text("Email", 180, yPosition);
          doc.text("Estado", 320, yPosition);
          doc.text("Fuente", 400, yPosition);
          doc.text("Fecha", 480, yPosition);
          yPosition += 30;
        }

        doc.text((lead.name || 'N/A').substring(0, 20), 50, yPosition);
        doc.text((lead.email || 'N/A').substring(0, 20), 180, yPosition);
        doc.text(lead.status || 'N/A', 320, yPosition);
        doc.text((lead.source || 'N/A').substring(0, 12), 400, yPosition);
        doc.text(new Date(lead.createdAt).toLocaleDateString('es-ES'), 480, yPosition);
        yPosition += 20;
      });
    }

    // SEGUIMIENTOS
    doc.addPage();
    doc.fontSize(16).text("📞 Lista de Seguimientos", { underline: true });
    doc.fontSize(10);
    
    if (followups.length === 0) {
      doc.text("No hay seguimientos registrados.");
    } else {
      let yPosition = doc.y + 10;
      
      followups.forEach((followup) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(11).text(`• ${followup.title || 'Sin título'}`, 50, yPosition);
        yPosition += 15;
        if (followup.description) {
          doc.fontSize(9).text(`  ${followup.description.substring(0, 100)}...`, 60, yPosition);
          yPosition += 12;
        }
        doc.fontSize(9).text(`  Fecha: ${new Date(followup.createdAt).toLocaleDateString('es-ES')}`, 60, yPosition);
        yPosition += 20;
      });
    }

    // PIE DE PÁGINA
    doc.addPage();
    doc.fontSize(14).text("🎉 Resumen Generado", { align: 'center' });
    doc.fontSize(10).text(`Este reporte fue generado automáticamente por CRM ProSeller el ${new Date().toLocaleString('es-ES')}`, { align: 'center' });
    doc.moveDown();
    doc.text("Gracias por usar nuestro sistema de gestión.", { align: 'center' });

    doc.end();
  } catch (error) {
    console.error("Error al generar PDF del resumen:", error);
    res.status(500).json({ message: "Error al generar PDF del resumen" });
  }
});

module.exports = router;
