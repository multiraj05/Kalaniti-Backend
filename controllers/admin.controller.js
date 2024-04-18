const { Admin } = require("../models/index.model");
const { response } = require("../utils/response");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Cryptr = require("cryptr");
const { deleteFile } = require("../utils/deleteFile");
require('dotenv').config();
const cryptrKey = process.env.CRYPTR_KEY;
const cryptr = new Cryptr(cryptrKey);

exports.addAdmin=async(req,res)=>{
    try {
        console.log(req.body);
        console.log(req.file);

        if (!req.body.name || !req.body.email || !req.body.password) {
          return response( res, 201, { status: false, message: "Name, email, and password are required" });
        }

        
        const hashedPassword = await cryptr.encrypt(req.body.password, 10);

        const admin = new Admin({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
          image: req.file ? req.file.path : "", 
          role: req.body.role || [],
          isActive: req.body.isActive || true,
        });

        await admin.save();
    
        return response( res, 200, { status: true, message: "Admin added successfully", admin });
      } catch (error) {
        console.error("Error adding admin:", error);
        return response( res, 500, { status: false, message: "Internal Server Error" });
      }
};

exports.adminLogin = async (req, res, next) => {
  try {
    if (req.body && req.body.email && req.body.password) {
      const admin = await Admin.findOne({ email: req.body.email });

      console.log("admin", admin);


      if (!admin) {
        return response(res, 401, { message: "Oops ! Email doesn't exist" })
      }

      if (req.body.password != cryptr.decrypt(admin.password)) {
        return response(res, 201, { message: "Oops ! Password doesn't exist" });
      }

      const payload = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        role: admin.role,
        isActive: admin.isActive,
      };
      
      console.log("payload", payload);

      const token = jwt.sign(payload, process.env.JWT_SECRET);
      console.log("token", token);

      if (admin.isActive) {
        return response(res, 200, {
          message: "Admin Login Successfully !!",
          token,
        })
      } else {
        return response(res, 401, { message: "Admin does not exists !" })
      }
    } else {
      return response(res, 401, { message: "Oops ! Invalid details !" })
    }
  } catch (error) {
    console.log(error);
    return response(res, 500, error)
  }
};

// exports.adminGet = async (req, res) => {
//   try {
//       const admin = await Admin.find()
//       return response(res, 200, {
//           message: "admin get Successfully !!",
//           admin,
//       });
//   } catch (error) {
//       console.log(error);
//       return response(res, 500, error);
//   }

// }

//update admin profile email and name [Backend]
exports.update = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin){   
      return response(res, 401, { message: "Admin doesn't Exist!!" })
    }


    admin.name = req.body.name;
    admin.email = req.body.email;

    await admin.save();

    const payload = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
      role: admin.role,
      isActive: admin.isActive,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return response(res, 200, {
      status: true,
      message: "Admin Updated Successfully!!",
      token,
    })
  } catch (error) {
    console.log(error);
    return response(res, 500, error)
  }
};

//update admin password [Backend]
exports.updatePassword = async (req, res) => {
    try {
      
      if (req.body.oldPassword || req.body.newPassword) {
        console.log("admin", req.admin);
        const admin = await Admin.findById(req.admin._id).exec();

        if (!admin) {
          return response(res, 401, { message: "Admin not found" });
        }
        console.log("req.body", req.body);

        const validPassword = cryptr.decrypt(req.body.oldPassword, admin.password);

        if (!validPassword) {
          return response(res, 401, { message: "Oops! Old Password doesn't match" });
        }

        const hash = cryptr.encrypt(req.body.newPassword, 10);

        await Admin.updateOne({ _id: req.admin._id }, { $set: { password: hash } }).exec();
        const payload = {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          image: admin.image,
          role: admin.role,
          isActive: admin.isActive,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        return response(res, 200, {
          message: "Admin Updated Successfully!!",
          token,
        })
      } else {
        return response(res, 401, { message: "Invalid details" });
      }


    } catch (error) {
      console.log(error);
      return response(res, 500, error)
    }
};

//update admin profile image
exports.updateImage = async (req, res) => {
  try {

    console.log("req.file", req.file);

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      deleteFile(req.file);
      return response( res, 200, { status: false, message: "Admin does not Exist!" });
    }

    if (req.file) {
      if (fs.existsSync(admin.image)) {
        fs.unlinkSync(admin.image);
      }

      admin.image = req.file.path;
    }

    await admin.save();

    const payload = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
      role: admin.role,
      isActive: admin.isActive,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return response(res, 200, {
      message: "Admin Image Update Successfully !!",
      token,
    })
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return response(res, 500, { status: false, message: "Internal Server Error" })
  }
};

exports.showPassword = async (req, res) => {
  try {
      const { id } = req.query;

      const admin = await Admin.findById(id);
      if (!admin) {
          return response(res, 404, { message: "User not found" });
      }

      const decryptedPassword = cryptr.decrypt(admin.password);
      console.log('decryptedPassword', decryptedPassword);

      return response(res, 200, {
          message: "Admin password retrieved successfully",
          password: decryptedPassword
      });

  } catch (error) {
      console.error(error);
      return response(res, 500, { message: "Internal server error" });
  }
};