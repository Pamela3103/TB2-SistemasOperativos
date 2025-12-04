// src/controllers/feed.controller.js
const ModelPost = require("../models/postModel");
const ModelUser = require("../models/userModel");

// Muestra el feed principal ordenado por popularidad (likes) y fecha
module.exports.mostrarFeed = async (req, res) => {
  try {
    const posts = await ModelPost.find({})
      .sort({ likesCount: -1, createdAt: -1 }) // más likes primero, luego más recientes
      .populate("authorId", "username name profilePhoto")
      .lean();

    res.render("feed", { posts });
  } catch (error) {
    console.error("Error al cargar el feed:", error);
    res.status(500).send("Error al cargar el feed");
  }
};
