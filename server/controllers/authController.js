const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { success } = require('../utils/responseFormatter');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password and security fields from output
    user.password = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    return success(res, { token, user }, statusCode);
};

exports.register = catchAsync(async (req, res, next) => {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
        return next(new AppError('Please provide all required fields', 400));
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
        return next(new AppError('User with this email or phone already exists', 400));
    }

    const newUser = await User.create({
        name,
        email,
        phone,
        password,
        role,
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // 1) Check if user exists & password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 2) If everything ok, send token to client
    createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    // In production, you would send an actual email here.
    // For now, we return it in the response for testing.
    success(res, {
        message: 'Token sent to email!',
        resetToken // DO NOT send this in production, send via email only
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    success(res, { user });
});
