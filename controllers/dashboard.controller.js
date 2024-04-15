// user , product , category , order - return,pending,canceled,delivered,confirmed , payment

const { response } = require("../utils/response")
const {userInfo, productInfo,categoryInfo ,Order} = require("../models/index.model")


exports.getDashboard = async (req, res) => {
    try {
        const [
            totalUser,
            totalProduct,
            totalCategory,
            totalOrder,
            totalPendingOrder,
            totalConfirmedOrder,
            totalDeliveredOrder,
            totalCanceledOrder,
            totalReturnOrder,
            totalMaleUsers,
            totalFemaleUsers,
        ] = await Promise.all([
            userInfo.countDocuments(),
            productInfo.countDocuments(),
            categoryInfo.countDocuments(),
            Order.countDocuments(),
            Order.countDocuments({ status: "1" }),
            Order.countDocuments({ status: "2" }),
            Order.countDocuments({ status: '3' }),
            Order.countDocuments({ status: '4' }),
            Order.countDocuments({ status: '5' }),
            userInfo.countDocuments({ gender: 'Male' }),
            userInfo.countDocuments({ gender: 'Female' }),
        ])

        const dashboard = {
            totalUser,
            totalProduct,
            totalCategory,
            totalOrder,
            totalPendingOrder,
            totalConfirmedOrder,
            totalDeliveredOrder,
            totalCanceledOrder,
            totalReturnOrder,
            totalMaleUsers,
            totalFemaleUsers,
        }

        return response(res, 200, {
            message: "Dashboard Get Successfully !!",
            dashboard,
          });
    } catch (error) {
        console.log("Error in Dashboard", error);
        return response(res, 500, { status: false, message: "Internal Server Error" });
    }
}