const admin = require('firebase-admin');
const path = require('path');

try {
    const serviceAccount = require('./serviceAccountKey.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('🔥 Firebase Admin SDK Initialized');
} catch (error) {
    console.warn('⚠️ Firebase Admin SDK could not be initialized. Please ensure server/config/serviceAccountKey.json exists.');
}

module.exports = admin;
