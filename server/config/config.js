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
    urlDB = 'mongodb+srv://poliche:8BO7yLHRvBJ2varX@cluster0.akhps.mongodb.net/cafe';
}

//URLDB es un environment que nos inventamos nosotros, no está creado. La vamos a usar para establecer la cadena
//de la base de datos
process.env.URLDB = urlDB;