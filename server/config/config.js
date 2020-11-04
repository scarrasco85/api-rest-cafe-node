//============= Port ===================================
process.env.PORT = process.env.PORT || 3000;


//============== Entorno - Environment =================
//Si no existe esa variable quiere decir que estamos en desarrollo
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//============== BBDD ==================================
//Configuración BBDD para entorno de desarrollo y producción con base de datos en el servicio MongoDB Atlas
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //Hemos definido una variable de entorno en Heroku llamada 'MONGODB_URL' para que cuando subamos el proyecto
    //a git hub no podamos ver la cadena de conexión y datos de acceso a la base de datos. Para crear una variable
    //de entorno en heroku ver video del curso "Node: de cero a experto": 113.Variables de entorno personalizadas
    //en heroku
    urlDB = process.env.MONGODB_URL;
}

//URLDB es un environment que nos inventamos nosotros, no está creado. La vamos a usar para establecer la cadena
//de la base de datos
process.env.URLDB = urlDB;