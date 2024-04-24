const express = require('express');
const route = express.Router();

// ------------------ start users route ---------------

const cartRoute = require("./cart.route");
route.use("/cart", cartRoute);

const userRoute = require("./user.route");
route.use("/user", userRoute);

const productRoute = require("./product.route");
route.use("/product", productRoute);

const categoryRoute = require("./category.route");
route.use("/category", categoryRoute);


const orderRoute = require("./order.route");
route.use("/order", orderRoute);

const paymentRoute = require("./payment.route");
route.use("/payment", paymentRoute);

const Banner = require("./banner.route");
route.use("/banner", Banner);

const attributeRoute = require("./attribute.route");
route.use("/attribute", attributeRoute);

const policyRoute = require("./policy.route");
route.use("/policy", policyRoute);

const settingRoute = require("./setting.route");
route.use("/setting", settingRoute);

// ------------------ end users route ---------------

// ------------------ start admin route ---------------

const dashBoardRoute = require("./dashboard.route");
route.use("/dashBoard", dashBoardRoute);

const adminRoute = require("./admin.route");
route.use("/admin", adminRoute);

// ------------------ end admin route ---------------

module.exports = route;