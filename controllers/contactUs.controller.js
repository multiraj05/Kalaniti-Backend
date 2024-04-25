const { response } = require("../utils/response")
const { contactUs } = require("../models/index.model")

exports.addContactUs = async (req,res) => {
    console.log("contactUs Data = ",req.body);
    try {
        const {name,email,phone,message} = req.body;

        const contact = new contactUs();

        contact.name = req.body.name || name
        contact.email = req.body.email || email
        contact.phone = req.body.phone || phone
        contact.message = req.body.message || message

        await contact.save();

        return response(res,200, {
            status:true,
            msg:"contactUs added successfully",
            contactUs:contact
        })
        
    } catch (error) {
        console.log("Add contactUs error = ",error);
        return response(res,500, {
            status:false,
            msg:"Internal server error"
        })
    }
};

exports.getContactUs = async (req,res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const skip = page * limit;
        const { id } = req.query;
        const search = req.query.search;
        const fieldsToSearch = ["companyName"];

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

        const contactus = await contactUs.aggregate(aggregationPipeline);
        const totalCount = contactus.length; 

        return response(res, 200, {
            message: "contactUs retrieved successfully!",
            contactUs: contactus,
            contactUsTotal: totalCount,
        });
    } catch (error) {
        console.error("Error in get contactUs:", error);
        return response(res, 500, {
            status: false,
            message: "Internal server error",
        });
    }
};

exports.updateContactUs = async (req, res) => {
    console.log("contactUs Data = ",req.body);
    console.log("contactUs Id = ", req.query);
    try {
        const {name,email,phone,message} = req.body;
        const { id } = req.query;

        const contact = await contactUs.findById(id);

        if (!contact) {
            return response(res, 401, { success: false, message: "Setting not found!" });
        }


        // update other fields
        contact.name = name || contact.name;
        contact.email = email || contact.email;
        contact.phone = phone || contact.phone;
        contact.message = message || contact.message;

        await contact.save();

        const updateContactUs = await contactUs.findById(id);
        return response(res, 200, {
            success: true,
            message: "Setting updated successfully!",
            contactUs: updateContactUs,
        });
    } catch (error) {
        console.error("Error in update contactUs:", error);
        return response(res, 500, { success: false, message: error.message || "Internal Server Error" });
    }
};

exports.deleteContactUs = async (req, res) => {
    try {
      const { id } = req.query;
  
      const deleteContactUs = await contactUs.findByIdAndDelete(id);
  
      if (!deleteContactUs) {
        return response( res, 401, { success: false, message: "contactUs not found!" });
      }
  
      return response( res, 200, { success: true, message: "contactUs deleted successfully!", deleteContactUs });
    } catch (error) {
      console.error(error);
      return response( res, 500, { success: false, message: "Could not delete contactUs data!" });
    }
};