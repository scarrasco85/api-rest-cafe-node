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
        .sort('name')
        //populate: consulta que ObjectID existe en la categoría que estoy consultando y carga la información
        //de ese ObjectID, en este caso del usuario que creó la categoría
        .populate('user', 'nombre email')
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
app.get('/category/:id', async(req, res) => {

    try {

        let categoryDB = await Category.findById({ _id: req.params.id })
            .populate('user');

        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no corresponde con ninguna categoría'
                }
            });
        }

        res.json({
            ok: true,
            categoryDB
        });


    } catch (err) {

        return res.status(500).json({
            ok: false,
            err: {
                message: 'Error interno, es posible que el formado del id no sea el correcto',
                err
            }
        });
    }

});


//=================================================================
//  /category: Crear nueva categoría - Sólo usuarios registrados y ADMIN_ROLE
//=================================================================
app.post('/category', [verifyToken, verifyAdminRole], (req, res) => {

    let { name, description } = req.body;
    let category = new Category({
        name,
        description,
        user: req.usuario._id
    });


    category.save((err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Error al crear la categoría',
                    err
                }
            });
        }
        res.json({
            ok: true,
            message: 'La categoría ha sido creada correctamente.',
            category: categoryDB
        });
    });
});

//=================================================================
//  /category: Actualizar categoría por ID - Sólo usuarios registrados y ADMIN_ROLE
//=================================================================
app.put('/category/:id', async(req, res) => {

    let body = req.body;
    let id = req.params.id;

    // Category.findByIdAndUpdate(id, body, { new: true }, (err, categoryUpdated) => {

    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     if (!categoryUpdated) {
    //         return res.json({
    //             ok: true,
    //             message: 'El id proporcionado no corresponde con ninguna categoría'
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         message: 'Categoria actualizada correctamente',
    //         categoria: categoryUpdated
    //     });
    // });

    // let category = await Category.findByIdAndUpdate({ _id: id }, body, { new: true, runValidators: true, useFindAndModify: false })
    //     .catch(err => {
    //         return res.status(500).json({
    //             ok: false,
    //             err: {
    //                 message: 'Error interno, es posible que el formado del id no sea el correcto',
    //                 err
    //             }
    //         });
    //     });

    // if (!category) {
    //     return res.status(400).json({
    //         ok: false,
    //         err: {
    //             message: 'El id no corresponde con ninguna categoría'
    //         }
    //     });
    // }

    // res.json({
    //     ok: true,
    //     category
    // });

    try {

        let category = await Category.findByIdAndUpdate({ _id: id }, body, { new: true, runValidators: true, context: 'query', useFindAndModify: false })

        if (!category) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no corresponde con ninguna categoría'
                }
            });
        }

        res.json({
            ok: true,
            category
        });

    } catch (err) {
        return res.status(500).json({
            ok: false,
            err: {
                message: 'Error interno, es posible que el formado del id no sea el correcto',
                err
            }
        });
    }

});

//=================================================================
//  /category: Borrar una categoría
//=================================================================
app.delete('/category/:id', [verifyToken, verifyAdminRole], (req, res) => {
    //solo un administrador puee borrar una categoría, debe pedir el token
    //let categoryDeleted = await Category.findByIdAndDelete({ _id: req.params.id })
    Category.findByIdAndDelete({ _id: req.params.id })
        .exec((err, categoryDeleted) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Error interno, es posible que el formado del id no sea el correcto',
                        err
                    }
                });
            }

            if (!categoryDeleted) {

                return res.json({
                    ok: false,
                    message: `No existe una categoría con el id ${ req.params.id }`
                });
            }

            res.json({
                ok: true,
                message: 'La categoría ha sido eliminada correctamente',
                categoryDeleted

            });
        });
});



module.exports = app;