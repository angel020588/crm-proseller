const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Client, Lead, Quotation, Followup, User } = require('../models');

// GET resumen completo
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener todos los datos del usuario
    const [clients, leads, quotations, followups] = await Promise.all([
      Client.findAll({
        where: { assignedTo: userId },
        order: [['createdAt', 'DESC']]
      }),
      Lead.findAll({
        where: { assignedTo: userId },
        order: [['createdAt', 'DESC']]
      }),
      Quotation.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      }),
      Followup.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      })
    ]);

    // Calcular métricas
    const metrics = {
      totalClients: clients.length,
      totalLeads: leads.length,
      totalQuotations: quotations.length,
      totalFollowups: followups.length,

      // Análisis de leads
      leadsActivos: leads.filter(l => l.status === 'nuevo' || l.status === 'contactado').length,
      leadsConvertidos: leads.filter(l => l.status === 'convertido').length,

      // Análisis de cotizaciones
      cotizacionesPendientes: quotations.filter(q => q.status === 'pendiente').length,
      cotizacionesAprobadas: quotations.filter(q => q.status === 'aprobada').length,

      // Valor total estimado
      valorTotal: quotations.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0)
    };

    res.json({
      success: true,
      data: {
        clients,
        leads,
        quotations,
        followups,
        metrics,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error en resumen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar resumen',
      error: error.message
    });
  }
});

// POST generar PDF del resumen
router.post('/pdf', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener datos para el PDF
    const [clients, leads, quotations, user] = await Promise.all([
      Client.findAll({
        where: { assignedTo: userId },
        order: [['createdAt', 'DESC']]
      }),
      Lead.findAll({
        where: { assignedTo: userId },
        order: [['createdAt', 'DESC']]
      }),
      Quotation.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      }),
      User.findByPk(userId)
    ]);

    // Generar contenido HTML para el PDF
    const htmlContent = generatePDFContent(user, clients, leads, quotations);

    // Configurar headers para descarga de PDF
    const filename = `resumen_crm_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(htmlContent);

  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF',
      error: error.message
    });
  }
});

// Función para generar contenido HTML del PDF
function generatePDFContent(user, clients, leads, quotations) {
  const totalClients = clients.length;
  const totalLeads = leads.length;
  const totalQuotations = quotations.length;
  const valorTotal = quotations.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resumen CRM - ${user.name}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4F46E5;
            margin: 0;
            font-size: 28px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
        }
        .section h2 {
            color: #4F46E5;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 10px;
        }
        .metrics {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 20px;
        }
        .metric {
            text-align: center;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            min-width: 120px;
        }
        .metric h3 {
            font-size: 24px;
            margin: 0;
            color: #4F46E5;
        }
        .metric p {
            margin: 5px 0 0 0;
            font-size: 14px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 12px;
        }
        th {
            background-color: #4F46E5;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { margin: 0; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Resumen CRM ProSeller</h1>
        <p><strong>Usuario:</strong> ${user.name} (${user.email})</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
    </div>

    <div class="section">
        <h2>📈 Métricas Generales</h2>
        <div class="metrics">
            <div class="metric">
                <h3>${totalClients}</h3>
                <p>Clientes</p>
            </div>
            <div class="metric">
                <h3>${totalLeads}</h3>
                <p>Leads</p>
            </div>
            <div class="metric">
                <h3>${totalQuotations}</h3>
                <p>Cotizaciones</p>
            </div>
            <div class="metric">
                <h3>$${valorTotal.toLocaleString()}</h3>
                <p>Valor Total</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>👥 Clientes (${totalClients})</h2>
        ${totalClients > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Empresa</th>
                    <th>Fecha Registro</th>
                </tr>
            </thead>
            <tbody>
                ${clients.map(client => `
                <tr>
                    <td>${client.name || 'N/A'}</td>
                    <td>${client.email || 'N/A'}</td>
                    <td>${client.phone || 'N/A'}</td>
                    <td>${client.company || 'N/A'}</td>
                    <td>${new Date(client.createdAt).toLocaleDateString('es-ES')}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<p>No hay clientes registrados</p>'}
    </div>

    <div class="section">
        <h2>🎯 Leads (${totalLeads})</h2>
        ${totalLeads > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Estado</th>
                    <th>Origen</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
                ${leads.map(lead => `
                <tr>
                    <td>${lead.name || 'N/A'}</td>
                    <td>${lead.email || 'N/A'}</td>
                    <td>${lead.status || 'N/A'}</td>
                    <td>${lead.source || 'N/A'}</td>
                    <td>${new Date(lead.createdAt).toLocaleDateString('es-ES')}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<p>No hay leads registrados</p>'}
    </div>

    <div class="section">
        <h2>💰 Cotizaciones (${totalQuotations})</h2>
        ${totalQuotations > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Descripción</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
                ${quotations.map(quotation => `
                <tr>
                    <td>${quotation.clientName || 'N/A'}</td>
                    <td>${quotation.description ? quotation.description.substring(0, 50) + '...' : 'N/A'}</td>
                    <td>$${parseFloat(quotation.total || 0).toLocaleString()}</td>
                    <td>${quotation.status || 'N/A'}</td>
                    <td>${new Date(quotation.createdAt).toLocaleDateString('es-ES')}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<p>No hay cotizaciones registradas</p>'}
    </div>

    <div class="footer">
        <p>📱 CRM ProSeller - Sistema de Gestión de Relaciones con Clientes</p>
        <p>Generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
        <p style="margin-top: 10px;">
            <strong>Instrucciones:</strong> Para imprimir como PDF, use Ctrl+P (Cmd+P en Mac) y seleccione "Guardar como PDF"
        </p>
    </div>
</body>
</html>`;
}

module.exports = router;