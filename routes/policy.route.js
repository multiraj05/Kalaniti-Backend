const express = require("express");
const route = express.Router();
const policyController = require("../controllers/policy.controller");
const checkAccessKey = require("../utils/checkAccessKey");

route.post("/create",checkAccessKey(), policyController.addPolicy);
route.get("/show", checkAccessKey(),policyController.getPolicy);
route.patch("/update",checkAccessKey(), policyController.updatePolicy);
route.delete("/delete",checkAccessKey(), policyController.deletePolicy);

module.exports = route;