const firebaseConfig = {
  apiKey: "AIzaSyBFazdEmqatvQaFgrEiC7btxohKXbkGOyw",
  authDomain: "solar-forever.firebaseapp.com",
  databaseURL: "https://solar-forever-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "solar-forever",
  storageBucket: "solar-forever.firebasestorage.app",
  messagingSenderId: "15804210993",
  appId: "1:15804210993:web:50a812c621a7cc1eb69a10",
  measurementId: "G-4X8N9FQY64"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}