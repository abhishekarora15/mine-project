const admin = require('../config/firebase');
const User = require('../models/User');

/**
 * Send a push notification to a specific user
 * @param {string} userId - The ID of the user to notify
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload for deep linking
 */
exports.sendPushNotification = async (userId, title, body, data = {}) => {
    try {
        const user = await User.findById(userId).select('fcmToken');

        if (!user || !user.fcmToken) {
            console.log(`ℹ️ Skipping notification: No FCM token found for user ${userId}`);
            return;
        }

        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK', // Common for RN/Flutter
            },
            token: user.fcmToken,
        };

        const response = await admin.messaging().send(message);
        console.log('✅ Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('❌ Error sending push notification:', error);
    }
};

/**
 * Send a push notification to multiple users (e.g., all admins or a topic)
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
exports.sendMulticastNotification = async (userIds, title, body, data = {}) => {
    try {
        const users = await User.find({ _id: { $in: userIds } }).select('fcmToken');
        const tokens = users.map(u => u.fcmToken).filter(token => !!token);

        if (tokens.length === 0) return;

        const message = {
            notification: { title, body },
            data,
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`${response.successCount} messages were sent successfully`);
        return response;
    } catch (error) {
        console.error('❌ Error sending multicast notification:', error);
    }
};
