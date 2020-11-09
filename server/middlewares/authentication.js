//Librería jsonwebtoken
const jwt = require('jsonwebtoken');



//=================================================================
//  Verificar token
//=================================================================

//El next lo que hará es continuar con la ejecución del programa
let verifyToken = (req, res, next) => {

    //Con req.get('nombre-header') obtenemos el header que hemos enviado en la petición. Este es un header 
    //personalizado al que hemos llamado token, podriamos llamarle authorization,autentication o como quisiéramos
    let token = req.get('token');

    //.verify() función de la librería jsonwebtoken para verificar tokens, recibe el token, la semilla de autenticación
    //y un callback que devuelve error o la información decodificada, el decoded será el 'payload' con la información
    //que especificaramos en la creacion del token, es decir, la información del usuario(archivo login.js)
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        //Puede devolver un error porque el token no exista, esté expirado, la firma no sea correcta o cualquier
        //otro error. 
        if (err) {
            //Error 401 es un 'No autorization', error de autorización
            return res.status(401).json({
                ok: false,
                err: err
            });
        }

        //Si no ha habido error hacemos que cualquier petición pueda tener acceso a la información del usuario 
        //después de haber pasado por este 'verifyToken'. Lo hacemos de la siguiente manera, en el objeto que 
        //encriptamos en login.js viene el usuario, por eso lo recogemos así.
        req.usuario = decoded.usuario;
        //next() tiene que ir dentro de la función jwt.verify() porque si lo ponemos fuera se va a ejecutar
        //siempre aunque el token no sea válido y siempre continuará la petición mostrando la información del
        //usuario
        next();
    });

}

module.exports = {
    verifyToken
}