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
}