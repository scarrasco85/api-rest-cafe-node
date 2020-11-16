//============= Port ===================================
process.env.PORT = process.env.PORT || 3000;


//============== Entorno - Environment =================
// Production or development
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//=================================================================
//  Token expiration
//=================================================================
process.env.CADUCIDAD_TOKEN = "30d";

//=================================================================
//  Authentication Seed to generate the token
//=================================================================
process.env.SEED = process.env.SEED || 'este-es-el-secret-de-desarrollo';

//=================================================================
//  BDD config to production o development environment
//=================================================================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {

    // Environment variable in heroku or in production environment
    urlDB = process.env.MONGODB_URL;
}

process.env.URLDB = urlDB;

//=================================================================
//  Google Client ID
//=================================================================
process.env.CLIENT_ID = process.env.CLIENT_ID || '931880761498-sdmbkl7pcvliomek5v9e6ihg7p6ucusa.apps.googleusercontent.com';