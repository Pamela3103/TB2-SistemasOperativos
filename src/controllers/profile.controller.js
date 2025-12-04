// src/controllers/profile.controller.js
const ModelUser = require("../models/userModel");
const ModelStore = require("../models/storeModel");
const ModelProduct = require("../models/productModel");
const ModelPost = require("../models/postModel");

// Other required modules
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Carpeta para foto de perfil
const uploadsDir = path.join(__dirname, "..", "uploads", "profile");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = "pf-" + Date.now() + ext;
    cb(null, name);
  }
});
const uploadProfilePhoto = multer({ storage });


// Vista (solo renderiza la plantilla)
module.exports.mostrarPerfil = (req, res) => {
  res.render("profile"); // views/profile.ejs
};

// API: datos del perfil del usuario logueado
module.exports.obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.params; // /api/profile/:id

    const user = await ModelUser.findById(id).lean();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Tienda asociada (si es NEGOCIO)
    const store = await ModelStore.findOne({ ownerId: id }).lean();

    // Algunos productos de la tienda (si existe)
    let products = [];
    if (store) {
      products = await ModelProduct.find({ storeId: store._id })
        .limit(6)
        .lean();
    }

    // Últimos posts de ese usuario
    const posts = await ModelPost.find({ authorId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.json({ user, store, products, posts });
  } catch (error) {
    console.error("Error en obtenerPerfil:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener el perfil", error: error.message });
  }
};

// ---------- ACTUALIZAR PERFIL ----------
module.exports.actualizarPerfil = async (req, res) => {
  try {
    const { userId, name, username, bio } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Falta userId" });
    }

    const update = { name, username, bio };

    // Si subió imagen
    if (req.file) {
      update.profilePhoto = `/uploads/profile/${req.file.filename}`;
    }

    const updated = await ModelUser.findByIdAndUpdate(
      userId,
      update,
      { new: true }
    );

    return res.json({
      message: "Perfil actualizado",
      user: updated
    });

  } catch (error) {
    console.error("Error actualizarPerfil:", error);
    return res.status(500).json({ message: "Error al actualizar", error });
  }
};


module.exports.uploadProfilePhoto = uploadProfilePhoto;