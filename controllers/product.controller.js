const { productInfo, categoryInfo } = require("../models/index.model");
const mongoose = require("mongoose");
const fs = require("fs");
const { response } = require("../utils/response");
const { ObjectId } = mongoose.Types;
const {uniqueId} = require('../utils/generateCode');
const {deleteFilesPath}=require('../utils/deleteFile.js');

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
    console.log(req.body);
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
      productCode: uniqueId(10),
    });

    await productData.save();

    return response(res, 200, { message: "Product added successfully", products: productData });
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
      const fieldsToSearch = ["title","productName","productCode","price1","price2","description","categoryId"];  

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
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            }
          },
          {
              $unwind: {
                  path: "$category",
                  preserveNullAndEmptyArrays: true,
              },
          },
          {
              $project: {
                  _id: 1,
                  title: 1,
                  productName: 1,
                  price1: 1,
                  price2: 1,
                  description: 1,
                  images: 1,
                  category: "$category.name",
                  productCode: 1,
                  createdAt: 1,
                  isTrend:1
              },
          }
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

  console.log("product id = ",req.query);
  console.log("product data = ",req.body);

  try {
    const {id} = req.query;
    const { productName, price1, price2 , title, description,categoryId} = req.body;

    const product = await productInfo.findById(id);

    console.log("product = ",product);

    if (!product) {
      return response( res, 401, { status: 'error', message: 'Product not found' });
    }
    if (req.files && req.files.length > 0) {
      const oldImages = product.images;
    
      product.images = [];

      
      req.files.forEach(file => {
        product.images.push(file.path);
          console.log('file.path', file.path)
      });
      
      deleteFilesPath(oldImages);
  }
  

    product.title = title || product.title;
    product.productName = productName || product.productName;
    product.price1 = price1 || product.price1;
    product.price2 = price2 || product.price2;
    product.description = description || product.description;
    product.categoryId = categoryId || product.categoryId;
    // product.images = req.files.map((file) => file.path) || product.images;

    await product.save();

    const updateProduct = await productInfo.findById(id);

    return response( res , 200, { status: 'success', message: 'Product updated successfully', products:updateProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return response( res, 500, { status: 'error', message: 'Internal Server Error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
      const { id } = req.query;

      const deletedProduct = await productInfo.findByIdAndDelete(id);

      if (!deletedProduct) {
          return response( res, 401, { status: "error", message: "Product not found!" });
      }

     return response( res, 200,{ status: "success", message: "Product deleted successfully!", products:deletedProduct });
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

// ================= update isTrend status ================

exports.enableDisableTrend = async (req, res) => {
    const { id } = req.query;
    try {
      if (!id) {
        return response(res, 201, {
          status: false,
          message: "Oops! Invalid Details!",
        });
      }
      const product = await productInfo.findById(id);
  
      if (!product) {
        return response(res, 201, {
          status: false,
          message: "Oops! Invalid Product ID!",
        });
      }

      product.isTrend = !product.isTrend;
      await product.save();
  
      return response(res, 200, {
        message: "Product isTrend Status Updated Successfully !!",
        products:product,
      });
    } catch (error) {
      console.error("Error updating banner status = ", error);
      return response(res, 500, {
        status: false,
        message: "Internal Server Error",
      });
    }
};

exports.showProduct = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const skip = page * limit;
      const search = req.query.search;
      const fieldsToSearch = ["image", "title", "url"];


      const matchQuery = {
          $and: [
              { isTrend: true }, 
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

      return response(res, 200, {
          status: true,
          message: "productInfo reterived Successfully !!",
          products: paginatedResults,
          productsTotal: totalCount,
      });
  } catch (error) {
      console.log("productInfo show error = ",error);
      return response(res, 500 ,
      {
          status: false,
          message: "Internal Server Error"
      })
  }
}