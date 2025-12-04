const express = require("express");
const router = express.Router();

const {
  registrarUsuario,
  loginUsuario
} = require("../controllers/auth.controller");

const {
  crearPost,
  uploadPostMedia,
  toggleLike,
  crearComentario,
  listarComentarios
} = require("../controllers/post.controller");

const {
  obtenerNotificaciones,
  marcarNotificacionesLeidas
} = require("../controllers/notification.controller");

const {
  obtenerPerfil,
  actualizarPerfil,
  uploadProfilePhoto 
} = require("../controllers/profile.controller");

const {
  obtenerCatalogo,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion,
  uploadProductImage
} = require("../controllers/store.controller");

const {
  followUser,
  unfollowUser,
  followStatus,
} = require("../controllers/follow.controller");


// Modelos
const ModelUser = require("../models/userModel");
const ModelPost = require("../models/postModel");
const ModelComment = require("../models/commentModel");
const ModelLike = require("../models/likeModel");
const ModelFollow = require("../models/followModel");
const ModelNotification = require("../models/notification");
const ModelStore = require("../models/storeModel");
const ModelProduct = require("../models/productModel");
const ModelPromotion = require("../models/promotionModel");


// --------- AUTH API ---------
router.post("/api/register", registrarUsuario);
router.post("/api/login", loginUsuario);

// --------- POSTS API ---------
router.post(
  "/api/posts",
  uploadPostMedia.single("image"),
  crearPost
);
router.post("/api/posts/:id/like", toggleLike);
router.post("/api/posts/:id/comments", crearComentario);
router.get("/api/posts/:id/comments", listarComentarios);

// --------- NOTIFICATIONS API ---------
router.get("/api/notifications/:userId", obtenerNotificaciones);
router.post("/api/notifications/:userId/read", marcarNotificacionesLeidas);

// --------- PROFILE API ---------

// Perfil completo: usuario + tienda + productos + posts
router.get("/api/profile/:id", obtenerPerfil);

// Obtener info básica de un usuario por ID (si la sigues usando)
router.get("/api/user/:id", async (req, res) => {
  try {
    const user = await ModelUser.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuario", error });
  }
});

// Actualizar perfil
router.post(
  "/api/profile/update",
  uploadProfilePhoto.single("profilePhoto"),
  actualizarPerfil
);

// --------- STORE / CATÁLOGO API ----------
// Obtener catálogo completo (store + products + promotions)
router.get("/api/store/:id/catalog", obtenerCatalogo);

// Productos (solo dueño, la validación de dueño la puedes agregar luego con middleware)
router.post(
  "/api/products",
  uploadProductImage.single("image"),
  crearProducto
);
router.put(
  "/api/products/:id",
  uploadProductImage.single("image"),
  actualizarProducto
);
router.delete("/api/products/:id", eliminarProducto);

// Promociones
router.post("/api/promotions", crearPromocion);
router.put("/api/promotions/:id", actualizarPromocion);
router.delete("/api/promotions/:id", eliminarPromocion);

// ACTUALIZAR TIENDA
router.put("/api/store/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, district, city, phone } = req.body;

    const update = { name, address, district, city, phone };

    const store = await ModelStore.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!store) {
      return res.status(404).json({ message: "Tienda no encontrada" });
    }

    res.json({
      message: "Tienda actualizada correctamente",
      store,
    });
  } catch (error) {
    console.error("Error al actualizar tienda:", error);
    res.status(500).json({
      message: "Error al actualizar la tienda",
      error: error.message,
    });
  }
});

// BUSCADOR GLOBAL (tiendas + personas)
router.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ users: [], stores: [] });

    const regex = new RegExp(q, "i");

    const stores = await ModelStore.find({
      name: { $regex: regex }
    }).select("name _id");

    const users = await ModelUser.find({
      name: { $regex: regex }
    }).select("name _id");

    res.json({ stores, users });

  } catch (err) {
    console.error("Error en /api/search:", err);
    res.status(500).json({ message: "Error en búsqueda" });
  }
});

// FOLLOW API
router.post("/api/follow/:id", followUser);
router.delete("/api/follow/:id", unfollowUser);
router.get("/api/follow/status/:id", followStatus);

// 404 final API
router.use((req, res) => {
  console.log("API 404:", req.method, req.originalUrl);
  res.status(404).json({ message: "Ruta de API no encontrada" });
});
module.exports = router;
