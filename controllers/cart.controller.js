const mongoose = require("mongoose");
const { cartDetails, userInfo, productInfo } = require("../models/index.model");
const {response} = require("../utils/response");

exports.addToCart = async (req, res) => {
  try {
    const { productId, userId, quantity, size } = req.query;

    console.log("req.query", req.query);

    if (!productId || !userId || !quantity || !size) {
      return response( res, 201 ,{ status: false ,  message: "Missing required parameters" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return response( res, 401 ,{ status: false ,  message: "Invalid user ID" });
    }
    if (!size) {
      return response( res, 201 ,{ status: false ,  message: "Size is required" });
    }
    let oldProduct = await cartDetails.findOne({ productId, userId });

    if (oldProduct) {

      oldProduct.size = size;
      oldProduct.quantity = oldProduct.quantity + parseInt(quantity);
      oldProduct.totalCount = calculateTotalCount(oldProduct); 
      await oldProduct.save();
      return response( res, 200,{status: true , message: "Product added to cart", cart: oldProduct });
    }

    const cart = new cartDetails()
      cart.productId=productId,
      cart.userId=userId,
      cart.size=size,
      cart.quantity= parseInt(quantity),
      cart.totalCount=0
    await cart.save();

    console.log("Product added to cart:", cart);
    return response( res, 200,  { status: true , message: "Product added to cart", cart });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return response( res, 500, { status: false, message: "Internal Server Error" });
  }
};

exports.getCart = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;
    const userId = req.query.userId;
    const search = req.query.search || '';
    const fieldsToSearch = ["userId"];

    const matchQuery = {
      userId:new  mongoose.Types.ObjectId(userId),
      $or: [
        {
            $or: fieldsToSearch.map((field) => ({
                [field]: { $regex: String(search), $options: "i" },
            })),
        },
        {
            $or: fieldsToSearch.map((field) => ({
                $expr: {
                    $regexMatch: {
                        input: { $toString: `$${field}` },
                        regex: search,
                        options: "i",
                    },
                },
            }
            )
            ),
        },
    ],
    };

    const commonPipeline = [
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    const countPipeline = [...commonPipeline, { $count: "totalCount" }];
    const aggregationPipeline = [
      ...commonPipeline,
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
    ];

    const countResult = await cartDetails.aggregate(countPipeline);
    const totalCount = countResult[0]?.totalCount || 0;

    const Result = await cartDetails.aggregate(aggregationPipeline);
    const paginatedResults = Result || [];

    return response(res, 200, {
      message: "cart reterived Successfully !!",
      cartData: paginatedResults,
      cartDataTotal: totalCount,
    });
  } catch (error) {
    console.error("Error in cart:", error);
    return response(res, 500, error.message || "Internal Server Error");
  }
};

exports.changeqty = async (req, res) => {
  try {
    const { cartId, quantity } = req.query;

    const cartData = await cartDetails.findById(cartId);
    if (!cartData) {
      return response( res, 401, { status: false, message: "Cart detail not found" });
    }

    const product = await productInfo.findById(cartData.productId);
    if (!product) {
      return response( res, 401, { status: false, message: "Product not found" });
    }

    const newQty = cartData.quantity + Number(quantity);
    if (newQty < 0) {
      return response( res, 201, { status: false, message: "Quantity cannot be less than 0" });
    }

    const total = newQty * product.price2;

    const updatedCartData = await cartDetails.findByIdAndUpdate(
      cartId,
      { quantity: newQty, total: total },
      { new: true }
    );

    console.log("Updated cart data:", updatedCartData);

    return response( res, 200, { status: true, message: "Quantity updated successfully", updatedCartData });
  } catch (error) {
    console.error("Error updating quantity:", error);
    return response( res, 500, { status: false, message: "Internal Server Error" });
  }
};

exports.updateData = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.query);
    const { id } = req.query;

    const category = await cartDetails.findById(id);
    if (!category) {
      throw new response( res, 401, { success: false, message: "Category not found!"});
    }

    await cartDetails.updateOne({ _id: id }, req.body);

    const updatedCategory = await cartDetails.findById(id);
    return response( res, 200, {
      success: true,
      message: "Category updated successfully!",
      category: updatedCategory,
    });
  } catch (error) {
    return response( res, 500, { success: false, message: error.message });
  }
};

exports.deleteData = async (req, res) => {
  try {
    const { id } = req.query;

    const deletedCart = await cartDetails.findByIdAndDelete(id);

    if (!deletedCart) {
      return response( res, 401, { success: false, message: "Cart not found!" });
    }

    return response( res, 200, { success: true, message: "Cart data deleted successfully!", deletedCart });
  } catch (error) {
    console.error(error);
    return response( res, 500, { success: false, message: "Could not delete cart data!" });
  }
};