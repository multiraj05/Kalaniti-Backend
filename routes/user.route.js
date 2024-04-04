const express = require('express');
const route = express.Router();
const UserController = require('../controllers/user.controller');
const {checkUserAuth} = require('../middlewares/auth');
const checkKey = require("../utils/checkAccessKey");
const storage = require("../utils/multer");
const multer = require("multer");
const upload = multer({storage});

// user crud route
route.post('/register',upload.single("image"),UserController.userRegistration);
route.post('/login',checkKey(),UserController.userLogin);
route.get('/getUser', UserController.getUser);
route.patch('/update',checkUserAuth,upload.single("image"),UserController.updateUser);
route.delete('/delete',checkUserAuth,UserController.deleteUser);

// user address Routes
route.post('/add',checkUserAuth,UserController.addAddress);
route.patch('/updateAddress',checkUserAuth,UserController.updateAddress);
route.delete('/deleteAddress',checkUserAuth,checkKey(),UserController.deleteAddress);

// user route to set and reset password
route.post('/send-reset-password-email', checkKey(),UserController.sendUserPasswordResetEmail);
route.post('/changepassword', UserController.changeUserPassword);
route.post('/reset-password',checkKey(),UserController.userPasswordReset);

module.exports = route;