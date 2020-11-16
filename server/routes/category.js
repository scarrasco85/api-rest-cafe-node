const express = require('express');
const Category = require('../models/category');
const { verifyToken, verifyAdminRole } = require('../middlewares/authentication');

const app = express();


//=================================================================
//  /category: Show all categories
//=================================================================
app.get('/category', (req, res) => {

    // Pagination
    let from = req.query.from || 0;
    from = Number(from);
    let perPage = req.query.perPage || 10;
    perPage = Number(perPage);

    //Mongoose search
    Category.find({})
        .skip(from)
        .limit(perPage)
        .sort('name')
        .populate('user', 'name email')
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
// /category: Show a category by ID
//=================================================================
app.get('/category/:id', async(req, res) => {

    try {

        let categoryDB = await Category.findById({ _id: req.params.id })
            .populate('user');

        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Id does not correspond to any category.'
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
                message: 'Internal error, the id format may not be correct.',
                err
            }
        });
    }

});


//=================================================================
//  /category: Create a new category
//=================================================================
app.post('/category', [verifyToken, verifyAdminRole], (req, res) => {

    let { name, description } = req.body;
    let category = new Category({
        name,
        description,
        user: req.user._id
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
                    message: 'An unexpected error occurred while creating the category.',
                    err
                }
            });
        }
        res.json({
            ok: true,
            message: 'The category has been created successfully.',
            category: categoryDB
        });
    });
});

//=================================================================
//  /category: Update a category by ID
//=================================================================
app.put('/category/:id', async(req, res) => {

    let body = req.body;
    let id = req.params.id;

    try {

        let category = await Category.findByIdAndUpdate({ _id: id }, body, { new: true, runValidators: true, context: 'query', useFindAndModify: false })

        if (!category) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Id does not correspond to any category.'
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
                message: 'Internal error, the id format may not be correct.',
                err
            }
        });
    }

});

//=================================================================
//  /category: Delete a category
//=================================================================
app.delete('/category/:id', [verifyToken, verifyAdminRole], (req, res) => {

    Category.findByIdAndDelete({ _id: req.params.id })
        .exec((err, categoryDeleted) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Internal error, the id format may not be correct.',
                        err
                    }
                });
            }

            if (!categoryDeleted) {

                return res.json({
                    ok: false,
                    message: `There is no category with this ID: ${ req.params.id }.`
                });
            }

            res.json({
                ok: true,
                message: 'Category has been successfully removed.',
                categoryDeleted

            });
        });
});


module.exports = app;