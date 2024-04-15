const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        orderCode:{
            type: String
        },
        cartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "cart",
          },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
          },
        status: {
            type: String,
            enum: [1,2,3,4,5], // 1=pending, 2=confirm, 3=delivered, 4=canceled, 5=return
            default: '1'
        },
        // status: {
        //     type: String,
        //     enum: ['pending','confirmed','delivered','undo','cancel'],
        //     default: 'pending'
        // },
        totalPrice: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
