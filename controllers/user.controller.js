const mongoose = require("mongoose");
const { userInfo } = require("../models/index.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response } = require("../utils/response");
const transporter = require("../utils/emailConfig.js");
const { deleteFile } = require("../utils/deleteFile.js");
const {uniqueId} = require('../utils/generateCode.js')
const fs = require("fs");

const Cryptr = require("cryptr");
require('dotenv').config();
const cryptrKey = process.env.CRYPTR_KEY;
const cryptr = new Cryptr(cryptrKey);

// --------------------- start user login & registration --------------------------

exports.userRegistration = async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  try {
    const { firstName, lastName, email, password, phone ,gender} = req.body;

    if (!password || !firstName || !lastName || !email || !phone || !gender) {
      return response(res, 201, { status: false, message: "All fields are required"});
    }

    const emailCheck = await userInfo.findOne({ email });

    if (emailCheck){
      return response(res, 201, { status: false, message: "Email already exist"});
    }

    const hashedPassword = await cryptr.encrypt(password, 10);

    const user = await userInfo();

      user.firstName = firstName
      user.lastName = lastName
      user.email = email
      user.password = hashedPassword
      user.phone = phone
      user.address = []
      user.gender = gender
      user.customerId = uniqueId(10)

      if (req.file) {
        user.image = req.file.path;
      }

    await user.save();

    return response(res, 200, {
      status: true, 
      message: "User registered successfully", 
      user
    });
  } catch (ex) {
    console.log(ex);
    return response(res, 500,{
      status: false, 
      message: "Internal server error", 
      error: ex
    });
  };
}

exports.userLogin = async (req, res) => {
  console.log("body=====", req.body);
  try {
    const { email, password } = req.body;

    if (email && password) {
      const user = await userInfo.findOne({ email: email });
      console.log(user);

      if (!user) {
        return response(res, 401, { status: false, message: "User not found" });
      }

      console.log("user login password", password);
      console.log("user password", user.password);

      if (req.body.password != cryptr.decrypt(user.password)) {
        return response(res, 201, { message: "Oops ! Password doesn't exist" });
    }

      const userData = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        image: user.image,
        phone: user.phone,
        gender: user.gender,
        uniqueId: user.uniqueId
      };

      const token = jwt.sign(userData, process.env.JWT_SECRET);

      return response(res, 200, { status: true, message: "Login successful", token: token });
    } else {
      return response(res, 400, { status: false, message: "Email and password are required" });
    }
  } catch (error) {
    console.log(error);
    return response(res, 500, {
      status: false, 
      message: "Internal server error", 
      error: error
    })
  }
};

// --------------------- end user login & registration ----------------------------

// --------------------- start user update,delete,show ----------------------------

