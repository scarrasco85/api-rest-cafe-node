const express = require('express');
//módulo para encriptar contraseñas
const bcrypt = require('bcrypt');
//Librería jsonwebtoken
const jwt = require('jsonwebtoken');
//Librería para verificar token google
const { OAuth2Client } = require('google-auth-library');
//Definimos CLIENT_ID de google en el archivo /config/config.js
const client = new OAuth2Client(process.env.CLIENT_ID);

//Aquí usamos la nomenclatura con 'User' con mayúscula porque se usará para crear nuevos objetos del esquema
//User con la palabra reservada New
const User = require('../models/user');
const { isRegExp } = require('underscore');

const app = express();

//Creamos servicio o ruta 'POST' para el login del usuario
app.post('/login', (req, res) => {

    let body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {

        //El error solo saltará si hay una excepción en la consulta de base de datos, es decir que si el usuario
        //introduce un email incorrecto o que no existe devolverá un objeto vacío, no un error
        if (err) {
            //Error 500 sería un error del servidor
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Comprobamos si se ha devuelto un usuario vacío
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    //Aunque no estemos validando la contraseña aún, por seguridad es importante que el usuario
                    //no sepa si está fallando el usuario o la contraseña
                    message: `Username or password is incorrect`
                }
            });
        }
        //Validamos contraseña
        //.compareSync encripta la contraseña de primer parámetro y la compara con la contraseña encriptada ya
        //que está en la base de datos, es encriptación de una vía, no se puede volver a retornar el valor, sólo
        //comparar si encriptando se obtiene el mismo resultado. Devuelve true o false
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    //Aunque no estemos validando la contraseña aún, por seguridad es importante que el usuario
                    //no sepa si está fallando el usuario o la contraseña
                    message: `Username or password is incorrect`
                }
            });
        }

        //Generamos token válido para 30 días. SEED y CADUCIDAD_TOKEN configuradas en archivo config/config.js
        //ya que serán variables de entorno producción y desarrollo que no queremos que se muestre en el código.
        //Crearemos una variable de entorno en heroku SEED para cuando subamos el proyecto
        let token = jwt.sign({
            user: userDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            user: userDB,
            token: token
        });
    });



});

//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    //console.log({ payload });
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
//verify().catch(console.error);

//Servicio para login con Google Api
app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    //Función verify de Google
    let googleUser = await verify(token)
        //capturamos posible error en la verificación del token de google
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });
        });

    //Comprobamos si el usuario estaba registrado y demás
    User.findOne({ email: googleUser.email }, (err, userDB) => {

        //El error solo saltará si hay una excepción en la consulta de base de datos, es decir que si el usuario
        //introduce un email incorrecto o que no existe devolverá un objeto vacío, no un error
        if (err) {
            //Error 500 sería un error del servidor
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si existe el usuario en la base de datos
        if (userDB) {
            //Si no se ha registrado por google, pero está intentando autentificarse con Google, esto no debe
            //permitirse
            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'You are already registered in our system without using Google credentials, you must use your normal authentication.'
                    }
                });
                //Si se registró por Google anteriormente debemos renovar su token de nuestra aplicación para loguearlo  
            } else {

                //Generamos token válido para 30 días. SEED y CADUCIDAD_TOKEN configuradas en archivo config/config.js
                //ya que serán variables de entorno producción y desarrollo que no queremos que se muestre en el código.
                //Crearemos una variable de entorno en heroku SEED para cuando subamos el proyecto
                let token = jwt.sign({
                    user: userDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    user: userDB,
                    token: token
                });
            }

        } else {
            //Si el usuario no existe en nuestra base de datos deberemos crear un nuevo usuario en nuestra
            //base de datos con la propiedad 'google' = true para identificarlo como usuario registrado con las
            //credenciales de Google
            let user = new User();

            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            //Como el password en nuestro modelo es requerido, ponemos un password por defecto para los usuarios
            //de Google, no hay que preocuparse ya que cuando un usuario intente loguearse con un correo y este
            //password ':)', nunca hará match porque en la bbdd está encriptada
            user.password = ':)';

            //Grabamos usuario en bbdd
            user.save((err, userDB) => {

                if (err) {
                    //Error 500 sería un error del servidor
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                //Si la inserción ha sido correcta generamos el token y devolvemos la información del usuario
                let token = jwt.sign({
                    user: userDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    user: userDB,
                    token: token
                });
            });
        }
    });
    // res.json({
    //     googleUser
    // });
});



module.exports = app;