
// Contr. de autenticación

const ModelUser = require("../models/userModel");
const ModelStore = require("../models/storeModel");

// 1) Contr. de vistas (para web.routes.js)


// Mostrar pantalla de login
module.exports.mostrarLogin = (req, res) => {
  res.render("login");   // views/login.ejs
};

// Mostrar pantalla de registro
module.exports.mostrarRegistro = (req, res) => {
  res.render("register");  
};

// 2) Contr. de API (para index.routes.js)

// REGISTRO (API)

module.exports.registrarUsuario = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      tipoCuenta,
      name,
      bio,
      storeName,
      storeCity,
      storeDistrict,
      storeAddress,
      storePhone
    } = req.body;

    // Validación mínima
    if (!username || !email || !password || !tipoCuenta) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Crear usuario
    const nuevoUsuario = new ModelUser({
      username,
      email,
      password,
      tipoCuenta,
      name,
      bio
    });

    const usuarioGuardado = await nuevoUsuario.save();

    // Crear tienda si el usuario es NEGOCIO
    if (tipoCuenta === "NEGOCIO") {
      const nuevaTienda = new ModelStore({
        name: storeName,
        ownerId: usuarioGuardado._id,
        city: storeCity,
        district: storeDistrict,
        address: storeAddress,
        phone: storePhone
      });

      await nuevaTienda.save();
    }

    return res.status(200).json({
      message: "Usuario registrado correctamente",
      userId: usuarioGuardado._id
    });

  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ message: "Error en el servidor", error });
  }
};


// ----------------------------
// LOGIN (API)
// ----------------------------
module.exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await ModelUser.findOne({ email, password });

    if (!usuario) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    return res.status(200).json({
      message: "Login exitoso",
      userId: usuario._id,
      username: usuario.username,
      tipoCuenta: usuario.tipoCuenta
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error en el servidor", error });
  }
};
