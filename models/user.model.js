const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    customerId : {
        type:String
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    image:{
        type:String
    },
    gender:{
        type:String,
        enum:['Male','Female']
    },
    phone: {
      type: Number,
      required: true,
    },
    address: [
      {
        firstName: {
          type: String,
          required: true,
        },
        pinCode: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        phone: {
          type: Number,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
      }
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const user = mongoose.model("user", userSchema);
module.exports = user;