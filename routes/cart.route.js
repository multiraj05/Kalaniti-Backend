const express = require("express");
const route = express.Router();
const cartController = require("../controllers/cart.controller");
const { checkUserAuth } = require("../middlewares/auth");
const checkAccessKey = require("../utils/checkAccessKey");

// Use route.post with correct syntax for the callback function
route.post("/add", checkAccessKey(), cartController.addToCart);
route.get("/show", checkAccessKey(), cartController.getCart);
route.delete("/delete", checkAccessKey(), cartController.deleteData);
route.patch("/update",cartController.updateData);
route.put("/changeqty",cartController.changeqty);


module.exports = route;
