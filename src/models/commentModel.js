const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    postId:     { type: Schema.Types.ObjectId, required: true },
    authorId:   { type: Schema.Types.ObjectId, required: true },
    content:    { type: String, required: true },
    createdAt:  { type: Date, required: true, default: Date.now }
  },
  { versionKey: false, timestamps: false }
);

module.exports = mongoose.model("comment", commentSchema, "comment");
