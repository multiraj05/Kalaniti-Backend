//JWT Token
const jwt = require("jsonwebtoken");
const { response } = require("../utils/response");
const { Admin } = require("../models/index.model");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");
    console.log("Authorization 1 ", Authorization);

    if (!Authorization || Authorization == undefined) {
      return response(res, 401, { message: "Oops ! You are not Authorized" })
    }

    const decodeToken = await jwt.verify(
      Authorization,
      process.env.JWT_SECRET
    );
    const admin = await Admin.findById(decodeToken._id);
    console.log("admin", admin);

    req.admin = admin;
    next();
  } catch (error) {
    response(res, 500, error)
  }
};