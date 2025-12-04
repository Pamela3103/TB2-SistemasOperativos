const mongoose= require("mongoose");

mongoose.connect("mongodb://localhost:27019/redSocial_abarrotes")
.then( db=> console.log("DB is connected to", db.connection.host))
.catch( err=> console.error(err));