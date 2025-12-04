const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username:       { type: String, required: true },
    email:          { type: String, required: true, unique: true },
    password:       { type: String, required: true },

    tipoCuenta:     { 
      type: String,
      enum: ["USUARIO", "NEGOCIO"],
      required: true
    },

    name:           { type: String },
    bio:            { type: String },
    profilePhoto:   { type: String },

    // NUEVO: relaciones
    followers:      [{ type: Schema.Types.ObjectId, ref: "user" }],
    following:      [{ type: Schema.Types.ObjectId, ref: "user" }],

    // Tus contadores siguen igual
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postCount:      { type: Number, default: 0 },
    createdAt:      { type: Date, required: true, default: Date.now }
  },
  { versionKey: false, timestamps: false }
);


const ModelUser = mongoose.model("user", userSchema, "user");
//                      nombreModelo   esquema      nombreColeccionReal

module.exports = ModelUser;
