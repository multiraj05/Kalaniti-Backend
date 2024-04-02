const Razorpay = require("razorpay");
const { response } = require("../utils/response");

exports.payment = (req, res) => {

    const amt = Number(req.query.amt);

    var instance = new Razorpay({
        key_id: 'rzp_test_17XLKO8XNQKqKS',
        key_secret: 'fawK3GCJ02QR3XB7VXx1fMI6'
    });

    var options = {
        amount: amt * 100,
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    instance.orders.create(options, function (err, order) {

        if (err) {
            console.log(err);
            return;
        }
        return response(res, 200, { order })
    });

};