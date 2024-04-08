//JWT Token
const jwt = require("jsonwebtoken");
const { response } = require("../utils/response");
const {userInfo} = require('../models/index.model');

exports.checkUserAuth = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization");

    console.log("Authorization",Authorization);

    if (!Authorization || Authorization == undefined) {
      return response(res, 401, { message: "Oops ! You are not Authorized" })
    }

    const decodeToken = await jwt.verify(
      Authorization,
      process.env.JWT_SECRET
    );

    const user = await userInfo.findById(decodeToken._id);

    req.user = user;
    next();
  } catch (error) {
    response(res, 500, error)
  }
};

exports.getCart = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const skip = page * limit;
      const { userId } = req.query
      const search = req.query.search;
      const fieldsToSearch = ["productId"];

      let matchQuery = {};

      if (userId) {
          matchQuery = {
              _id: 
              new mongoose.Types.ObjectId(userId)
          };

      } else {
          matchQuery = {
              $or: [
                  {
                      $or: fieldsToSearch.map((field) => ({
                          [field]: { $regex: search, $options: "i" },
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


      const countResult = await cartDetails.aggregate(countPipeline);
      console.log(countResult);
      const totalCount = countResult[0]?.totalCount || 0;
      console.log(totalCount);

      const Result = await cartDetails.aggregate(aggregationPipeline);
      const paginatedResults = Result || [];

      return response(res, 200, {
          message: "Get cart Successfully !!",
          cartData: paginatedResults,
          cartDataTotal: totalCount,
      });
  } catch (error) {
      console.error("Error in cart:", error);
      return response(res, 500, error.message || "Internal Server Error");
  }
};