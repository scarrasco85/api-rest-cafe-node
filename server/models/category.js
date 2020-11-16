const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//Category Schema
let categorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Category name is required']
    },
    description: {
        type: String,
        required: [true, 'Category description is required']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

//Unique Validator inyection
categorySchema.plugin(uniqueValidator, { message: '{PATH} must be unique' });


module.exports = mongoose.model('Category', categorySchema);