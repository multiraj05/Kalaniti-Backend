const { Order,cartDetails,userInfo,productInfo} = require("../models/index.model");
const{ response }=require("../utils/response");
const mongoose =require("mongoose");
const {uniqueId} = require('../utils/generateCode');

exports.createOrder = async (req, res) => {
    try {
        const { cartId, userId,totalPrice } = req.query;

        if (!cartId || !userId ||!totalPrice ) {
            return response( res, 201, { status: false, message: 'cartId, userId, and totalPrice are required' });
        }
        const user = await userInfo.findById(userId);
        if (!user) {
            return response( res, 401, { status: false, message: 'User not found' });
        }
        const cart = await cartDetails.findById(cartId);
        if (!cart) {
            return response( res, 401, { status: false, message: 'Cart not found' });
        }

        const order = new Order({
            cartId,
            userId,
            totalPrice,
            orderCode: uniqueId(10),
        });

        await order.save();

        return response( res, 200, { status: true, message: 'Order created successfully', order });
    } catch (error) {
        console.error('Error creating order:', error);
        return response( res, 500, { status: false, message: 'Internal Server Error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.query
    const { status } = req.query

        if (!id) {
            return response(res, 201, { message: "Oops ! Invalid details !" });
        }
        const order = await Order.findById(id)

        if (!order) {
            return response(res, 201, { message: "Oops ! order not  found !" })
        }
        if (!status) {
            return response(res, 400, { message: "Missing required fields in the request body." });
        }

        order.status = status || order.status;

        await order.save()

        return response(res, 200, {
            message: "order status updated successfully!!",
            order:order,
        });
    } catch (error) {
        console.log(error);
        return response(res, 500, error);
    }
}

exports.getOrders = async (req, res) => {
    try {
        console.log("Fetching orders...");

        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;
        const { userId, search } = req.query;

        if (!userId) {
            return response(res, 400, { status: false, message: "Please provide userId" });
        }

        let matchQuery = {};

        if (userId) {
            matchQuery.userId = new mongoose.Types.ObjectId(userId);
        }

        const commonPipeline = [
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "cartdetails",
                    localField: "cartId",
                    foreignField: "_id",
                    as: "cartDetails",
                },
            },
            {
                $unwind: "$cartDetails",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "cartDetails.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.categoryId",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: "$categoryDetails",
            },
            {
                $project: {
                    "_id": 1,
                    "userId": 1,
                    "cartId": 1,
                    "status": 1,
                    "orderCode":1,
                    "totalPrice": 1,
                    "quantity": "$cartDetails.quantity",
                    "size": "$cartDetails.size",
                    "productCode": "$productDetails.productCode",
                    "productName": "$productDetails.productName",
                    "title": "$productDetails.title",
                    "images": "$productDetails.images",
                    "price1": "$productDetails.price1",
                    "price2": "$productDetails.price2",
                    "category": "$categoryDetails.name",
                    "createdAt": 1,
                }
            }
        ];

        const countPipeline = [...commonPipeline, { $count: "totalCount" }];
        const aggregationPipeline = [
            ...commonPipeline,
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
        ];

        const countResult = await Order.aggregate(countPipeline);
        const totalCount = countResult[0]?.totalCount || 0;

        const Result = await Order.aggregate(aggregationPipeline);
        const paginatedResults = Result || [];

        return response(res, 200, {
            message: "Orders retrieved successfully!",
            order: paginatedResults,
            orderTotal: totalCount,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return response(res, 500, { status: false, message: "Internal Server Error" });
    }
};

exports.allOrder = async (req, res) => {
    try {
        console.log("Fetching orders...");

        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;

        const commonPipeline = [
            {
                $lookup: {
                    from: "cartdetails",
                    localField: "cartId",
                    foreignField: "_id",
                    as: "cartDetails",
                },
            },
            {
                $unwind: "$cartDetails",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "cartDetails.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.categoryId",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: "$categoryDetails",
            },
            {
                $project: {
                    "_id": 1,
                    "userId": 1,
                    "cartId": 1,
                    "status": 1,
                    "orderCode":1,
                    "totalPrice": 1,
                    "quantity": "$cartDetails.quantity",
                    "size": "$cartDetails.size",
                    "productCode": "$productDetails.productCode",
                    "productName": "$productDetails.productName",
                    "title": "$productDetails.title",
                    "images": "$productDetails.images",
                    "price1": "$productDetails.price1",
                    "price2": "$productDetails.price2",
                    "category": "$categoryDetails.name",
                    "createdAt": 1,
                }
            }
        ];

        const countPipeline = [...commonPipeline, { $count: "totalCount" }];
        const aggregationPipeline = [
            ...commonPipeline,
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
        ];

        const countResult = await Order.aggregate(countPipeline);
        const totalCount = countResult[0]?.totalCount || 0;

        const Result = await Order.aggregate(aggregationPipeline);
        const paginatedResults = Result || [];

        return response(res, 200, {
            message: "Orders retrieved successfully!",
            order: paginatedResults,
            ordersTotal: totalCount,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return response(res, 500, { status: false, message: "Internal Server Error" });
    }
};

// ----------------- start status apis -----------------

exports.pendingStatus = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;

        const search = req.query.search;
        const fieldsToSearch = ["status"];

        const matchQuery = {
            $and: [
                { status: "1" }, 
                {
                    $or: fieldsToSearch.map((field) => ({
                        [field]: { $regex: search, $options: "i" },
                    })),
                },
            ],
        };

        const commonPipeline = [
            {
                $match: matchQuery, 
            },
            {
                $lookup: {
                    from: "cartdetails",
                    localField: "cartId",
                    foreignField: "_id",
                    as: "cartDetails",
                },
            },
            {
                $unwind: "$cartDetails",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "cartDetails.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.categoryId",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: "$categoryDetails",
            },
            {
                $project: {
                    "_id": 1,
                    "userId": 1,
                    "cartId": 1,
                    "status": 1,
                    "orderCode": 1,
                    "totalPrice": 1,
                    "quantity": "$cartDetails.quantity",
                    "size": "$cartDetails.size",
                    "productCode": "$productDetails.productCode",
                    "productName": "$productDetails.productName",
                    "title": "$productDetails.title",
                    "images": "$productDetails.images",
                    "price1": "$productDetails.price1",
                    "price2": "$productDetails.price2",
                    "category": "$categoryDetails.name",
                    "createdAt": 1,
                }
            }
        ];

        const countPipeline = [...commonPipeline, { $count: "totalCount" }];
        const aggregationPipeline = [
            ...commonPipeline,
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
        ];

        const countResult = await Order.aggregate(countPipeline);
        const totalCount = countResult[0]?.totalCount || 0;

        const orderDetails = await Order.aggregate(aggregationPipeline);
        const paginatedResults = orderDetails || [];

        return res.status(200).json({
            message: "Pending orders retrieved successfully!",
            order: paginatedResults,
            orderTotal: totalCount,
        });
    } catch (error) {
        console.error("Error fetching pending orders:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

exports.confirmedStatus = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;

        const search = req.query.search;
        const fieldsToSearch = ["status"];

        const matchQuery = {
            $and: [
                { status: "2" }, 
                {
                    $or: fieldsToSearch.map((field) => ({
                        [field]: { $regex: search, $options: "i" },
                    })),
                },
            ],
        };

        const commonPipeline = [
            {
                $match: matchQuery, 
            },
            {
                $lookup: {
                    from: "cartdetails",
                    localField: "cartId",
                    foreignField: "_id",
                    as: "cartDetails",
                },
            },
            {
                $unwind: "$cartDetails",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "cartDetails.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.categoryId",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: "$categoryDetails",
            },
            {
                $project: {
                    "_id": 1,
                    "userId": 1,
                    "cartId": 1,
                    "status": 1,
                    "orderCode": 1,
                    "totalPrice": 1,
                    "quantity": "$cartDetails.quantity",
                    "size": "$cartDetails.size",
                    "productCode": "$productDetails.productCode",
                    "productName": "$productDetails.productName",
                    "title": "$productDetails.title",
                    "images": "$productDetails.images",
                    "price1": "$productDetails.price1",
                    "price2": "$productDetails.price2",
                    "category": "$categoryDetails.name",
                    "createdAt": 1,
                }
            }
        ];

        const countPipeline = [...commonPipeline, { $count: "totalCount" }];
        const aggregationPipeline = [
            ...commonPipeline,
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
        ];

        const countResult = await Order.aggregate(countPipeline);
        const totalCount = countResult[0]?.totalCount || 0;

        const orderDetails = await Order.aggregate(aggregationPipeline);
        const paginatedResults = orderDetails || [];

        return res.status(200).json({
            message: "confirmed orders retrieved successfully!",
            order: paginatedResults,
            orderTotal: totalCount,
        });
    } catch (error) {
        console.error("Error fetching confirmed orders:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

exports.deliveredStatus = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;

        const search = req.query.search;
        const fieldsToSearch = ["status"];

        const matchQuery = {
            $and: [
                { status: "3" }, 
                {
                    $or: fieldsToSearch.map((field) => ({
                        [field]: { $regex: search, $options: "i" },
                    })),
                },
            ],
        };

        const commonPipeline = [
            {
                $match: matchQuery, 
            },
            {
                $lookup: {
                    from: "cartdetails",
                    localField: "cartId",
                    foreignField: "_id",
                    as: "cartDetails",
                },
            },
            {
                $unwind: "$cartDetails",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "cartDetails.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.categoryId",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: "$categoryDetails",
            },
            {
                $project: {
                    "_id": 1,
                    "userId": 1,
                    "cartId": 1,
                    "status": 1,
                    "orderCode": 1,
                    "totalPrice": 1,
                    "quantity": "$cartDetails.quantity",
                    "size": "$cartDetails.size",
                    "productCode": "$productDetails.productCode",
                    "productName": "$productDetails.productName",
                    "title": "$productDetails.title",
                    "images": "$productDetails.images",
                    "price1": "$productDetails.price1",
                    "price2": "$productDetails.price2",
                    "category": "$categoryDetails.name",
                    "createdAt": 1,
                }
            }
        ];

        const countPipeline = [...commonPipeline, { $count: "totalCount" }];
        const aggregationPipeline = [
            ...commonPipeline,
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
        ];

        const countResult = await Order.aggregate(countPipeline);
        const totalCount = countResult[0]?.totalCount || 0;

        const orderDetails = await Order.aggregate(aggregationPipeline);
        const paginatedResults = orderDetails || [];

        return res.status(200).json({
            message: "delivered orders retrieved successfully!",
            order: paginatedResults,
            orderTotal: totalCount,
        });
    } catch (error) {
        console.error("Error fetching delivered orders:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

exports.canceledStatus = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;

        const search = req.query.search;
        const fieldsToSearch = ["status"];

        const matchQuery = {
            $and: [
                { status: "4" }, 
                {
                    $or: fieldsToSearch.map((field) => ({
                        [field]: { $regex: search, $options: "i" },
                    })),
                },
            ],
        };

        const commonPipeline = [
            {
                $match: matchQuery, 
            },
            {
                $lookup: {
                    from: "cartdetails",
                    localField: "cartId",
                    foreignField: "_id",
                    as: "cartDetails",
                },
            },
            {
                $unwind: "$cartDetails",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "cartDetails.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.categoryId",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: "$categoryDetails",
            },
            {
                $project: {
                    "_id": 1,
                    "userId": 1,
                    "cartId": 1,
                    "status": 1,
                    "orderCode": 1,
                    "totalPrice": 1,
                    "quantity": "$cartDetails.quantity",
                    "size": "$cartDetails.size",
                    "productCode": "$productDetails.productCode",
                    "productName": "$productDetails.productName",
                    "title": "$productDetails.title",
                    "images": "$productDetails.images",
                    "price1": "$productDetails.price1",
                    "price2": "$productDetails.price2",
                    "category": "$categoryDetails.name",
                    "createdAt": 1,
                }
            }
        ];

        const countPipeline = [...commonPipeline, { $count: "totalCount" }];
        const aggregationPipeline = [
            ...commonPipeline,
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
        ];

        const countResult = await Order.aggregate(countPipeline);
        const totalCount = countResult[0]?.totalCount || 0;

        const orderDetails = await Order.aggregate(aggregationPipeline);
        const paginatedResults = orderDetails || [];

        return res.status(200).json({
            message: "canceled orders retrieved successfully!",
            order: paginatedResults,
            orderTotal: totalCount,
        });
    } catch (error) {
        console.error("Error fetching canceled orders:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

exports.returnStatus = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;

        const search = req.query.search;
        const fieldsToSearch = ["status"];

        const matchQuery = {
            $and: [
                { status: "5" }, 
                {
                    $or: fieldsToSearch.map((field) => ({
                        [field]: { $regex: search, $options: "i" },
                    })),
                },
            ],
        };

        const commonPipeline = [
            {
                $match: matchQuery, 
            },
            {
                $lookup: {
                    from: "cartdetails",
                    localField: "cartId",
                    foreignField: "_id",
                    as: "cartDetails",
                },
            },
            {
                $unwind: "$cartDetails",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "cartDetails.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.categoryId",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: "$categoryDetails",
            },
            {
                $project: {
                    "_id": 1,
                    "userId": 1,
                    "cartId": 1,
                    "status": 1,
                    "orderCode": 1,
                    "totalPrice": 1,
                    "quantity": "$cartDetails.quantity",
                    "size": "$cartDetails.size",
                    "productCode": "$productDetails.productCode",
                    "productName": "$productDetails.productName",
                    "title": "$productDetails.title",
                    "images": "$productDetails.images",
                    "price1": "$productDetails.price1",
                    "price2": "$productDetails.price2",
                    "category": "$categoryDetails.name",
                    "createdAt": 1,
                }
            }
        ];

        const countPipeline = [...commonPipeline, { $count: "totalCount" }];
        const aggregationPipeline = [
            ...commonPipeline,
            { $skip: skip },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
        ];

        const countResult = await Order.aggregate(countPipeline);
        const totalCount = countResult[0]?.totalCount || 0;

        const orderDetails = await Order.aggregate(aggregationPipeline);
        const paginatedResults = orderDetails || [];

        return res.status(200).json({
            message: "return orders retrieved successfully!",
            order: paginatedResults,
            orderTotal: totalCount,
        });
    } catch (error) {
        console.error("Error fetching return orders:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};


// ----------------- end status apis -----------------