const express = require('express');
const route = express.Router();
const paymentController = require("../controllers/payment.controller");

route.get("/pay",paymentController.payment);

module.exports = route;
