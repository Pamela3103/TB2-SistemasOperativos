// src/index.js
const express = require('express');
const app = express();
const path = require("path");
require('./database');

// --- Motor de vistas (EJS) ---
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// --- Middlewares para el body ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Para leer JSON


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Archivos estáticos ---
app.use(express.static(__dirname + "/public"));

// --- Rutas de la capa de presentación (VISTAS) ---
const webRoutes = require("./routes/web.routes");
app.use(webRoutes);               // aquí van /, /login, /register, /feed, etc.

// --- Rutas de la API ---
const apiRoutes = require("./routes/index.routes");
app.use(apiRoutes);

// --- Levantar servidor ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server Up on port ${PORT}`);
});
