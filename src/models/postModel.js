const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    authorId:      { type: Schema.Types.ObjectId, ref: "user", required: true },
    storeId:       { type: Schema.Types.ObjectId },
    productId:     { type: Schema.Types.ObjectId },
    promoId:       { type: Schema.Types.ObjectId },
    content:       { type: String, required: true },
    media:         [{ type: String }],
    visibility:    { type: String },
    likesCount:    { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    createdAt:     { type: Date, required: true, default: Date.now }
  },
  { versionKey: false, timestamps: false }
);

module.exports = mongoose.model("post", postSchema, "post");
