const { response } = require("../utils/response")
const { Setting } = require("../models/index.model")

exports.addSetting = async (req,res) => {
    console.log("Setting Data = ",req.body);
    try {
        let aboutBanner, homeBanner, logo, megaBanner;
        const {address,companyName,contact,email,footerText,headerOffer,shopTime,webText,razorApiSecret,razorKey,deliveryDay,returnDay} = req.body;

        if (req.files && req.files.length > 0) {
            aboutBanner = req.files.find(file => file.fieldname === 'aboutBanner').path;
            homeBanner = req.files.find(file => file.fieldname === 'homeBanner').path;
            logo = req.files.find(file => file.fieldname === 'logo').path;
            megaBanner = req.files.find(file => file.fieldname === 'megaBanner').path;
        }

        const setting = new Setting();

        setting.aboutBanner = aboutBanner || '';
        setting.homeBanner = homeBanner || '';
        setting.logo = logo || '';
        setting.megaBanner = megaBanner || '';

        setting.address = req.body.address || address
        setting.companyName = req.body.companyName || companyName
        setting.contact = req.body.contact || contact
        setting.email = req.body.email || email
        setting.footerText = req.body.footerText || footerText
        setting.headerOffer = req.body.headerOffer || headerOffer
        setting.shopTime = req.body.shopTime || shopTime
        setting.webText = req.body.webText || webText
        setting.razorApiSecret = req.body.razorApiSecret || razorApiSecret
        setting.razorKey = req.body.razorKey || razorKey
        setting.deliveryDay = req.body.deliveryDay || deliveryDay
        setting.returnDay = req.body.returnDay || returnDay

        await setting.save();

        return response(res,200, {
            status:true,
            msg:"Setting added successfully",
            setting:setting
        })
        
    } catch (error) {
        console.log("Add Setting error = ",error);
        return response(res,500, {
            status:false,
            msg:"Internal server error"
        })
    }
};

exports.getSetting = async (req,res) => {
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

        const setting = await Setting.aggregate(aggregationPipeline);
        const totalCount = setting.length; 

        return response(res, 200, {
            message: "setting retrieved successfully!",
            setting: setting,
            settingTotal: totalCount,
        });
    } catch (error) {
        console.error("Error in get setting:", error);
        return response(res, 500, {
            status: false,
            message: "Internal server error",
        });
    }
};

exports.updateSetting = async (req, res) => {
    console.log("Setting Data = ",req.body);
    console.log("settingId = ", req.query);
    try {
        let aboutBanner, homeBanner, logo, megaBanner; // this is images
        const {address,companyName,contact,email,footerText,headerOffer,shopTime,webText,razorApiSecret,razorKey,deliveryDay,returnDay} = req.body;
        const { id } = req.query;

        const setting = await Setting.findById(id);

        if (!setting) {
            return response(res, 401, { success: false, message: "Setting not found!" });
        }

        // update images
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (file.fieldname === 'aboutBanner') setting.aboutBanner = file.path;
                if (file.fieldname === 'homeBanner') setting.homeBanner = file.path;
                if (file.fieldname === 'logo') setting.logo = file.path;
                if (file.fieldname === 'megaBanner') setting.megaBanner = file.path;
            });
        }

        // update other fields
        setting.address = address || setting.address;
        setting.companyName = companyName || setting.companyName;
        setting.contact = contact || setting.contact;
        setting.email = email || setting.email;
        setting.footerText = footerText || setting.footerText;
        setting.headerOffer = headerOffer || setting.headerOffer;
        setting.shopTime = shopTime || setting.shopTime;
        setting.webText = webText || setting.webText;
        setting.razorApiSecret = razorApiSecret || setting.razorApiSecret;
        setting.razorKey = razorKey || setting.razorKey;
        setting.deliveryDay = deliveryDay || setting.deliveryDay;
        setting.returnDay = returnDay || setting.returnDay;

        await setting.save();

        const updateSetting = await Setting.findById(id);
        return response(res, 200, {
            success: true,
            message: "Setting updated successfully!",
            setting: updateSetting,
        });
    } catch (error) {
        console.error("Error in update Setting:", error);
        return response(res, 500, { success: false, message: error.message || "Internal Server Error" });
    }
};

exports.deleteSetting = async (req, res) => {
    try {
      const { id } = req.query;
  
      const deleteSetting = await Setting.findByIdAndDelete(id);
  
      if (!deleteSetting) {
        return response( res, 401, { success: false, message: "Setting not found!" });
      }
  
      return response( res, 200, { success: true, message: "Setting deleted successfully!", deleteSetting });
    } catch (error) {
      console.error(error);
      return response( res, 500, { success: false, message: "Could not delete Setting data!" });
    }
};