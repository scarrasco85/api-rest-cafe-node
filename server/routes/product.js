const express = require('express');
const { verifyToken, verifyAdminRole } = require('../middlewares/authentication');
const Product = require('../models/product');
const Category = require('../models/category');

let app = express();

//=================================================================
//  /product: Get all products
//=================================================================
app.get('/product', (req, res) => {

    // Pagination
    let from = req.query.desde || 0;
    from = Number(from);
    let showByPage = req.query.showByPage || 10;
    showByPage = Number(showByPage);

    //Mongoose search: active products
    Product.find({ active: true })
        .skip(from)
        .limit(showByPage)
        .sort('name')
        .populate('idUser', 'name email')
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
app.get('/product/:id', async(req, res) => {

    try {

        let productDB = await Product.findById({ _id: req.params.id })
            .populate('idUser')
            .populate('idCategory');

        if (!productDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Id does not correspond to any product.'
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
                message: 'Internal error, the id format may not be correct.',
                err
            }
        });
    }
});

//=================================================================
//  /product/: Search for products by 'name' field based on a search parameter 'searching'
//=================================================================
app.get('/product/search/:searching', verifyToken, (req, res) => {

    let searching = req.params.searching;

    let regex = new RegExp(searching, 'i');

    Product.find({ name: regex })
        .populate('idUser', 'name email')
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
//  /produtc: Create a product
//=================================================================
app.post('/product', verifyToken, async(req, res) => {

    let { name, description, img, active, idCategory } = req.body;
    let unitPrice = parseFloat(req.body.unitPrice).toFixed(2);
    console.log({ unitPrice });

    let product = new Product({

        name,
        unitPrice,
        description,
        img,
        active,
        idCategory,
        idUser: req.user._id
    });

    try {

        let categoryBD = await Category.findById({ _id: idCategory })

        if (!categoryBD) {
            return res.status(400).json({
                ok: false,
                message: `The category provided does not exist in the DB.`
            });
        }

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
                        message: 'An unexpected error occurred while creating the product.',
                        err
                    }
                });
            }

            res.status(201).json({
                ok: true,
                message: 'The product has been created successfully.',
                product: productDB
            });
        });

    } catch (err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Internal error, the id format may not be correct.',
                    err
                }
            });
        }
    }

});


//=================================================================
//  /produtc: Update a product by ID
//=================================================================
app.put('/product/:id', verifyToken, async(req, res) => {

    let body = req.body;
    let id = req.params.id;

    try {

        let product = await Product.findByIdAndUpdate({ _id: id }, body, { new: true, runValidators: true, context: 'query', useFindAndModify: false })

        if (!product) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Id does not correspond to any product.'
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
                message: 'Internal error, the id format may not be correct.',
                err
            }
        });
    }

});

//=================================================================
//  /produtc: Delete a product by ID
//=================================================================
app.delete('/product/:id', [verifyToken, verifyAdminRole], (req, res) => {

    Product.findByIdAndDelete({ _id: req.params.id })
        .exec((err, productDeleted) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Internal error, the id format may not be correct.',
                        err
                    }
                });
            }

            if (!productDeleted) {

                return res.json({
                    ok: false,
                    message: `There is no product with this ID: ${ req.params.id }`
                });
            }

            res.json({
                ok: true,
                message: 'Product has been successfully removed.',
                productDeleted

            });
        });
});

module.exports = app;