const express = require('express');
const route = express.Router();
const productController = require("../controllers/product.controller");
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({storage});


route.post("/add",upload.any("images"),productController.addProduct);
route.get("/show",upload.any("images"),productController.getProducts);
route.patch("/update",upload.any("images"),productController.updateProduct);
route.delete("/delete",productController.deleteProduct);

module.exports = route;
