const mongoose = require("mongoose");
const { Schema } = mongoose;

const promotionSchema = new Schema(
  {
    storeId:    { type: Schema.Types.ObjectId, required: true },
    products:   { type: Schema.Types.ObjectId, required: true },

    title:      { type: String, required: true },
    startsAt:   { type: Date, required: true },
    endsAt:     { type: Date, required: true },
    createdAt:  { type: Date, required: true, default: Date.now }
  },
  { versionKey: false, timestamps: false }
);

module.exports = mongoose.model("promotion", promotionSchema, "promotion");
