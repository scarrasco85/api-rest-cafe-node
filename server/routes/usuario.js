const express = require('express');
//Aquí usamos la nomenclatura con 'Usuario' con mayúscula porque se usará para crear nuevos objetos del esquema
//Usuario con la palabra reservada New
const Usuario = require('../models/usuario');
//módulo para encriptar contraseñas
const bcrypt = require('bcrypt');

const app = express();


app.get('/usuario', function(req, res) {
    res.json('get usuario');
});

app.post('/usuario', function(req, res) {
    let body = req.body;

    //Esto crea una nueva instancia del esquema Usuario con todas la propiedades y métodos que trae mongoose
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        //.hashSync es una función sincrona, no es ni promesa ni callback. El primer parámetro es la contraseña
        //que queremos encriptar y el segundo el número de vueltas que hará para encriptarla
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //Método .save() de mongo es para insertar en la base de datos
    usuario.save((err, usuarioDB) => {
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
            mensaje: 'Usuario creado correctamente',
            usuario: usuarioDB
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

app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;
    let body = req.body;

    //La opción new:true hace que el usuario que se devuelve en el callback después de actualizar 'usuarioDB'
    //sea el nuevo usuario ya actualizado
    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioDB) => {

        //Si hay un error ponemos el return para que no siga ejecutando el código
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }

        res.json({
            ok: true,
            mensaje: 'Usuario actualizado correctamente',
            usuario: usuarioDB
        });
    });

    // res.json({
    //     id
    // });
});

app.delete('/usuario', function(req, res) {
    res.json('delete usuario');
});

module.exports = app;