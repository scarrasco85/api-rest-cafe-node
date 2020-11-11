const express = require('express');
const Category = require('../models/category');
//Middleware personalizado autenticacion por tokens
const { verifyToken, verifyAdminRole } = require('../middlewares/authentication');


const app = express();


//=================================================================
//  /category: Mostrar todas las categorías
//=================================================================
app.get('/category', (req, res) => {

    // Pagination
    let from = req.query.desde || 0;
    from = Number(from);
    let perPage = req.query.perPage || 10;
    perPage = Number(perPage);

    //Mongoose search
    Category.find({})
        .skip(from)
        .limit(perPage)
        .exec((err, categories) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categories
            });
        });
});

//=================================================================
//  /category: Mostrar una categoría por ID
//=================================================================
app.get('/category:id', (req, res) => {

    //Category.findById()
    //req.usuario._id (id de persona con token valido)
});


//=================================================================
//  /category: Borrar una categoría
//=================================================================
app.delete('/category:id', (req, res) => {
    //solo un administrador puee borrar una categoría, debe pedir el token
});



module.exports = app;