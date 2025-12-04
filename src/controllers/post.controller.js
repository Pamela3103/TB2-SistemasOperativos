// controllers/post.controller.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const ModelPost = require("../models/postModel");
const ModelUser = require("../models/userModel");
const ModelLike = require("../models/likeModel");
const ModelComment = require("../models/commentModel");
const ModelNotification = require("../models/notification");

// ==========================
// CONFIGURACIÓN DE MULTER
// ==========================

const uploadsDir = path.join(__dirname, "..", "uploads", "posts");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .toLowerCase();
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${baseName}-${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Solo se permiten archivos de imagen"), false);
  }
  cb(null, true);
}

const uploadPostMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ==========================
// CREAR POST
// ==========================
const crearPost = async (req, res) => {
  try {
    const { authorId, content, visibility } = req.body;

    if (!authorId || !content) {
      return res
        .status(400)
        .json({ message: "authorId y content son obligatorios" });
    }

    const media = [];
    if (req.file) {
      const relativePath = `/uploads/posts/${req.file.filename}`;
      media.push(relativePath);
    }

    const nuevoPost = new ModelPost({
      authorId,
      content,
      visibility: visibility || "PUBLIC",
      media,
      createdAt: new Date(),
    });

    const postGuardado = await nuevoPost.save();

    ModelUser.findByIdAndUpdate(authorId, { $inc: { postCount: 1 } }).catch(
      (err) => console.warn("No se pudo actualizar postCount:", err)
    );

    return res.status(201).json({
      message: "Post creado correctamente",
      post: postGuardado,
    });
  } catch (error) {
    console.error("Error al crear post:", error);
    return res
      .status(500)
      .json({ message: "Error al crear el post", error: error.message });
  }
};

// ==========================
// LIKE / UNLIKE (toggle)
// ==========================
const toggleLike = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { userId } = req.body;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "postId y userId son obligatorios" });
    }

    const post = await ModelPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post no encontrado" });

    let like = await ModelLike.findOne({ postId, userId });

    if (like) {
      // quitar like
      await ModelLike.deleteOne({ _id: like._id });
      post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
      await post.save();

      return res.json({
        liked: false,
        likesCount: post.likesCount,
      });
    } else {
      // dar like
      like = await ModelLike.create({
        postId,
        userId,
        createdAt: new Date(),
      });

      post.likesCount = (post.likesCount || 0) + 1;
      await post.save();

      if (String(post.authorId) !== String(userId)) {
        await ModelNotification.create({
          userId: post.authorId,
          type: "LIKE",
          data: {
            postId: post._id,
            fromUserId: userId,
          },
          read: false,
          createdAt: new Date(),
        });
      }

      return res.json({
        liked: true,
        likesCount: post.likesCount,
      });
    }
  } catch (error) {
    console.error("Error al hacer like/unlike:", error);
    return res
      .status(500)
      .json({ message: "Error al procesar el like", error: error.message });
  }
};

// ==========================
// CREAR COMENTARIO
// ==========================
const crearComentario = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { authorId, content } = req.body;

    if (!postId || !authorId || !content) {
      return res
        .status(400)
        .json({ message: "postId, authorId y content son obligatorios" });
    }

    const post = await ModelPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post no encontrado" });

    const nuevoComentario = await ModelComment.create({
      postId,
      authorId,
      content,
      createdAt: new Date(),
    });

    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    if (String(post.authorId) !== String(authorId)) {
      await ModelNotification.create({
        userId: post.authorId,
        type: "COMMENT",
        data: {
          postId: post._id,
          fromUserId: authorId,
        },
        read: false,
        createdAt: new Date(),
      });
    }

    return res.status(201).json({
      message: "Comentario creado correctamente",
      comment: nuevoComentario,
      commentsCount: post.commentsCount,
    });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return res
      .status(500)
      .json({ message: "Error al crear comentario", error: error.message });
  }
};

// ==========================
// LISTAR COMENTARIOS DE UN POST
// ==========================
const listarComentarios = async (req, res) => {
  try {
    const { id: postId } = req.params;

    const comments = await ModelComment.find({ postId })
      .sort({ createdAt: 1 })
      .lean();

    if (!comments.length) {
      return res.json({ comments: [] });
    }

    const authorIds = [
      ...new Set(comments.map((c) => String(c.authorId))),
    ];

    const users = await ModelUser.find({ _id: { $in: authorIds } })
      .select("name username profilePhoto")
      .lean();

    const userMap = {};
    users.forEach((u) => {
      userMap[String(u._id)] = u;
    });

    const enriched = comments.map((c) => ({
      _id: c._id,
      content: c.content,
      createdAt: c.createdAt,
      author: userMap[String(c.authorId)] || null,
    }));

    return res.json({ comments: enriched });
  } catch (error) {
    console.error("Error al listar comentarios:", error);
    return res
      .status(500)
      .json({ message: "Error al listar comentarios", error: error.message });
  }
};

module.exports = {
  crearPost,
  uploadPostMedia,
  toggleLike,
  crearComentario,
  listarComentarios,
};
