const axios = require('axios');
const crypto = require('crypto');

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const ENV = process.env.PHONEPE_ENV || 'sandbox'; // 'sandbox' or 'production'

const BASE_URL = ENV === 'production'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

/**
 * Generate SHA256 Checksum for PhonePe
 */
const generateChecksum = (payload, endpoint) => {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToHash = base64Payload + endpoint + SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return `${sha256}###${SALT_INDEX}`;
};

/**
 * Initiate Payment Request
 */
exports.initiatePayment = async (orderId, amount, userPhone) => {
    const merchantTransactionId = `MT${Date.now()}${orderId.toString().slice(-4)}`;
    const endpoint = '/pg/v1/pay';

    const payload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: `MUID${orderId.toString().slice(-4)}`,
        amount: Math.round(amount * 100), // In Paise
        redirectUrl: `${process.env.FRONTEND_URL}/payment-status/${merchantTransactionId}`,
        redirectMode: 'POST', // PhonePe will POST status to this URL
        callbackUrl: `${process.env.BACKEND_URL}/api/v1/orders/phonepe-callback`,
        mobileNumber: userPhone,
        paymentInstrument: {
            type: 'PAY_PAGE'
        }
    };

    const checksum = generateChecksum(payload, endpoint);
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

    try {
        const response = await axios.post(`${BASE_URL}${endpoint}`,
            { request: base64Payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'accept': 'application/json'
                }
            }
        );

        if (response.data.success) {
            return {
                merchantTransactionId,
                redirectUrl: response.data.data.instrumentResponse.redirectInfo.url
            };
        } else {
            throw new Error(response.data.message || 'PhonePe payment initiation failed');
        }
    } catch (error) {
        console.error('PhonePe Error:', error.response?.data || error.message);
        throw new Error('Failed to connect to PhonePe');
    }
};

/**
 * Check Transaction Status
 */
exports.checkStatus = async (merchantTransactionId) => {
    const endpoint = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
    const stringToHash = endpoint + SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256}###${SALT_INDEX}`;

    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': MERCHANT_ID,
                'accept': 'application/json'
            }
        });

        return {
            success: response.data.success,
            code: response.data.code,
            message: response.data.message,
            data: response.data.data
        };
    } catch (error) {
        console.error('PhonePe Status Error:', error.response?.data || error.message);
        return { success: false, code: 'ERROR', message: 'Failed to verify payment status' };
    }
};
