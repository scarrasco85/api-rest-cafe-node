const express = require('express');
//Aquí usamos la nomenclatura con 'Usuario' con mayúscula porque se usará para crear nuevos objetos del esquema
//Usuario con la palabra reservada New
const User = require('../models/user');
//Middleware personalizado autenticacion por tokens
const { verifyToken, verifyAdminRole } = require('../middlewares/authentication');
//módulo para encriptar contraseñas
const bcrypt = require('bcrypt');
//Libreria underscore
const _ = require('underscore');
//const usuario = require('../models/usuario');

const app = express();

//Servicio que devuelve los usuarios de la base de datos con paginación y filtros pasados por parámetros opcionales
app.get('/user', verifyToken, (req, res) => {

    //los parámetros opcionales vienen en req.query, si no viene el parámetro desde lo establecemos a cero para
    //que se muestre desde el primer registro
    // Pagination
    let from = req.query.from || 0;
    from = Number(from);
    let perPage = req.query.perPage || 5;
    perPage = Number(perPage);
    //Con el método find definimos los filtros, si se pasa objeto vacío devolverá todos los usuarios de la colección
    //El segundo parámetro es una cadena de texto con los campos que queremos que devuelva la búsqueda, si no se
    //denine ninguno devolverá todos los campos
    //.exec() ejecuta find({}) con el filtro definido. Aquí muestra sólo los usuario activos
    User.find({ active: true }, 'name email role active google img')
        .skip(from) //Se salta el número de registros pasados por parámetro
        .limit(perPage) //Muestra los siguientes x registros pasados por parámetro
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: err
                });
            }

            //Con .count() contamos la cantidad de registros que devuelve la búsqueda para el mismo filtro 
            //utilizado en .find({}), y lo añadimos también en la respuesta
            User.count({ active: true }, (err, total) => {
                res.json({
                    ok: true,
                    users: users,
                    total: total
                });
            });

        });
});

app.post('/user', [verifyToken, verifyAdminRole], function(req, res) {
    let body = req.body;

    //Esto crea una nueva instancia del esquema Usuario con todas la propiedades y métodos que trae mongoose
    let user = new User({
        name: body.name,
        email: body.email,
        //.hashSync es una función sincrona, no es ni promesa ni callback. El primer parámetro es la contraseña
        //que queremos encriptar y el segundo el número de vueltas que hará para encriptarla
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //Método .save() de mongo es para insertar en la base de datos
    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        //En la response ponemos la propiedad password a null para no mostrar información de la contraseña
        //aunque esté encriptada en el objeto que devolvemos.Ésta sería una forma válida de no mostrar la contraseña
        //pero mostraría el nombre del campo 'password'. Es mejor hacerlo como en el Schema 'models/usuario.js' donde
        //modificamos el método toJSON para quitar la propiedad password de la respuesta antes de mostrarla
        //usuarioDB.password = null;

        //Cuando sale bien en realidad podemos no mandar el status(200) ya que va implícito en la respuesta
        return res.status(200).json({
            ok: true,
            mensaje: 'User created successfully',
            user: userDB
        });
    });


    // if (body.nombre === undefined) {

    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     });

    // } else {

    //     res.json({
    //         persona: body
    //     });
    // }

});

app.put('/user/:id', [verifyToken, verifyAdminRole], function(req, res) {

    let id = req.params.id;
    //Usamos la función .pick de la libreria underscore que devuelve un objeto sólo con las propiedades que se
    //pasan en un array como segundo argumento. Así en body sólo tendremos parámetros que se pueden actualizar
    //directamente con POSTMAN, evitaremos campos como 'password' que irá encriptada cuando se crea el usuario o
    //se controlará de otra forma. O el campo 'google' que tampoco debería poder actualizarse desde Postman
    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'active']);

    //La opción new:true hace que el usuario que se devuelve en el callback después de actualizar 'usuarioDB'
    //sea el nuevo usuario ya actualizado. La opción runValidators es para que mongoose corra todas las validaciones
    //definidas en el esquema, así sólo se podrá actualizar si por ejemplo el rol es uno de los definidos en el esquema
    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {

        //Si hay un error ponemos el return para que no siga ejecutando el código
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        res.json({
            ok: true,
            message: 'User updated successfully',
            user: userDB
        });
    });

});

//Servicio que elimina un usuario por su id recibida por parámetro url
app.delete('/user/:id', [verifyToken, verifyAdminRole], function(req, res) {

    let id = req.params.id;

    User.findByIdAndRemove(id, (err, userDeleted) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!userDeleted) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: `User with id: ${ id } not found.`
                }
            });
        }

        res.json({
            ok: true,
            user: userDeleted
        });
    });
});

//Servicio que marca el estado de un usuario a false por su id recibida por parámetro url. Esto se suele hacer
//ahora en vez de eliminar registros, en vez de eliminarlo lo marcamos inactivo. Es como una simulación de eliminar
//un usuario
app.put('/user/:id/:active', function(req, res) {

    let id = req.params.id;

    User.findByIdAndUpdate(id, { active: false }, { new: true }, (err, userUpdated) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            userUpdated
        });
    });

});

module.exports = app;