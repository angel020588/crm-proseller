const { Role } = require("../models");

// Crear un nuevo rol
exports.crearRol = async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "El nombre del rol es obligatorio" });
    }

    const [role, created] = await Role.findOrCreate({
      where: { name },
      defaults: { displayName, description, permissions },
    });

    if (!created) {
      return res.status(409).json({ message: "El rol ya existe" });
    }

    res.status(201).json({ message: "Rol creado correctamente", role });
  } catch (error) {
    console.error("Error al crear rol:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

// Obtener todos los roles
exports.obtenerRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json({ roles });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener roles", error: error.message });
  }
};

// Obtener un rol por ID
exports.obtenerRolPorId = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }
    res.json({ role });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener rol", error: error.message });
  }
};

// Actualizar un rol por ID
exports.actualizarRol = async (req, res) => {
  try {
    const { displayName, description, permissions } = req.body;

    const [updated] = await Role.update(
      { displayName, description, permissions },
      { where: { id: req.params.id } },
    );

    if (!updated) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    const rolActualizado = await Role.findByPk(req.params.id);
    res.json({ message: "Rol actualizado correctamente", rol: rolActualizado });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar rol", error: error.message });
  }
};

// Eliminar un rol por ID
exports.eliminarRol = async (req, res) => {
  try {
    const deleted = await Role.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    res.json({ message: "Rol eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar rol", error: error.message });
  }
};
