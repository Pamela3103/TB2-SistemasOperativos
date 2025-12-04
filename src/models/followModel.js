const mongoose = require("mongoose");
const { Schema } = mongoose;

const followSchema = new Schema(
  {
    followerId: { type: Schema.Types.ObjectId, required: true },
    followedId: { type: Schema.Types.ObjectId, required: true },
    createdAt:  { type: Date, required: true, default: Date.now }
  },
  { versionKey: false, timestamps: false }
);

module.exports = mongoose.model("follow", followSchema, "follow");
