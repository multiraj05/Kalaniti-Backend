const express = require("express");
const route = express.Router();

const AdminController = require("../controllers/admin.controller")
const AdminMiddleware = require("../middlewares/admin.middleware")
const checkAccessKey = require("../utils/checkAccessKey");


const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({storage});


route.post("/create",upload.single("image"), AdminController.addAdmin);
route.post("/login",checkAccessKey(), AdminController.adminLogin);


route.patch("/updatePassword", AdminMiddleware, AdminController.updatePassword);
route.patch("/update", AdminMiddleware, AdminController.update);
route.get("/show", upload.single("image"), AdminController.adminGet);

module.exports = route;