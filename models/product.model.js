const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    
    productCode: {
        type: String,
    },
    isTrend:{
        type:Boolean,
        default:false
    },
    productName: {
        type: String,
        trim: true
    },
    title:{
        type:String,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    price1: {
        type: Number,
        trim: true
    },
    price2:{
        type: Number,
        trim:true
    },
    images: [{
        type: String
    }],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
},
{
    timestamps: true,
    versionKey: false,
}
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
