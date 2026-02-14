const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/responseFormatter');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    return success(res, { token, user }, statusCode);
};

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        if (!name || !email || !phone || !password) {
            return error(res, 'Please provide all required fields', 400);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return error(res, 'User with this email or phone already exists', 400);
        }

        const newUser = await User.create({
            name,
            email,
            phone,
            password,
            role,
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return error(res, 'Please provide email and password', 400);
        }

        // 1) Check if user exists & password is correct
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return error(res, 'Incorrect email or password', 401);
        }

        // 2) If everything ok, send token to client
        createSendToken(user, 200, res);
    } catch (err) {
        error(res, err.message, 400);
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        success(res, { user });
    } catch (err) {
        error(res, err.message, 400);
    }
};
