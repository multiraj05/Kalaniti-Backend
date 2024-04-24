const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema(
  {
    attrName : {
        type:String
    },
    details: [{
        type:String
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const attribute = mongoose.model("attribute", attributeSchema);
module.exports = attribute;