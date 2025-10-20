// js/app.js

// ✅ Step 1: Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBFazdEmqatvQaFgrEiC7btxohKXbkGOyw",
  authDomain: "solar-forever.firebaseapp.com",
  projectId: "solar-forever",
  storageBucket: "solar-forever.appspot.com",
  messagingSenderId: "15804210993",
  appId: "1:15804210993:web:f031750b9651e609b69a10"
};

// ✅ Step 2: Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ✅ Step 3: Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// ✅ Step 4: Add event listeners safely
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const sendBtn = document.getElementById("sendBtn");

  // Example: Login with Google
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then(result => {
          console.log("✅ Logged in:", result.user.displayName);
          alert(`Welcome ${result.user.displayName}!`);
        })
        .catch(err => console.error("Login error:", err.message));
    });
  }

  // Example: Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.signOut().then(() => {
        console.log("✅ Logged out");
        alert("You have been logged out!");
      });
    });
  }

  // Example: Send message (if Firestore connected)
  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      const msgInput = document.getElementById("msgInput");
      if (msgInput && msgInput.value.trim() !== "") {
        db.collection("messages").add({
          text: msgInput.value,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          msgInput.value = "";
          alert("Message sent!");
        });
      }
    });
  }
});
