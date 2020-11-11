const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//Category Schema
let categorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'El nombre de la categoría es necesario']
    },
    description: {
        type: String,
        required: [true, 'La descripción de la categoría es necesaria']
    }
});

//Unique Validator inyection
categorySchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });


module.exports = mongoose.model('Category', categorySchema);