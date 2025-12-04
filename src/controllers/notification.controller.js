const ModelNotification = require("../models/notification");
const ModelUser = require("../models/userModel");

const obtenerNotificaciones = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId es obligatorio" });
    }

    const notifs = await ModelNotification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const fromIds = [
      ...new Set(
        notifs
          .map((n) => n.data && n.data.fromUserId && String(n.data.fromUserId))
          .filter(Boolean)
      ),
    ];

    const users = await ModelUser.find({ _id: { $in: fromIds } })
      .select("name username")
      .lean();

    const userMap = {};
    users.forEach((u) => {
      userMap[String(u._id)] = u;
    });

    const result = notifs.map((n) => ({
      _id: n._id,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      data: {
        ...n.data,
        fromUser: n.data && n.data.fromUserId
          ? userMap[String(n.data.fromUserId)] || null
          : null,
      },
    }));

    return res.json({ notifications: result });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener notificaciones", error: error.message });
  }
};

const marcarNotificacionesLeidas = async (req, res) => {
  try {
    const { userId } = req.params;

    await ModelNotification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    return res.json({ message: "Notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("Error al marcar notificaciones:", error);
    return res.status(500).json({
      message: "Error al marcar notificaciones como leídas",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerNotificaciones,
  marcarNotificacionesLeidas,
};
