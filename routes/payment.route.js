const express = require('express');
const route = express.Router();
const paymentController = require("../controllers/payment.controller");
// const multer = require("multer");
// const storage = require("../multer");
// const upload = multer({storage});

route.get("/pay",paymentController.payment);

module.exports = route;
