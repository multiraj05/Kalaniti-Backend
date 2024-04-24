const express = require("express");
const route = express.Router();
const settingController = require("../controllers/setting.controller");
const checkAccessKey = require("../utils/checkAccessKey");

const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({storage});

route.post("/create",upload.any(),checkAccessKey(), settingController.addSetting);


module.exports = route;