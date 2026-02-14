/**
 * Standard utility for sending success and error responses
 */

const success = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({
        status: 'success',
        results: Array.isArray(data) ? data.length : undefined,
        data: data
    });
};

const error = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({
        status: 'error',
        message: message
    });
};

module.exports = {
    success,
    error
};
