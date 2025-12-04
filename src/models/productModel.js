const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    storeId:    { type: Schema.Types.ObjectId, required: true },
    name:       { type: String, required: true },
    category:   { type: String, required: true },
    brand:      { type: String },
    unit:       { type: String },
    price:      { type: Number, required: true },
    image:      { type: String },
    createdAt:  { type: Date, required: true, default: Date.now }
  },
  { versionKey: false, timestamps: false }
);

module.exports = mongoose.model("product", productSchema, "product");
