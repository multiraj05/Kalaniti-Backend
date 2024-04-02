const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
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
            enum: ['pending', 'processing', 'shipped', 'delivered'],
            default: 'pending'
        },
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
