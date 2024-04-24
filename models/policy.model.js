const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    title : {
        type:String
    },
    description: {
        type:String
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const policy = mongoose.model("policy", policySchema);
module.exports = policy;