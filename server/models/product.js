const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

//Product Schema
let productSchema = new Schema({
    name: { type: String, required: [true, 'Product name is required'] },
    unitPrice: { type: Number, required: [true, 'Unit price is required'] },
    description: { type: String, required: false },
    img: {
        type: String,
        required: false
    },
    active: { type: Boolean, required: true, default: true },
    idCategory: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    idUser: { type: Schema.Types.ObjectId, ref: 'User' }
});

//Unique Validator inyection
productSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' });

module.exports = mongoose.model('Product', productSchema);