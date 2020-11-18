const express = require('express');
const User = require('../models/user');
const { verifyToken, verifyAdminRole } = require('../middlewares/authentication');
// Password encryption library: bcrypt
const bcrypt = require('bcrypt');
// underscore library
const _ = require('underscore');
const { Mongoose } = require('mongoose');

const app = express();

//=================================================================
//  /user: Gets all active users
//=================================================================
app.get('/user', verifyToken, (req, res) => {

    // Pagination
    let from = req.query.from || 0;
    from = Number(from);
    let showByPage = req.query.showByPage || 5;
    showByPage = Number(showByPage);

    // Mongoose search
    User.find({ active: true }, 'name email role active google img')
        .skip(from)
        .limit(showByPage)
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: err
                });
            }

            // Total users
            User.count({ active: true }, (err, total) => {
                res.json({
                    ok: true,
                    users: users,
                    total: total
                });
            });

        });
});

//=================================================================
//  /user: Create a new user
//=================================================================
app.post('/user', function(req, res) {

    let body = req.body;

    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // Mongoose: The user is recorded in the database
    user.save((err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'User created successfully',
            user: userDB
        });
    });

});

//=================================================================
//  /user: Update a user
//=================================================================
app.put('/user/:id', [verifyToken, verifyAdminRole], function(req, res) {

    let id = req.params.id;

    // The 'pick' method of the 'underscore' library is used to obtain only the fields that are allowed to update
    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'active']);

    // The 'runValidators' option is used to make it use 'mongoose-unique-validator' which is imported into the 
    // schema model. This is responsible for the validations defined in the schema
    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        }

        res.json({
            ok: true,
            message: 'User updated successfully',
            user: userDB
        });
    });

});

//=================================================================
//  /user: Delete a user by ID
//=================================================================
app.delete('/user/:id', [verifyToken, verifyAdminRole], function(req, res) {

    let id = req.params.id;

    User.findByIdAndRemove(id, (err, userDeleted) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!userDeleted) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: `User with id: ${ id } not found.`
                }
            });
        }

        res.json({
            ok: true,
            user: userDeleted
        });
    });
});

//=================================================================
//  /user: Delete a user. But it doesn't physically delete but 
// rather updates its 'active' property to mark it as a desactivated user
//=================================================================
app.put('/user/:id/:active', function(req, res) {

    let id = req.params.id;

    User.findByIdAndUpdate(id, { active: false }, { new: true }, (err, userUpdated) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            userUpdated
        });
    });

});

module.exports = app;