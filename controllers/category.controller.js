const { categoryInfo } = require("../models/index.model");
const{response}=require("../utils/response");
const mongoose=require("mongoose")
const {uniqueId} = require('../utils/generateCode.js');

exports.createCategory = async (req, res) => {
    console.log("Category Image = ", req.file);
    try {
        const { name} = req.body;
        let categoryId;
        if (!name) {
            return response( res, 201, { status: false, message: 'Category name is required' });
        }

        if (req.body.categoryId) {
            categoryId = req.body.categoryId;
        }else{
            category.categoryId = uniqueId(10);
        }

        const category = new categoryInfo();

        category.name = name;
        category.categoryId = categoryId;

        if (req.file) {
            category.image = req.file.path;
        }

        await category.save();

        return response( res, 200, { status: true, message: 'Category created successfully', categories:category });
    } catch (error) {
        console.error(error);
        return response( res, 500, { status: false, message: 'Internal server error' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;
        const { id } = req.query;
        const search = req.query.search;
        const fieldsToSearch = ["name","categoryId"];

        let matchQuery = {}; 

        if (id) {
            matchQuery = {
                _id: new mongoose.Types.ObjectId(id)
            };
        }

        if (search) {
            matchQuery = {
                $or: [
                    ...fieldsToSearch.map(field => ({
                        [field]: { $regex: search, $options: "i" }
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
                    from: "products",
                    localField: "_id",
                    foreignField: "categoryId",
                    as: "products",
                },
            },
            {
                $addFields: {
                    productsCount: { $size: "$products" }
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: { createdAt: -1 }
            }
        ];

        const aggregationPipeline = [
            ...commonPipeline
        ];

        const categories = await categoryInfo.aggregate(aggregationPipeline);
        const totalCount = categories.length; 

        return response(res, 200, {
            message: "Categories retrieved successfully!",
            categories: categories,
            categoriesTotal: totalCount,
        });
    } catch (error) {
        console.error("Error in getCategories:", error);
        return response(res, 500, error.message || "Internal Server Error");
    }
};

exports.updateCategory = async (req, res) => {
    console.log("update data = ",req.body);
    console.log("categoryId = ",req.query);
    console.log("categoryImage = ",req.file);
    try {
        const {name} = req.body
        const { id } = req.query;
  
      const category = await categoryInfo.findById(id);

      if (!category) {
        return response( res, 401, { success: false, message: "Category not found!" });
      }

      category.name = name || category.name;
      category.image = req?.file?.path || category.image;
  
      await category.save();
  
      const updatedCategory = await categoryInfo.findById(id);
      return response( res, 200, {
        success: true,
        message: "Category updated successfully!",
        categories: updatedCategory,
      });
    } catch (error) {
      return response( res, 500, { success: false, message:  error.message || "Internal Server Error" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
      const { id } = req.query;
  
      const deletedCategory = await categoryInfo.findByIdAndDelete(id);
  
      if (!deletedCategory) {
        return response( res, 401, { success: false, message: "Category not found!" });
      }
  
      return response( res, 200, { success: true, message: "Category deleted successfully!", deletedCategory });
    } catch (error) {
      console.error(error);
      return response( res, 500, { success: false, message: "Could not delete cart data!" });
    }
};