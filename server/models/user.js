const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Valid roles
let validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is not a valid role'
};

let Schema = mongoose.Schema;

// User Schema
let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'User name is required']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'User email is required']
    },
    password: {
        type: String,
        required: [true, 'User password is required']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: validRoles
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    // Registered user with google credentials
    google: {
        type: Boolean,
        default: false
    }
});

// Modification of the .toJSON method to not show the password field when it is invoked
userSchema.methods.toJSON = function() {

    let user = this;

    let userObject = user.toObject();

    delete userObject.password;

    //devolvemos el objeto que .toJSON va a imprimir sin la propiedad 'password'
    return userObject;
}

///Unique Validator inyection
userSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' });


module.exports = mongoose.model('User', userSchema);