const express = require('express');
const route = express.Router();
const orderController = require("../controllers/order.controller");
const multer = require("multer");
const storage = require("../utils/multer");
const upload = multer({storage});

route.post("/create",orderController.createOrder);
route.get("/show",orderController.getOrders);
route.put("/updateStatus",orderController.updateOrderStatus);

route.get("/showOrder",orderController.allOrder);

// ======= status apis =======

route.get("/pending",orderController.pendingStatus);
route.get("/confirmed",orderController.confirmedStatus);
route.get("/delivered",orderController.deliveredStatus);
route.get("/canceled",orderController.canceledStatus);
route.get("/return",orderController.returnStatus);

module.exports = route;
