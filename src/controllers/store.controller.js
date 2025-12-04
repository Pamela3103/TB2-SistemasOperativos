// src/controllers/store.controller.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const ModelStore = require("../models/storeModel");
const ModelProduct = require("../models/productModel");
const ModelPromotion = require("../models/promotionModel");

// =======================
// Subida de imagen Product
// =======================
const uploadsDir = path.join(__dirname, "..", "uploads", "products");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/\s+/g, "_");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Solo se permiten imágenes"), false);
  }
  cb(null, true);
}

const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// =======================
// GET: Catálogo de la tienda
// =======================
const obtenerCatalogo = async (req, res) => {
  try {
    const { id } = req.params; // id de la tienda

    const store = await ModelStore.findById(id).lean();
    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    const products = await ModelProduct.find({ storeId: id })
      .sort({ createdAt: -1 })
      .lean();

    const promotions = await ModelPromotion.find({ storeId: id })
      .sort({ startsAt: -1 })
      .lean();

    return res.json({ store, products, promotions });
  } catch (error) {
    console.error("Error en obtenerCatalogo:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener catálogo", error: error.message });
  }
};

// =======================
// CRUD PRODUCTOS (solo dueño)
// =======================
const crearProducto = async (req, res) => {
  try {
    const { storeId, name, category, brand, unit, price } = req.body;

    if (!storeId || !name || !category || !price) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const data = {
      storeId,
      name,
      category,
      brand,
      unit,
      price,
    };

    if (req.file) {
      data.image = `/uploads/products/${req.file.filename}`;
    }

    const product = new ModelProduct(data);
    const saved = await product.save();

    return res.status(201).json({
      message: "Producto creado correctamente",
      product: saved,
    });
  } catch (error) {
    console.error("Error crearProducto:", error);
    return res.status(500).json({ message: "Error al crear producto", error });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params; // id del producto
    const { name, category, brand, unit, price } = req.body;

    const update = { name, category, brand, unit, price };

    if (req.file) {
      update.image = `/uploads/products/${req.file.filename}`;
    }

    const updated = await ModelProduct.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.json({
      message: "Producto actualizado",
      product: updated,
    });
  } catch (error) {
    console.error("Error actualizarProducto:", error);
    return res.status(500).json({ message: "Error al actualizar producto", error });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ModelProduct.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error eliminarProducto:", error);
    return res.status(500).json({ message: "Error al eliminar producto", error });
  }
};

// =======================
// CRUD PROMOCIONES (solo dueño)
// =======================
const crearPromocion = async (req, res) => {
  try {
    const { storeId, products, title, startsAt, endsAt } = req.body;

    if (!storeId || !products || !title || !startsAt || !endsAt) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const promo = new ModelPromotion({
      storeId,
      products,
      title,
      startsAt,
      endsAt,
    });

    const saved = await promo.save();

    return res.status(201).json({
      message: "Promoción creada correctamente",
      promotion: saved,
    });
  } catch (error) {
    console.error("Error crearPromocion:", error);
    return res.status(500).json({ message: "Error al crear promoción", error });
  }
};

const actualizarPromocion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startsAt, endsAt, products } = req.body;

    const update = { title, startsAt, endsAt, products };

    const updated = await ModelPromotion.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Promoción no encontrada" });
    }

    return res.json({
      message: "Promoción actualizada",
      promotion: updated,
    });
  } catch (error) {
    console.error("Error actualizarPromocion:", error);
    return res.status(500).json({ message: "Error al actualizar promoción", error });
  }
};

const eliminarPromocion = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ModelPromotion.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Promoción no encontrada" });
    }

    return res.json({ message: "Promoción eliminada" });
  } catch (error) {
    console.error("Error eliminarPromocion:", error);
    return res.status(500).json({ message: "Error al eliminar promoción", error });
  }
};

module.exports = {
  obtenerCatalogo,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion,
  uploadProductImage,
};
