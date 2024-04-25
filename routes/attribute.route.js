const express = require("express");
const route = express.Router();
const attributeController = require("../controllers/attribute.controller");
const checkAccessKey = require("../utils/checkAccessKey");

route.post("/create",checkAccessKey(), attributeController.addAttribute);
route.get("/show", checkAccessKey(),attributeController.getAttribute);
route.patch("/update",checkAccessKey(), attributeController.updateAttribute);
route.delete("/delete",checkAccessKey(), attributeController.deleteAttribute);

module.exports = route;