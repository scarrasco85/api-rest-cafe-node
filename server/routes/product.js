const express = require('express');
const { verifyToken, verifyAdminRole } = require('../middlewares/authentication');
const Product = require('../models/product');
const Category = require('../models/category');

let app = express();

//=================================================================
//  /products: Obener todos los productos
//=================================================================
// populate: usuario, categoria
// paginado
app.get('/product', (req, res) => {

    // Pagination
    let from = req.query.desde || 0;
    from = Number(from);
    let perPage = req.query.perPage || 10;
    perPage = Number(perPage);

    //Mongoose search: active products
    Product.find({ active: true })
        .skip(from)
        .limit(perPage)
        .sort('name')
        .populate('idUser', 'nombre email')
        .populate('idCategory')
        .exec((err, products) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                products
            });
        });
});


//=================================================================
//  /produtcs: Get a product by ID
//=================================================================
// populate: usuario, categoria

app.get('/product/:id', async(req, res) => {

    try {

        let productDB = await Product.findById({ _id: req.params.id })
            .populate('idUser')
            .populate('idCategory');

        if (!productDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no corresponde con ningun producto'
                }
            });
        }

        res.json({
            ok: true,
            productDB
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
//  Search for products based on a search parameter 'searching'
//=================================================================
app.get('/product/search/:searching', verifyToken, (req, res) => {

    let searching = req.params.searching;
    //Nueva expresión regular basada en la búsqueda, pasando 'i' hacemos que sea insensible a mayúsculas y 
    //minúsculas
    let regex = new RegExp(searching, 'i');
    //console.log({regex});
    //Estamos buscando por nombre
    Product.find({ name: regex })
        .populate('idUser', 'nombre email')
        .populate('idCategory')
        .exec((err, products) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                products
            });
        });
});

//=================================================================
//  /produtcs: Create a product
//=================================================================
// grabar usuario
//grabar categoria: del listado de categorías
app.post('/product', verifyToken, async(req, res) => {

    let { name, description, active, idCategory } = req.body;
    let unitPrice = parseFloat(req.body.unitPrice).toFixed(2);
    console.log({ unitPrice });
    let unitPriceNumber = Number(req.body.unitPrice);
    console.log({ unitPriceNumber });

    let product = new Product({

        name,
        unitPrice,
        description,
        active,
        idCategory, //Comprobar que exista en BDD
        idUser: req.usuario._id
    });

    try {

        let categoryBD = await Category.findById({ _id: idCategory })

        if (!categoryBD) {
            return res.status(400).json({
                ok: false,
                message: `La categoría proporcionada no existe en la BBDD`
            });
        }

        //Si existe la categoría guardamos en la BBDD
        product.save((err, productDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Error al crear el producto',
                        err
                    }
                });
            }
            //201 se usa cuando se hace un nuevo registro
            res.status(201).json({
                ok: true,
                message: 'El producto ha sido creado correctamente.',
                product: productDB
            });
        });


    } catch (err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Es posible que haya un error con el formato de la categoría proporcionada',
                    err
                }
            });
        }
    }

});


//=================================================================
//  /produtcs: Update a product by ID
//=================================================================
// populate: usuario, categoria
app.put('/product/:id', verifyToken, async(req, res) => {

    let body = req.body;
    let id = req.params.id;


    try {

        let product = await Product.findByIdAndUpdate({ _id: id }, body, { new: true, runValidators: true, context: 'query', useFindAndModify: false })

        if (!product) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no corresponde con ningun producto'
                }
            });
        }

        res.json({
            ok: true,
            product
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


//===============================================================================================================
//  /produtcs: Delete a product by ID - It does not delete from the database, it modifies the active property
//===============================================================================================================
// populate: usuario, categoria
app.delete('/product/:id', [verifyToken, verifyAdminRole], (req, res) => {

    //solo un administrador puee borrar una categoría, debe pedir el token
    //let categoryDeleted = await Category.findByIdAndDelete({ _id: req.params.id })
    Product.findByIdAndDelete({ _id: req.params.id })
        .exec((err, productDeleted) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Error interno, es posible que el formado del id no sea el correcto',
                        err
                    }
                });
            }

            if (!productDeleted) {

                return res.json({
                    ok: false,
                    message: `No existe un producto con el id ${ req.params.id }`
                });
            }

            res.json({
                ok: true,
                message: 'El producto ha sido eliminado correctamente',
                productDeleted

            });
        });
});


module.exports = app;