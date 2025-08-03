
const { Quotation, User, Client } = require("../models");

// Crear nueva cotización
exports.createQuotation = async (req, res) => {
  try {
    const { title, description, total, status, deliveryDate, clientId } = req.body;

    if (!title || !total || !clientId) {
      return res.status(400).json({ message: "Título, total y cliente son requeridos" });
    }

    // Verificar que el cliente pertenece al usuario
    const client = await Client.findOne({
      where: { 
        id: clientId,
        userId: req.user.id 
      }
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
    }

    const quotation = await Quotation.create({
      title,
      description: description || "",
      total,
      status: status || "pendiente",
      deliveryDate,
      clientId,
      userId: req.user.id
    });

    // Obtener la cotización con información del cliente
    const newQuotation = await Quotation.findByPk(quotation.id, {
      include: [
        {
          model: Client,
          attributes: ["id", "name", "email", "company"]
        }
      ]
    });

    res.status(201).json({ 
      message: "Cotización creada exitosamente", 
      quotation: newQuotation 
    });

  } catch (error) {
    console.error("❌ Error al crear cotización:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todas las cotizaciones del usuario actual
exports.getUserQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Client,
          attributes: ["id", "name", "email", "company"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json(quotations);

  } catch (error) {
    console.error("❌ Error al obtener cotizaciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener una cotización específica
exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await Quotation.findOne({
      where: { 
        id, 
        userId: req.user.id 
      },
      include: [
        {
          model: Client,
          attributes: ["id", "name", "email", "company", "phone"]
        }
      ]
    });

    if (!quotation) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    res.json(quotation);

  } catch (error) {
    console.error("❌ Error al obtener cotización:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Editar una cotización
exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, total, status, deliveryDate, clientId } = req.body;

    const quotation = await Quotation.findOne({
      where: { id, userId: req.user.id }
    });

    if (!quotation) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    // Si se cambia el cliente, verificar que pertenece al usuario
    if (clientId && clientId !== quotation.clientId) {
      const client = await Client.findOne({
        where: { 
          id: clientId,
          userId: req.user.id 
        }
      });

      if (!client) {
        return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
      }
    }

    await quotation.update({
      title: title || quotation.title,
      description: description || quotation.description,
      total: total || quotation.total,
      status: status || quotation.status,
      deliveryDate: deliveryDate || quotation.deliveryDate,
      clientId: clientId || quotation.clientId
    });

    // Obtener la cotización actualizada con información del cliente
    const updatedQuotation = await Quotation.findByPk(quotation.id, {
      include: [
        {
          model: Client,
          attributes: ["id", "name", "email", "company"]
        }
      ]
    });

    res.json({ 
      message: "Cotización actualizada exitosamente", 
      quotation: updatedQuotation 
    });

  } catch (error) {
    console.error("❌ Error al actualizar cotización:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar cotización
exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await Quotation.findOne({
      where: { id, userId: req.user.id }
    });

    if (!quotation) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    await quotation.destroy();
    res.json({ message: "Cotización eliminada correctamente" });

  } catch (error) {
    console.error("❌ Error al eliminar cotización:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Cambiar estado de cotización
exports.updateQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pendiente", "enviada", "aprobada", "rechazada", "cancelada"];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Estado inválido. Estados válidos: " + validStatuses.join(", ") 
      });
    }

    const quotation = await Quotation.findOne({
      where: { id, userId: req.user.id }
    });

    if (!quotation) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    await quotation.update({ status });

    res.json({ 
      message: `Estado actualizado a: ${status}`, 
      quotation 
    });

  } catch (error) {
    console.error("❌ Error al actualizar estado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener estadísticas de cotizaciones
exports.getQuotationStats = async (req, res) => {
  try {
    const { Op } = require("sequelize");
    
    const stats = await Quotation.findAll({
      where: { userId: req.user.id },
      attributes: [
        [require("sequelize").fn("COUNT", "*"), "total"],
        [require("sequelize").fn("SUM", require("sequelize").col("total")), "totalValue"],
        "status"
      ],
      group: ["status"],
      raw: true
    });

    const formattedStats = {
      total: 0,
      totalValue: 0,
      pendientes: 0,
      enviadas: 0,
      aprobadas: 0,
      rechazadas: 0,
      canceladas: 0
    };

    stats.forEach(stat => {
      formattedStats.total += parseInt(stat.total);
      formattedStats.totalValue += parseFloat(stat.totalValue || 0);
      formattedStats[stat.status] = parseInt(stat.total);
    });

    res.json(formattedStats);

  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
