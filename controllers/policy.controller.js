const { response } = require("../utils/response")
const { Policy } = require("../models/index.model")

exports.addPolicy = async (req,res) => {
    console.log("Policy Data = ",req.body);
    try {
        const {title,description} = req.body;

        const policy = await Policy.findOne({title:title});

        if (policy) {
            return response(res,400, {
                status:false,
                msg:"Policy already exist"
            })
        }

        const policyData = new Policy({
            title: req.body.title,
            description: req.body.description
        });

        await policyData.save();

        return response(res,200, {
            status:true,
            msg:"Policy added successfully",
            policy:policyData
        })
        
    } catch (error) {
        console.log("Add Policy error = ",error);
        return response(res,500, {
            status:false,
            msg:"Internal server error"
        })
    }
}

exports.getPolicy = async (req,res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;
        const { id } = req.query;
        const search = req.query.search;
        const fieldsToSearch = ["title","description"];

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

        const policy = await Policy.aggregate(aggregationPipeline);
        const totalCount = policy.length; 

        return response(res, 200, {
            message: "policy retrieved successfully!",
            policy: policy,
            policyTotal: totalCount,
        });
    } catch (error) {
        console.error("Error in get policy:", error);
        return response(res, 500, {
            status: false,
            message: "Internal server error",
        });
    }
}

exports.updatePolicy = async (req, res) => {
    console.log("update data = ", req.body);
    console.log("Policy Id = ", req.query);
    try {
        const { title, description } = req.body;
        const { id } = req.query;

        const policy = await Policy.findById(id);

        if (!policy) {
            return response(res, 401, { success: false, message: "policy not found!" });
        }

        policy.title = title || policy.title;
        policy.description = description || policy.description;
        

        await policy.save();

        const updatePolicy = await Policy.findById(id);
        return response(res, 200, {
            success: true,
            message: "Attribute updated successfully!",
            policy: updatePolicy,
        });
    } catch (error) {
        console.error("Error in update Policy:", error);
        return response(res, 500, { success: false, message: error.message || "Internal Server Error" });
    }
};

exports.deletePolicy = async (req, res) => {
    try {
      const { id } = req.query;
  
      const deletePolicy = await Policy.findByIdAndDelete(id);
  
      if (!deletePolicy) {
        return response( res, 401, { success: false, message: "Policy not found!" });
      }
  
      return response( res, 200, { success: true, message: "Policy deleted successfully!", deletePolicy });
    } catch (error) {
      console.error(error);
      return response( res, 500, { success: false, message: "Could not delete Policy data!" });
    }
};