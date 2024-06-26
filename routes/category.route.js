const express = require('express');
const route = express.Router();
const categoryController = require("../controllers/category.controller");
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({storage});


route.post("/add",upload.single("image"),categoryController.createCategory);
route.get("/show",categoryController.getCategories);
route.patch("/update",upload.single("image"),categoryController.updateCategory);
route.delete("/delete",categoryController.deleteCategory);

module.exports = route;