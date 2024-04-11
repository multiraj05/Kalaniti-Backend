const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    image:{
        type:String
    },
    url:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:false
    },
    title:{
        type:String
    }
},{
    timestamps: true,
    versionKey: false
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;