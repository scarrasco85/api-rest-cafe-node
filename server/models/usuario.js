const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//Forma de definir la lista de roles válidos y el mensaje de error que se devolverá. {VALUE} hará referencia
//a lo que el usuario haya introducido, si introduce en el campo rol un valor diferente a ADMIN_ROLE o USER_ROLE
//devolverá ese error. rolesValidos debe hacer referencia a la propiedad 'enum' de roles en el esquema
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

//Declaramos el Esquema de la colección usuario
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
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
        default: 'USER_ROLE',
        enum: rolesValidos
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

//Así podemos modificar el método de un esquema. Modificamos el método .toJSON del esquema ya que éste siempre
//se llama cuando va a imprimir la información en un JSON, es decir, se llama cuando se imprime una response. Así,
//cuando se inserte un usuario y se imprime la response, eliminaremos el campo contraseña del objeto que se imprime
usuarioSchema.methods.toJSON = function() {
    //cogemos la información que esté llamando al método
    let user = this;
    //convertimos la información a un objeto para tener todas sus propiedades y métodos
    let userObject = user.toObject();
    //Ya convertido a un objeto podemos eliminar la propiedad 'password' del objeto usando delete
    delete userObject.password;

    //devolvemos el objeto que .toJSON va a imprimir sin la propiedad 'password'
    return userObject;
}

//Aquí decimos a este esquema que use el plugin mongoose-unique-validator. En {PATH} mongoose inyectará el elemento
//que esté marcado en el esquema como 'unique: true' y falte para mostrarlo en el mensaje de error. Es decir si
//se repite un elemento que ya está introducido devolverá ese error. Ej: 'email debe ser único' ó 'dni debe ser único'
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

//Exportamos el esquema con el nombre de Usuario, que tendrá la configuración de 'usuarioSchema'
module.exports = mongoose.model('Usuario', usuarioSchema);