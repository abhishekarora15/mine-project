import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '../constants/config';
import useAuthStore from '../store/authStore';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// We use dynamic require to avoid side-effects in Expo Go (SDK 54+)
let Notifications;
if (!isExpoGo) {
    try {
        Notifications = require('expo-notifications');
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
    } catch (e) {
        console.log('expo-notifications not available');
    }
}

/**
 * Request permissions and register for push notifications
 */
export async function registerForPushNotificationsAsync() {
    if (isExpoGo) {
        console.log('⚠️ Skipping push notification registration: Not supported in Expo Go (SDK 53+).');
        return null;
    }

    if (!Notifications) return null;

    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        try {
            token = (await Notifications.getDevicePushTokenAsync()).data;
            console.log('📱 Device Push Token:', token);
        } catch (e) {
            console.log('Error getting push token', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

/**
 * Send the FCM token to the backend
 */
export async function updateFCMTokenOnBackend(token) {
    if (!token) return;
    try {
        const authToken = useAuthStore.getState().token;
        if (!authToken) return;

        await axios.post(`${API_URL}/users/update-fcm-token`,
            { fcmToken: token },
            { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log('✅ FCM Token registered on backend');
    } catch (error) {
        console.error('❌ Failed to update FCM token on backend:', error.response?.data || error.message);
    }
}
