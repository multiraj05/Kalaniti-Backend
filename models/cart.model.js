const mongoose = require("mongoose");

const cartDetailsSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  size:{
    type:String,
  },
  quantity: {
    type: Number,
    default: 1,
  },
},
{
  timestamps: true,
  versionKey: false,
}
);

const CartDetails = mongoose.model("CartDetails", cartDetailsSchema);

module.exports = CartDetails;

