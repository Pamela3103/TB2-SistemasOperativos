const mongoose = require("mongoose");
const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    postId:     { type: Schema.Types.ObjectId, required: true },
    userId:     { type: Schema.Types.ObjectId, required: true },
    createdAt:  { type: Date, required: true, default: Date.now }
  },
  { versionKey: false, timestamps: false }
);

module.exports = mongoose.model("like", likeSchema, "like");
