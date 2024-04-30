const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    // image setting
    name:{
        type:String
    },
    email:{
        type:String
    },
    phone:{
        type:String
    },
    message:{
        type:String
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const contactUs = mongoose.model("contactUs", contactUsSchema);
module.exports = contactUs;