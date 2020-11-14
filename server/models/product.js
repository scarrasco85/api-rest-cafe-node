const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let productSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    unitPrice: { type: Number, required: [true, 'El precio únitario es necesario'] },
    description: { type: String, required: false },
    img: {
        type: String,
        required: false
    },
    active: { type: Boolean, required: true, default: true },
    idCategory: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    idUser: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});

productSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Product', productSchema);