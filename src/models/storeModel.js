const mongoose = require("mongoose");
const { Schema } = mongoose;

const storeSchema = new Schema(
  {
    name:      { type: String, required: true },
    ownerId:   { type: Schema.Types.ObjectId, required: true },
    city:      { type: String, required: true },
    district:  { type: String },
    address:   { type: String },
    phone:     { type: String },
    createdAt: { type: Date, required: true, default: Date.now }
  },
  { versionKey: false, timestamps: false }
);

module.exports = mongoose.model("store", storeSchema, "store");
