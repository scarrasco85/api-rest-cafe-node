const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let productSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    unitPrice: { type: Number, required: [true, 'El precio únitario es necesario'] },
    description: { type: String, required: false },
    disabled: { type: Boolean, required: true, default: true },
    category: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});


module.exports = mongoose.model('Product', productoSchema);