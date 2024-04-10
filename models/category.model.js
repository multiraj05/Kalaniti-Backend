const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryId:{
        type: String
    },
    name: {
        type: String,
        trim: true
    },
    image: {
        type: String
    }
},
{
    timestamps: true,
    versionKey: false,
}
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