exports.getUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;
    const { userId } = req.query;
    console.log("userID = ",req.query);
    const search = req.query.search;
    const fieldsToSearch = ["firstName", "lastName"];

    let matchQuery = {};

    if (userId) {
      matchQuery = {
        _id: new mongoose.Types.ObjectId(userId),
      };
    } else {
      matchQuery = {
        $or: [
          {
            $or: fieldsToSearch.map((field) => ({
              [field]: { $regex: search, $options: "i" },
            })),
          },
          {
            $or: fieldsToSearch.map((field) => ({
              $expr: {
                $regexMatch: {
                  input: { $toString: `$${field}` },
                  regex: search,
                  options: "i",
                },
              },
            })),
          },
        ],
      };
    }

    const commonPipeline = [
      {
        $match: matchQuery,
      },
    ];

    const countPipeline = [...commonPipeline, { $count: "totalCount" }];
    const aggregationPipeline = [
      ...commonPipeline,
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
    ];

    const countResult = await userInfo.aggregate(countPipeline);
    const totalCount = countResult[0]?.totalCount || 0;

    const Result = await userInfo.aggregate(aggregationPipeline);
    const paginatedResults = Result || [];

    return response(res, 200, {
      status: true,
      message: "Get user Successfully !!",
      user: paginatedResults,
      userTotal: totalCount,
    });
  } catch (error) {
    console.error("Error in getUser:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

exports.updateUser = async (req, res) => {
  console.log(req.user);
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      pinCode,
      city,
      address,
      phone,
      country,
      state,
      gender
    } = req.body;
    console.log("body=====",req.body);

    let user = await userInfo.findById(req.user._id);
    if (!user) {
      return response(res, 401, {
        status: false, 
        message: "User not found"
      });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.password = password ? cryptr.encrypt(password) : user.password;

    if (address) {
      user.address.push(address);
    }

    user.phone = phone || user.phone
    user.city = city || user.city
    user.state = state || user.state
    user.pinCode = pinCode || user.pinCode
    user.country = country || user.country
    user.image = req?.file?.path || user.image
    user.gender = gender || user.gender
    user.uniqueId = user.uniqueId

    const userUpdateData = await user.save();

    const payload = {
        _id: userUpdateData._id,
        firstName: userUpdateData.firstName,
        lastName: userUpdateData.lastName,
        password: userUpdateData.password,
        email: userUpdateData.email,
        address: userUpdateData.address,
        image: userUpdateData.image,
        phone: userUpdateData.phone,
        gender: userUpdateData.gender,
        uniqueId: userUpdateData.uniqueId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return response(res, 200, { status: true, message: "User updated successfully", token: token });
  } catch (error) {
    console.error("Error updating user:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.query;

    const existingUser = await userInfo.findById(userId);
    if (!existingUser) {
      return response(res, 401, { status: false, message: "User not found" });
    }

    await userInfo.findByIdAndDelete(userId);

    return response(res, 200, { status: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

exports.updateImage = async (req, res) => {
  try {

    console.log("req.file", req.file);

    const user = await userInfo.findById(req.user._id);

    if (!user) {
      deleteFile(req.file);
      return response( res, 200, { status: false, message: "Admin does not Exist!" });
    }

    if (req.file) {
      if (fs.existsSync(user.image)) {
        fs.unlinkSync(user.image);
      }

      user.image = req.file.path;
    }

    await user.save();

    const payload = {
      _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        email: user.email,
        address: user.address,
        image: user.image,
        phone: user.phone,
        gender: user.gender, 
        uniqueId: user.uniqueId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return response(res, 200, {
      message: "User Image Update Successfully !!",
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
      const { userId } = req.query;

      const user = await userInfo.findById(userId);
      if (!user) {
          return response(res, 404, { message: "User not found" });
      }

      const decryptedPassword = cryptr.decrypt(user.password);
      console.log('decryptedPassword', decryptedPassword);
      return response(res, 200, {
          message: "User password retrieved successfully",
          password: decryptedPassword
      });

  } catch (error) {
      console.error(error);
      return response(res, 500, { message: "Internal server error" });
  }
};

// --------------------- end user update,delete,show ---------------------------

// --------------------- start user address ------------------------------------

exports.addAddress = async (req, res) => {
  try {
    console.log(req.body);
    const { userId } = req.query;
    const { firstName , pinCode, state, country, city, address, phone } = req.body;

    console.log("User Id :- ", userId);

    if (!userId || !firstName || !pinCode || !state || !country || !city || !address || !phone) {
      return response(res, 201, {
        status: false, 
        message: "All address fields are required"
      });
    }

    const user = await userInfo.findById(userId);

    console.log("user",user);

    if (!user) {
      return response(res, 201,{
         status: false,
         message: "User not found"
      });
    }

    if (!user.address) {
      user.address = [];
    }

    const newAddress = {
      firstName,
      pinCode,
      state,
      country,
      city,
      address,
      phone,
    };

    user?.address?.push(newAddress);

    const updatedUser = await user.save();

    const payload = {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        address: updatedUser.address,
        image: updatedUser.image,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        uniqueId: updatedUser.uniqueId
    };

    console.log(payload);

    const token = jwt.sign(payload, process.env.JWT_SECRET);
    console.log("Generated token:", token);

    return response(res, 200, {
      status: true,
      message: "Address added to user successfully",
      token
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return response(res, 500, {
      status: false, 
      message: "Internal Server Error"
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.query;
    console.log(req.query);
    const { firstName,pinCode, state, country, city, address, phone } = req.body;
    console.log(req.body);

    const user = await userInfo.findById(userId);

    if (!user) {
      return response(res, 401, {
        status: false, 
        message: "User not found"
      })
    }

    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return response(res, 401, {
        status: false, 
        message: "Address not found"
      })
    }

    user.address[addressIndex] = {
      _id: addressId,
      firstName,
      pinCode,
      state,
      country,
      city,
      address,
      phone,
    };

    const userUpdateData = await user.save();

    const payload = {
      _id: userUpdateData._id,
      firstName: userUpdateData.firstName,
      lastName: userUpdateData.lastName,
      email: userUpdateData.email,
      address: userUpdateData.address,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return response(res, 200, {
      status: true,
      message: "Address updated successfully",
      token
    })
  } catch (error) {
    console.error("Error updating address:", error);
    return response(res, 500, {
      status: false, 
      message: "Internal Server Error"
    })
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.query;

    if (!userId || !addressId) {
      return response(res, 201, { status: false, message: "All fields are required" });
    }

    const user = await userInfo.findById(userId);

    if (!user) {
      return response(res, 401, { status: false, message: "User not found" });
    }

    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    console.log(addressIndex);

    if (addressIndex === -1) {
      return response(res, 401, { status: false, message: "Address not found" });
    }

    const deletedAddress = user.address[addressIndex];

    user.address.splice(addressIndex, 1);

    const updatedUser =await user.save();

    const payload = {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      address: updatedUser.address,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1y",
    });

    return response(res, 200, {
      status: true,
      message: "Address deleted successfully",
      token,
      deletedAddress,
    })
  } catch (error) {
    console.error("Error deleting address:", error);
    return response(res, 500, {
      status: false, 
      message: "Internal Server Error"
    })
  }
};

// --------------------- end user address -----------------------------------

// --------------------- start user password --------------------------------

exports.changeUserPassword = async (req, res) => {
  const { password, password_confirmation } = req.body;

  if (password && password_confirmation) {
    if (password !== password_confirmation) {
      return response(res, 400, {
        status: "failed",
        message: "New Password and Confirm New Password don't match",
      })
    } else {
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);

      await userInfo.findByIdAndUpdate(req.user._id, {
        $set: { password: newHashPassword },
      });
      return response(res, 200, {
        status: "success",
        message: "Password changed successfully",
      })
    }
  } else {
    return response(res, 400, {
      status: "failed",
      message: "All fields are required",
    })
  }
};
  
exports.sendUserPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  if (email) {
    const user = await userInfo.findOne({ email: email });
    console.log(user);
    if (user) {
      const secret = user._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "15m",
      });
      const link = `http://127.0.0.1:8000/user/reset/${user._id}/${token}`;
      console.log(link);

      let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset Link",
        html: `<a href=${link}>Click Here</a> to Reset Your Password,<h1> hello i am mahek </h1>`,
      });

      return response(res, 200, {
        status: "success",
        message: "Password reset link sent to your email",
      })
    } else {
      return response(res, 400, {
        status: "failed",
        message: "Email not found",
      })
    }
  } else {
    return response(res, 400, {
      status: "failed",
      message: "Email are required",
    })
  }
};

exports.userPasswordReset = async (req, res) => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.query;
  console.log(req.query);
  const user = await userInfo.findById(id);

  if (!user) {
    return response(res, 404, {
      status: "failed",
      message: "User not found",
    })
  }

  const SECRET_KEY = user._id + process.env.JWT_SECRET;

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        return response(res, 400, {
          status: "failed",
          message: "New Password and Confirm New Password don't match",
        })
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);

        await userInfo.findByIdAndUpdate(user._id, {
          $set: { password: newHashPassword },
        });
        
        return response(res, 200, {
          status: "success",
          message: "Password changed successfully",
        })
      }
    } else {
      return response(res, 400, {
        status: "failed",
        message: "All fields are required",
      })
    }
  } catch (error) {
    console.error(error);
    return response(res, 500, {
      status: "failed",
      message: "Internal Server Error",
    })
  }
};

// --------------------- end user password ----------------------------------


// ------------------------- Start New Admin User Controller ----------------------

exports.addUser = async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  try {
    const { firstName, lastName, email, password, phone ,gender ,customerId} = req.body;

    if (!password || !firstName || !lastName || !email || !phone || !gender) {
      return response(res, 201, { status: false, message: "oops...! || some fields are required"});
    }

    const isUser = await userInfo.findOne({ email });

    if (isUser){
      return response(res, 201, { status: false, message: "User already exist...!"});
    }

    const hashPassword = await crypt.encrypt(password, 10);

    const user = await userInfo();

      user.firstName = firstName
      user.lastName = lastName
      user.email = email
      user.password = hashPassword
      user.phone = phone
      user.address = []
      user.gender = gender
      user.customerId = uniqueId(10) || customerId

      if (req.file) {
        user.image = req.file.path;
      }

    await user.save();

    return response(res, 200, {
      status: true, 
      message: "User registered successfully", 
      user
    });
  } catch (ex) {
    console.log(ex);
    return response(res, 500,{
      status: false, 
      message: "Internal server error", 
      error: ex
    });
  };
}

exports.userUpdate = async (req, res) => {
  try {
    const {userId} = req.query;
    const {
      firstName,
      lastName,
      email,
      password,
      pinCode,
      city,
      address,
      phone,
      country,
      state,
      gender
    } = req.body;


    const user = await userInfo.findById(userId);

    console.log("User = ",user);

    if (!user) {
      return response(res, 401, {
        status: false, 
        message: "User not found"
      });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.password = password ? cryptr.encrypt(password) : user.password;

    if (address) {
      user.address.push(address);
    }

    user.phone = phone || user.phone
    user.city = city || user.city
    user.state = state || user.state
    user.pinCode = pinCode || user.pinCode
    user.country = country || user.country
    user.image = req?.file?.path || user.image
    user.gender = gender || user.gender
    user.uniqueId = user.uniqueId

    const userUpdateData = await user.save();

    return response(res, 200, { status: true, message: "User updated successfully", user: userUpdateData });
  } catch (error) {
    console.error("Error updating user:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

// ------------------------- End New Admin User Controller ----------------------