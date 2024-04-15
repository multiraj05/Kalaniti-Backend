const { Order,cartDetails,userInfo,productInfo} = require("../models/index.model");
const{ response }=require("../utils/response");
const mongoose =require("mongoose")

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
            totalPrice
        });

        await order.save();

        return response( res, 200, { status: true, message: 'Order created successfully', order });
    } catch (error) {
        console.error('Error creating order:', error);
        return response( res, 500, { status: false, message: 'Internal Server Error' });
    }
};

// exports.getOrders = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 0;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = page * limit;
//         const {orderId, search} = req.query;

//         if (orderId) {
//             const order = await Order.findById(orderId);
//             if (!order) {
//                 return response( res, 401, { status: false, message: 'Order not found' });
//             }
//             return response( res, 200, { status: true, message: 'Order retrieved successfully', order });
//         } else {
//             const fieldsToSearch = ["status"];
//             let matchQuery = {};
//             if (search) {
//                 matchQuery = {
//                     $or: [
//                         ...fieldsToSearch.map(field => ({ [field]: { $regex: search, $options: "i" } })),
//                         ...fieldsToSearch.map(field => ({
//                             $expr: {
//                                 $regexMatch: {
//                                     input: { $toString: `$${field}` },
//                                     regex: search,
//                                     options: "i",
//                                 },
//                             },
//                         }))
//                     ],
//                 };
//             }

//             const commonPipeline = [
//                 { $match: matchQuery },
//                 {
//                     $lookup: {
//                         from: "carts",
//                         localField: "cartId",
//                         foreignField: "_id",
//                         as: "cart",
//                     },
//                 },
//             ];

//             const countPipeline = [...commonPipeline, { $count: "totalCount" }];
//             const aggregationPipeline = [
//                 ...commonPipeline,
//                 { $skip: skip },
//                 { $limit: limit },
//                 { $sort: { createdAt: -1 } },
//             ];

//             const countResult = await Order.aggregate(countPipeline);
//             const totalCount = countResult[0]?.totalCount || 0;

//             const result = await Order.aggregate(aggregationPipeline);
//             const paginatedResults = result || [];

//             return response( res, 200, {
//                 status: true,
//                 message: "Orders retrieved successfully",
//                 orders: paginatedResults,
//                 totalOrders: totalCount
//             });
//         }
//     } catch (error) {
//         console.error("Error fetching orders:", error);
//         return response( res, 500, { status: false, message: "Internal Server Error" });
//     }
// };


// exports.getOrders = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 0;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = page * limit;
//         const { userId, orderId, search } = req.query;

//         if (orderId) {
//             const order = await Order.findById(orderId);
//             if (!order) {
//                 return response(res, 401, { status: false, message: 'Order not found' });
//             }
//             return response(res, 200, { status: true, message: 'Order retrieved successfully', order });
//         } else {
//             const fieldsToSearch = ["status"];
//             let matchQuery = { userId: userId };
//             if (search) {
//                 matchQuery.$or = [
//                     ...fieldsToSearch.map(field => ({ [field]: { $regex: search, $options: "i" } })),
//                     ...fieldsToSearch.map(field => ({
//                         $expr: {
//                             $regexMatch: {
//                                 input: { $toString: `$${field}` },
//                                 regex: search,
//                                 options: "i",
//                             },
//                         },
//                     }))
//                 ];
//             }

//             const commonPipeline = [
//                 { $match: matchQuery },
//                 {
//                     $lookup: {
//                         from: "cartdetails",
//                         localField: "cartId",
//                         foreignField: "_id",
//                         as: "cart",
//                     },
//                 },
//             ];

//             const countPipeline = [...commonPipeline, { $count: "totalCount" }];
//             const aggregationPipeline = [
//                 ...commonPipeline,
//                 { $skip: skip },
//                 { $limit: limit },
//                 { $sort: { createdAt: -1 } },
//             ];

//             const countResult = await Order.aggregate(countPipeline);
//             const totalCount = countResult[0]?.totalCount || 0;

//             const result = await Order.aggregate(aggregationPipeline);
//             const paginatedResults = result || [];

//             // New logic for retrieving cart information
//             const ordersWithCartInfo = await Promise.all(paginatedResults.map(async (order) => {
//                 const cart = await cartDetails.findById(order.cartId);
//                 const productCounts = cart.productInfo.reduce((acc, product) => {
//                     acc[product.productId] = acc[product.productId] ? acc[product.productId] + product.quantity : product.quantity;
//                     return acc;
//                 }, {});
//                 const products = await Promise.all(Object.keys(productCounts).map(productId => {
//                     return productInfo.findOne({ productId: productId });
//                 }));
//                 const orderDetails = products.map((product) => {
//                     return {
//                         productId: product.productId,
//                         name: product.name,
//                         price: product.price2,
//                         quantity: productCounts[product.productId]
//                     };
//                 });
//                 order.products = orderDetails;
//                 return order;
//             }));

//             return response(res, 200, {
//                 status: true,
//                 message: "Orders retrieved successfully",
//                 orders: ordersWithCartInfo,
//                 totalOrders: totalCount
//             });
//         }
//     } catch (error) {
//         console.error("Error fetching orders:", error);
//         return response(res, 500, { status: false, message: "Internal Server Error" });
//     }
// };

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
        const { userId, orderId, search } = req.query;

        let matchQuery = {};

        if (userId) {
            matchQuery = {
                userId: new mongoose.Types.ObjectId(userId)
            };
        }

        if (!orderId && !userId) {
            return response(res, 400, { status: false, message: "Please provide orderId or userId" });
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
                    "_id":1,
                    "userId":1,
                    "cartId":1,
                    "status":1,
                    "totalPrice":1,
                    "quantity":"$cartDetails.quantity",
                    "size":"$cartDetails.size",
                    "productCode": "$productDetails.productCode",
                    "productName": "$productDetails.productName",
                    "title":"$productDetails.title",
                    "images":"$productDetails.images",
                    "price1":"$productDetails.price1",
                    "price2":"$productDetails.price2",
                    "category":"$categoryDetails.name",
                    "createdAt":1,
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
            orders: paginatedResults,
            ordersTotal: totalCount,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return response(res, 500, { status: false, message: "Internal Server Error" });
    }
};


