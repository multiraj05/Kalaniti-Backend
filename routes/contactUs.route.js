const express = require("express");
const route = express.Router();
const contactUsController = require("../controllers/contactUs.controller");
const checkAccessKey = require("../utils/checkAccessKey");

route.post("/create",checkAccessKey(), contactUsController.addContactUs);
route.get("/show", checkAccessKey(),contactUsController.getContactUs);
route.patch("/update",checkAccessKey(), contactUsController.updateContactUs);
route.delete("/delete",checkAccessKey(), contactUsController.deleteContactUs);

module.exports = route;