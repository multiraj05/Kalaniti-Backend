const express = require("express");
const route = express.Router();
const bannerController = require("../controllers/banner.controller");
const checkAccessKey = require("../utils/checkAccessKey");
// const { checkAdminAuth } = require("../middlewares/admin.middleware");

const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({storage});


route.post("/create",upload.single("image"), checkAccessKey(), bannerController.create);
route.get("/show", checkAccessKey(), bannerController.show);
route.patch("/update",upload.single("image"), checkAccessKey(),bannerController.update);
route.delete("/delete", checkAccessKey(), bannerController.delete);

route.put("/status",checkAccessKey(),bannerController.enableDesableBanner);


module.exports = route;