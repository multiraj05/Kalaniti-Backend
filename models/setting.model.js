const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    // image setting
    aboutBanner:{
        type:String
    },
    homeBanner:{
        type:String
    },
    logo:{
        type:String
    },
    megaBanner:{
        type:String
    },

    // web setting
    address:{
        type:String
    },
    companyName:{
        type:String
    },
    contact:{
        type: Number
    },
    email:{
        type: String
    },
    footerText:{
        type: String
    },
    headerOffer:{
        type: String
    },
    shopTime:{
        type: String
    },
    webText:{
        type: String
    },

    // General Settings
    razorApiSecret:{
        type: String
    },
    razorKey:{
        type: String
    },
    deliveryDay:{
        type: String
    },
    returnDay:{
        type: String
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const setting = mongoose.model("setting", settingSchema);
module.exports = setting;