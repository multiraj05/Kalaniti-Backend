const { Banner } = require("../models/index.model");
const { response } = require("../utils/response");
const mongoose = require("mongoose");

exports.create = async (req, res) => {
    console.log("banner data = ",req.body);
    console.log("banner Image = ",req.file);

    try {

        const { title, url } = req.body;

        if (!title || !url) {
            return response(res, 201, {
                status: false,
                message: "oops...! || some fields are required"
            })
        }

        const banner = await Banner();

        banner.title = title;
        banner.url = url;

        if (req.file) {
            banner.image = req.file.path;
        }

        await banner.save();

        return response(res, 200, {
            status: true,
            message: "Banner created successfully",
            banner
        })
        
    } catch (error) {
        console.log("banner create error = ",error);
        return response(res, 500 , 
        {
            status: false,
            message: "Internal Server Error"
        }
        );
    }
}

exports.show = async (req, res) => {
    console.log("banner id = ",req.query);
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;
        const { id } = req.query
        const search = req.query.search;
        const fieldsToSearch = ["image", "title", "url"];

        let matchQuery = {};

        if (id) {
            matchQuery = {
                _id: new mongoose.Types.ObjectId(id)
            };
        }else {
            matchQuery = {
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


        const countResult = await Banner.aggregate(countPipeline);
        const totalCount = countResult[0]?.totalCount || 0;

        const Result = await Banner.aggregate(aggregationPipeline);
        const paginatedResults = Result || [];

        return response(res, 200, {
            status: true,
            message: "Banner reterived Successfully !!",
            banner: paginatedResults,
            bannerTotal: totalCount,
        });
    } catch (error) {
        console.log("banner show error = ",error);
        return response(res, 500 ,
        {
            status: false,
            message: "Internal Server Error"
        })
    }
}

exports.update = async (req, res) => {
    console.log("Banner update data = ",req.body);
    console.log("BannerId = ",req.query);
    console.log("Banner Image = ",req.file);

    try {
        const { title, url } = req.body
        const { id } = req.query;

        const banner = await Banner.findById(id);

        if (!banner) {
            return response( res, 401, 
                { status: false, message: "Banner not found!" });
        }

        banner.title = title || banner.title;
        banner.url = url || banner.url;
        banner.image = req?.file?.path || banner.image;
    
        await banner.save();
    
        const updateBanner = await Banner.findById(id);
        return response( res, 200, {
          status: true,
          message: "Banner updated successfully!",
          banner: updateBanner,
        });
        
    } catch (error) {
        console.log("banner update error = ",error);
        return response(res, 500 ,
        {
            status: false,
            message: "Internal Server Error"
        })
    }
}

exports.delete = async (req, res) => {
    try {
      const { id } = req.query;
  
      const banner = await Banner.findByIdAndDelete(id);
  
      if (!banner) {
        return response( res, 401, 
        { 
            status: false, 
            message: "Banner not found!" 
        });
      }
  
        return response( res, 200, 
        { 
            success: true, 
            message: "Banner deleted successfully!", 
            banner: banner 
        });

    } catch (error) {
      console.error("Error deleting banner = ", error);
        return response( res, 500, 
        { 
            status: false, 
            message: "Could not delete banner data!" 
        });
    }
};

exports.enableDesableBanner = async (req, res) => {
    const { id } = req.query;
    try {
      if (!id) {
        return response(res, 201, {
          status: false,
          message: "Oops! Invalid Details!",
        });
      }
      const banner = await Banner.findById(id);
  
      if (!banner) {
        return response(res, 201, {
          status: false,
          message: "Oops! Invalid Banner ID!",
        });
      }

      banner.isActive = !banner.isActive;
      await banner.save();
  
      return response(res, 200, {
        message: "Banner Status Updated Successfully !!",
        banner,
      });
    } catch (error) {
      console.error("Error updating banner status = ", error);
      return response(res, 500, {
        status: false,
        message: "Internal Server Error",
      });
    }
};