const express = require('express');
const route = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

route.get("/show",dashboardController.getDashboard);

module.exports = route;