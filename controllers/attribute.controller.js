const { response } = require("../utils/response")
const {Attribute} = require("../models/index.model")

exports.addAttribute = async (req,res) => {
    console.log("attribute Data = ",req.body);
    try {
        const {attrName,details} = req.body;

        const Attribute = await Attribute.findOne({attrName:attrName});

        if (Attribute) {
            return response(res,400, {
                status:false,
                msg:"Attribute already exist"
            })
        }

        const attributeData = new Attribute({
            attrName: req.body.attrName,
            details: req.body.details
        });

        await attributeData.save();

        return response(res,200, {
            status:true,
            msg:"Attribute added successfully",
            attributes:attributeData
        })
        
    } catch (error) {
        console.log("Add attribute error = ",error);
        return response(res,500, {
            status:false,
            msg:"Internal server error"
        })
    }
}

exports.getAttribute = async (req,res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;
        const { id } = req.query;
        const search = req.query.search;
        const fieldsToSearch = ["attrName","details"];

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

        const attributes = await Attribute.aggregate(aggregationPipeline);
        const totalCount = attributes.length; 

        return response(res, 200, {
            message: "attributes retrieved successfully!",
            attributes: attributes,
            attributesTotal: totalCount,
        });
    } catch (error) {
        console.error("Error in get attribute:", error);
        return response(res, 500, {
            status: false,
            message: "Internal server error",
        });
    }
}

exports.updateAttribute = async (req, res) => {
    console.log("update data = ", req.body);
    console.log("attributeId = ", req.query);
    try {
        const { details } = req.body;
        const { id } = req.query;

        const attribute = await Attribute.findById(id);

        if (!attribute) {
            return response(res, 401, { success: false, message: "Attribute not found!" });
        }

        // If details is provided in the request and it's a valid string
        if (details !== undefined && typeof details === 'string') {
            attribute.details.push(details); // Append the new detail
        } else {
            return response(res, 400, { success: false, message: "Invalid details provided!" });
        }

        await attribute.save();

        const updatedAttribute = await Attribute.findById(id);
        return response(res, 200, {
            success: true,
            message: "Attribute updated successfully!",
            attributes: updatedAttribute,
        });
    } catch (error) {
        console.error("Error in update attribute:", error);
        return response(res, 500, { success: false, message: error.message || "Internal Server Error" });
    }
};