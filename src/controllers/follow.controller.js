const ModelUser = require("../models/userModel");

// SEGUIR
async function followUser(req, res) {
  try {
    const myId = req.userId || req.body.myId || req.query.myId;
    const targetId = req.params.id;

    if (!myId) {
      return res.status(401).json({ message: "No autenticado" });
    }
    if (myId === targetId) {
      return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
    }

    const me = await ModelUser.findById(myId);
    const target = await ModelUser.findById(targetId);

    if (!me || !target) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si ya lo sigo, no hacemos nada raro
    const yaSigo = me.following.some(id => String(id) === String(targetId));
    if (yaSigo) {
      return res.json({ message: "Ya sigues a este usuario" });
    }

    me.following.push(targetId);
    me.followingCount += 1;

    target.followers.push(myId);
    target.followersCount += 1;

    await me.save();
    await target.save();

    res.json({ message: "Ahora sigues a este usuario" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al seguir usuario" });
  }
}

// DEJAR DE SEGUIR
async function unfollowUser(req, res) {
  try {
    const myId = req.userId || req.body.myId || req.query.myId;
    const targetId = req.params.id;

    if (!myId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const me = await ModelUser.findById(myId);
    const target = await ModelUser.findById(targetId);

    if (!me || !target) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    me.following = me.following.filter(id => String(id) !== String(targetId));
    target.followers = target.followers.filter(id => String(id) !== String(myId));

    // Recalcular contadores por si acaso
    me.followingCount = me.following.length;
    target.followersCount = target.followers.length;

    await me.save();
    await target.save();

    res.json({ message: "Has dejado de seguir a este usuario" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al dejar de seguir usuario" });
  }
}

// ESTADO DE SEGUIMIENTO
async function followStatus(req, res) {
  try {
    const myId = req.userId || req.query.myId;
    const targetId = req.params.id;

    if (!myId) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const me = await ModelUser.findById(myId).select("following");
    if (!me) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isFollowing = me.following.some(id => String(id) === String(targetId));
    res.json({ isFollowing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener estado de follow" });
  }
}

module.exports = {
  followUser,
  unfollowUser,
  followStatus,
};
