const { Order,cartDetails,userInfo} = require("../models/index.model");
const{ response }=require("../utils/response");
const mongoose =require("mongoose")

exports.createOrder = async (req, res) => {
    try {
        const { cartId, userId,totalPrice } = req.query;

        if (!cartId || !userId ||!totalPrice ) {
            return response( res, 400, { status: false, message: 'cartId, userId, and totalPrice are required' });
        }
        const user = await userInfo.findById(userId);
        if (!user) {
            return response( res, 404, { status: false, message: 'User not found' });
        }
        const cart = await cartDetails.findById(cartId);
        if (!cart) {
            return response( res, 404, { status: false, message: 'Cart not found' });
        }

        const order = new Order({
            cartId,
            userId,
            totalPrice
        });

        await order.save();

        return response( res, 201, { status: true, message: 'Order created successfully', order });
    } catch (error) {
        console.error('Error creating order:', error);
        return response( res, 500, { status: false, message: 'Internal Server Error' });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;
        const {orderId, search,cardId } = req.query;

        if (orderId) {
            const order = await Order.findById(orderId);
            if (!order) {
                return response( res, 404, { status: false, message: 'Order not found' });
            }
            return response( res, 200, { status: true, message: 'Order retrieved successfully', order });
        } else {
            const fieldsToSearch = ["status"];
            let matchQuery = {};
            if (search) {
                matchQuery = {
                    $or: [
                        ...fieldsToSearch.map(field => ({ [field]: { $regex: search, $options: "i" } })),
                        ...fieldsToSearch.map(field => ({
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: `$${field}` },
                                    regex: search,
                                    options: "i",
                                },
                            },
                        }))
                    ],
                };
            }

            const commonPipeline = [
                { $match: matchQuery },
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

            const result = await Order.aggregate(aggregationPipeline);
            const paginatedResults = result || [];

            return response( res, 200, {
                status: true,
                message: "Orders retrieved successfully",
                orders: paginatedResults,
                totalOrders: totalCount
            });
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
        return response( res, 500, { status: false, message: "Internal Server Error" });
    }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.query;
    const { status } = req.body;

    if (!orderId || !status) {
      return response( res, 400, { status: 'error', message: 'Order ID and status are required' });
    }

    const validStatus = ['pending', 'processing', 'shipped', 'delivered'];
    if (!validStatus.includes(status)) {
      return response( res, 400, { status: 'error', message: 'Invalid status' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return response( res, 404, { status: 'error', message: 'Order not found' });
    }

    return response( res, 200, { status: 'success', message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return response( res, 500, { status: 'error', message: 'Internal Server Error' });
  }
};