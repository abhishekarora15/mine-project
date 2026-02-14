const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/responseFormatter');

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return error(res, 'You are not logged in! Please log in to get access.', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return error(res, 'The user belonging to this token no longer exists.', 401);
        }

        req.user = currentUser;
        next();
    } catch (err) {
        error(res, 'Invalid token or session expired', 401);
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return error(res, 'You do not have permission to perform this action', 403);
        }
        next();
    };
};
