const { productInfo, categoryInfo } = require("../models/index.model");
const mongoose = require("mongoose");
const fs = require("fs");
const { response } = require("../utils/response");
const { ObjectId } = mongoose.Types;

exports.addProduct = async (req, res) => {
  try {
    const requiredFields = [
      "title",
      "productName",
      "price1",
      "price2",
      "description",
      "categoryId",
    ];
    
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return response(res, 201, { message: "Missing required fields: " + missingFields.join(", ") });
    }

    if (!req.files || req.files.length === 0) {
      return response(res, 201, { message: "Please upload at least one image" });
    }

    const imagePaths = req.files.map((file) => file.path);

    let categoryIdObj;
    if (req.body.categoryId) {
      if (!ObjectId.isValid(req.body.categoryId)) {
        return response(res, 201, { message: "Invalid category ID" });
      }
      categoryIdObj = new ObjectId(req.body.categoryId);
    }

    const productData = new productInfo({
      title: req.body.title,
      productName: req.body.productName,
      price1: req.body.price1,
      price2: req.body.price2,
      description: req.body.description,
      images: imagePaths,
      categoryId: categoryIdObj,
    });

    await productData.save();

    return response(res, 200, { message: "Product added successfully", data: productData });
  } catch (error) {
    console.error(error);
    return response(res, 500, { message: "Internal server error" });
  }
};

exports.getProducts = async (req, res) => {
  try {
      const { categoryId, productId } = req.query;
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      console.log(req.query);
      const skip = page * limit;
      const search = req.query.search;
      const fieldsToSearch = ["name"];

      let matchQuery = {};

      if (categoryId) {
          matchQuery = {
              categoryId: new mongoose.Types.ObjectId(categoryId)
          };
      }

      if (productId) {
          matchQuery = {
              _id: new mongoose.Types.ObjectId(productId)
          };
      }

      if (search) {
          matchQuery = {
              $or: [
                  ...fieldsToSearch.map(field => ({
                      [field]: { $regex: search, $options: "i" }
                  })),
                  ...fieldsToSearch.map(field => ({
                      $expr: {
                          $regexMatch: {
                              input: { $toString: `$${field}` },
                              regex: search,
                              options: "i"
                          }
                      }
                  }))
              ]
          };
      }

      const commonPipeline = [
          {
              $match: matchQuery,
          },
      ];

      const countPipeline = [...commonPipeline, { $count: "totalCount" }];
      const aggregationPipeline = [
          ...commonPipeline,
          { $skip: skip },
          { $limit: limit },
          { $sort: { createdAt: -1 } },
      ];

      const countResult = await productInfo.aggregate(countPipeline);
      const totalCount = countResult[0]?.totalCount || 0;

      const Result = await productInfo.aggregate(aggregationPipeline);
      const paginatedResults = Result || [];

      return response( res, 200, {
          status: "success",
          message: "All products retrieved successfully",
          products: paginatedResults,
          productsTotal: totalCount,
      });
  } catch (error) {
      console.error("Error in getProducts:", error);
      return response( res, 500, {
          status: "error",
          message: "Internal server error",
      })
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.query.productId;
    const updates = req.body;

    if (!productId) {
      return response( res, 201, { status: 'error', message: 'Product ID is required' });
    }

    const product = await productInfo.findById(productId);

    if (!product) {
      return response( res, 401, { status: 'error', message: 'Product not found' });
    }

    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });

    await product.save();

    return response( res , 200, { status: 'success', message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    return response( res, 500, { status: 'error', message: 'Internal Server Error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
      const { productId } = req.query;

      const deletedProduct = await productInfo.findByIdAndDelete(productId);

      if (!deletedProduct) {
          return response( res, 401, { status: "error", message: "Product not found!" });
      }

     return response( res, 200,{ status: "success", message: "Product deleted successfully!", deletedProduct });
  } catch (error) {
      console.error(error);
      return response( res , 500, { status: "error", message: "Could not delete product data!" });
  }
};


// ============= find by category product ================

exports.getProductsById = async (req, res) => {
  try {
      const { categoryId} = req.query;
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      console.log(req.query);
      const skip = page * limit;
      const search = req.query.search;
      const fieldsToSearch = ["name"];

      let matchQuery = {};

      if (categoryId) {
          matchQuery = {
              categoryId: new mongoose.Types.ObjectId(categoryId)
          };
      }

      // if (productId) {
      //     matchQuery = {
      //         _id: new mongoose.Types.ObjectId(productId)
      //     };
      // }

      if (search) {
          matchQuery = {
              $or: [
                  ...fieldsToSearch.map(field => ({
                      [field]: { $regex: search, $options: "i" }
                  })),
                  ...fieldsToSearch.map(field => ({
                      $expr: {
                          $regexMatch: {
                              input: { $toString: `$${field}` },
                              regex: search,
                              options: "i"
                          }
                      }
                  }))
              ]
          };
      }

      const commonPipeline = [
          {
              $match: matchQuery,
          },
      ];

      const countPipeline = [...commonPipeline, { $count: "totalCount" }];
      const aggregationPipeline = [
          ...commonPipeline,
          { $skip: skip },
          { $limit: limit },
          { $sort: { createdAt: -1 } },
      ];

      const countResult = await productInfo.aggregate(countPipeline);
      const totalCount = countResult[0]?.totalCount || 0;

      const Result = await productInfo.aggregate(aggregationPipeline);
      const paginatedResults = Result || [];

      return response( res, 200, {
          status: "success",
          message: "All products retrieved successfully",
          products: paginatedResults,
          productsTotal: totalCount,
      });
  } catch (error) {
      console.error("Error in getProducts:", error);
      return response( res, 500, {
          status: "error",
          message: "Internal server error",
      })
  }
};