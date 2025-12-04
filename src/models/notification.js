const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    type:   { type: String, required: true },

    data: {
      postId:     { type: Schema.Types.ObjectId },
      fromUserId: { type: Schema.Types.ObjectId }
    },

    read:      { type: Boolean, required: true, default: false },
    createdAt: { type: Date, required: true, default: Date.now }
  },
  { versionKey: false, timestamps: false }
);

module.exports = mongoose.model("notification", notificationSchema, "notification");

