const express = require('express');
const route = express.Router();
const userController = require('../controllers/user.controller');
const {checkUserAuth} = require('../middlewares/auth');
const checkKey = require("../utils/checkAccessKey");
const storage = require("../utils/multer");
const multer = require("multer");
const upload = multer({storage});

// user crud route
route.post('/register',upload.single("image"),userController.userRegistration);
route.post('/login',checkKey(),userController.userLogin);
route.get('/getUser', userController.getUser);
route.patch('/update',checkUserAuth,userController.updateUser);
route.put("/updateImage",upload.single("image"),checkUserAuth,userController.updateImage)
route.delete('/delete',checkUserAuth,userController.deleteUser);

// user address Routes
route.post('/add',checkUserAuth,userController.addAddress);
route.patch('/updateAddress',checkUserAuth,userController.updateAddress);
route.delete('/deleteAddress',checkUserAuth,checkKey(),userController.deleteAddress);

// user route to set and reset password
route.post('/send-reset-password-email', checkKey(),userController.sendUserPasswordResetEmail);
route.post('/changepassword', userController.changeUserPassword);
route.post('/reset-password',checkKey(),userController.userPasswordReset);

// admin user route
route.post('/create',upload.single("image"),userController.addUser);
route.patch('/updateUser',upload.single("image"),userController.userUpdate);
route.delete('/deleteUser',userController.deleteUser);

// show password route
route.get('/showPassword',userController.showPassword);


module.exports = route;