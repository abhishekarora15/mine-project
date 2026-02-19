require('dotenv').config();
const admin = require('firebase-admin');

try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('🔥 Firebase Admin SDK Initialized Successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.warn('⚠️ Make sure FIREBASE_SERVICE_ACCOUNT env var is set with the full JSON content.');
}

module.exports = admin;

