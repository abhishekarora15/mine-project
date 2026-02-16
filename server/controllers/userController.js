const User = require('../models/User');
const { success, error } = require('../utils/responseFormatter');
const AppError = require('../utils/appError');

/**
 * Update the FCM token for the current user
 */
exports.updateFCMToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return next(new AppError('FCM Token is required', 400));
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { fcmToken },
            { new: true, runValidators: true }
        );

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        success(res, {
            message: 'FCM Token updated successfully',
            token: user.fcmToken
        });
    } catch (err) {
        next(err);
    }
};
