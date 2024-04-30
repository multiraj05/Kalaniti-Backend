const express = require("express");
const route = express.Router();
const contactUsController = require("../controllers/contactUs.controller");
const checkAccessKey = require("../utils/checkAccessKey");

route.post("/create", contactUsController.addContactUs);
route.get("/show", contactUsController.getContactUs);
route.patch("/update", contactUsController.updateContactUs);
route.delete("/delete", contactUsController.deleteContactUs);

module.exports = route;