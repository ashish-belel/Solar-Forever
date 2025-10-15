// src/config/firebase.js
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json'); // Download this from Firebase console

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://<solar-forever>.firebaseio.com"
});

const db = getFirestore();

module.exports = db;
// Replace <YOUR_PROJECT_ID> with your actual Firebase project ID