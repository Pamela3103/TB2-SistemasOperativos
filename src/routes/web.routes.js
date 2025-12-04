const express = require("express");
const router = express.Router();

// Controllers de vistas
const { mostrarLogin, mostrarRegistro } = require("../controllers/auth.controller");
const { mostrarFeed } = require("../controllers/feed.controller");
const { mostrarPerfil } = require("../controllers/profile.controller");

// Página inicial → redirige al login (o al feed si luego quieres)
router.get("/", (req, res) => {
  res.redirect("/login");
});

// Pantalla de login
router.get("/login", mostrarLogin);

// Pantalla de registro
router.get("/register", mostrarRegistro);

// Vista del feed principal
router.get("/feed", mostrarFeed);


// Vista de perfil del usuario logueado
router.get("/profile", mostrarPerfil);

// Vista para editar perfil
router.get("/settings/profile", (req, res) => {
  res.render("editProfile");
});

// Vista para ver la tienda de un usuario
router.get("/store/:id", (req, res) => {
  res.render("store");      // views/store.ejs
});

// Perfil propio
router.get("/profile", mostrarPerfil);

// Perfil de otro usuario
router.get("/profile/:id", mostrarPerfil);


module.exports = router;
