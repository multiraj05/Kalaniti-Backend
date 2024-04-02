const express = require('express');
const route = express.Router();
const UserController = require('../controllers/user.controller');
const {checkUserAuth} = require('../middlewares/auth');

const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({storage});

const checkKey = require("../utils/checkAccessKey");

// Route Level Middleware - To Protect Routes
route.use('/changepassword', checkUserAuth);
route.use('/loggeduser', checkUserAuth);

// Public Routes
route.post('/register',upload.any("images"),UserController.userRegistration);
route.post('/login',checkKey(),UserController.userLogin);
route.post('/send-reset-password-email', checkKey(),UserController.sendUserPasswordResetEmail);
route.post('/reset-password',checkKey(),UserController.userPasswordReset);

// Protected Routes
route.post('/changepassword', UserController.changeUserPassword);
route.post('/add',checkUserAuth,UserController.addAddress);
route.patch('/updateAddress',UserController.updateAddress);
route.delete('/deleteAddress',UserController.deleteAddress);
route.get('/getUser', UserController.getUser);
route.put('/update',UserController.updateUser);
route.delete('/delete',UserController.deleteUser);

module.exports = route;
