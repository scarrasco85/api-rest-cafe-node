const mongoose = require('mongoose');

let Schema = mongoose.Schema;

//Declaramos el Esquema de la colección usuario
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE'
    },
    estado: {
        type: Boolean,
        default: true
    },
    //si el usuario no se crea con la identificación de Google, será un usuario normal y la propiedad google siempre
    //estará en false
    google: {
        type: Boolean,
        default: false
    }
});

//Exportamos el esquema con el nombre de Usuario, que tendrá la configuración de 'usuarioSchema'
module.exports = mongoose.model('Usuario', usuarioSchema);