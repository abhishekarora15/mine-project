const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in environment variables');
    }

    return new Razorpay({
        key_id,
        key_secret,
    });
};

exports.createOrder = async (amount) => {
    const instance = getRazorpayInstance();
    const options = {
        amount: Math.round(amount * 100), // Paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    };

    return await instance.orders.create(options);
};

exports.verifyPayment = (orderId, paymentId, signature) => {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
        throw new Error('RAZORPAY_KEY_SECRET is missing');
    }

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(body.toString())
        .digest('hex');

    return expectedSignature === signature;
};
