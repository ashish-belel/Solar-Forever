// document.addEventListener('DOMContentLoaded', function () {
//     // PASTE YOUR FIREBASE CONFIG OBJECT HERE
//     const firebaseConfig = {
//       apiKey: "AIzaSy...", // Your real API Key
//       authDomain: "solar-forever.firebaseapp.com",
//       projectId: "solar-forever",
//       storageBucket: "solar-forever.appspot.com",
//       messagingSenderId: "15804210993",
//       appId: "1:15804210993:web:f031750b9651e609b69a10"
//     };

//     // --- Initialize Firebase ---
//     const app = firebase.initializeApp(firebaseConfig);
//     const auth = auth = firebase.auth();
//     const db = firebase.firestore();

//     // --- Global State & UI References ---
//     let currentUser = null;
//     const authModal = document.getElementById('authModal');
//     const loginForm = document.getElementById('login-form');
//     const signupForm = document.getElementById('signup-form');
//     // ... (add other UI references as needed)

//     // --- CORE AUTH LOGIC ---
//     auth.onAuthStateChanged(user => {
//         currentUser = user;
//         // Update UI based on login state
//     });

//     // Function to clear old reCAPTCHA
//     function clearRecaptcha() {
//         if (window.recaptchaVerifier) {
//             window.recaptchaVerifier.clear();
//         }
//     }

//     // --- Sign-In Flow ---
//     loginForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const loginButton = document.getElementById('login-button');
        
//         if (loginButton.textContent.includes('Send')) {
//             // Phase 1: Send OTP
//             clearRecaptcha();
//             window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-login', { 'size': 'invisible' });
//             const phoneNumber = document.getElementById('login-phone').value;
//             auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
//                 .then(confirmationResult => {
//                     window.confirmationResult = confirmationResult;
//                     document.getElementById('login-phone-section').classList.add('hidden');
//                     document.getElementById('login-otp-section').classList.remove('hidden');
//                     loginButton.textContent = 'Verify OTP';
//                 }).catch(error => alert("Sign in failed: " + error.message));
//         } else {
//             // Phase 2: Verify OTP
//             const otp = document.getElementById('login-otp').value;
//             window.confirmationResult.confirm(otp).then(result => {
//                 alert("Successfully signed in!");
//                 hideModal(authModal);
//             }).catch(error => alert("Invalid OTP: " + error.message));
//         }
//     });

//     // --- Sign-Up Flow ---
//     signupForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const signupButton = document.getElementById('signup-button');

//         if (signupButton.textContent.includes('Send')) {
//             // Phase 1: Send OTP
//             clearRecaptcha();
//             window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-signup', { 'size': 'invisible' });
//             const phoneNumber = document.getElementById('signup-phone').value;
//             auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
//                 .then(confirmationResult => {
//                     window.confirmationResult = confirmationResult;
//                     document.getElementById('signup-details-section').classList.add('hidden');
//                     document.getElementById('signup-otp-section').classList.remove('hidden');
//                     signupButton.textContent = 'Create Account';
//                 }).catch(error => alert("Sign up failed: " + error.message));
//         } else {
//             // Phase 2: Verify OTP and Create Profile
//             const otp = document.getElementById('signup-otp').value;
//             window.confirmationResult.confirm(otp).then(result => {
//                 const user = result.user;
//                 const name = document.getElementById('signup-name').value;
//                 const address = document.getElementById('signup-address').value;
//                 return db.collection('users').doc(user.uid).set({
//                     name: name,
//                     address: address,
//                     phoneNumber: user.phoneNumber,
//                     createdAt: firebase.firestore.FieldValue.serverTimestamp()
//                 });
//             }).then(() => {
//                 alert("Account created successfully!");
//                 hideModal(authModal);
//             }).catch(error => alert("Account creation failed: " + error.message));
//         }
//     });

//     // Add your other modal logic and event listeners here
//     function hideModal(modal) { modal.classList.remove('active'); }
// });


// function onClick(e) {
//   e.preventDefault();
//   grecaptcha.enterprise.ready(async () => {
//     const token = await grecaptcha.enterprise.execute('6LdesuMrAAAAAK7UJkVOg4UU0oem15qNufUm6giy', {action: 'LOGIN'});
//     // IMPORTANT: The 'token' that results from execute is an encrypted response sent by
//     // reCAPTCHA to the end user's browser.
//     // This token must be validated by creating an assessment.
//     // See https://cloud.google.com/recaptcha/docs/create-assessment
//   });
// }

//   function onClick(e) {
//     e.preventDefault();
//     grecaptcha.enterprise.ready(async () => {
//       const token = await grecaptcha.enterprise.execute('6LdesuMrAAAAAK7UJkVOg4UU0oem15qNufUm6giy', {action: 'LOGIN'});
//     });
//   }


document.addEventListener('DOMContentLoaded', function () {
    // PASTE YOUR FIREBASE CONFIG OBJECT HERE
    // Make sure this is filled with your real keys!
    const firebaseConfig = {
      apiKey: "AIzaSyBFazdEmqatvQaFgrEiC7btxohKXbkGOyw", // Your real API Key
      authDomain: "solar-forever.firebaseapp.com",
      projectId: "solar-forever",
      storageBucket: "solar-forever.appspot.com",
      messagingSenderId: "15804210993",
      appId: "1:15804210993:web:f031750b9651e609b69a10"
    };

    // --- Initialize Firebase ---
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- Global State & UI References ---
    let currentUser = null;
    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTabBtn = document.getElementById('login-tab-btn');
    const signupTabBtn = document.getElementById('signup-tab-btn');
    // ... (add other UI references for your other modals)

    // --- CORE AUTH LOGIC ---
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            console.log("User is logged in:", user.phoneNumber);
            // You can update your 'Login / Sign Up' button text here
        } else {
            console.log("User is logged out.");
        }
    });

    // Function to clear old reCAPTCHA
    function clearRecaptcha() {
        if (window.recaptchaVerifier) {
            console.log("Clearing old reCAPTCHA");
            window.recaptchaVerifier.clear();
        }
    }
    
    // --- Tab Switching Logic ---
    loginTabBtn.addEventListener('click', () => {
        loginTabBtn.classList.add('active');
        signupTabBtn.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');

        // Prepare reCAPTCHA for login
        clearRecaptcha();
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-login', { 
            'size': 'invisible',
            'callback': (response) => { console.log('Login reCAPTCHA solved'); }
        });
    });

    signupTabBtn.addEventListener('click', () => {
        signupTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        
        // Prepare reCAPTCHA for signup
        clearRecaptcha();
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-signup', { 
            'size': 'invisible',
            'callback': (response) => { console.log('Signup reCAPTCHA solved'); }
        });
    });

    // --- Sign-In Flow ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const loginButton = document.getElementById('login-button');
        
        if (loginButton.textContent.includes('Send')) {
            // Phase 1: Send OTP
            const phoneNumber = document.getElementById('login-phone').value;
            auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
                .then(confirmationResult => {
                    console.log("OTP Sent (Login)");
                    window.confirmationResult = confirmationResult;
                    document.getElementById('login-phone-section').classList.add('hidden');
                    document.getElementById('login-otp-section').classList.remove('hidden');
                    loginButton.textContent = 'Verify OTP';
                }).catch(error => {
                    alert("Sign in failed: " + error.message);
                    clearRecaptcha(); // Reset on error
                });
        } else {
            // Phase 2: Verify OTP
            const otp = document.getElementById('login-otp').value;
            window.confirmationResult.confirm(otp).then(result => {
                alert("Successfully signed in!");
                hideModal(authModal);
                // Reset form for next time
                document.getElementById('login-phone-section').classList.remove('hidden');
                document.getElementById('login-otp-section').classList.add('hidden');
                loginButton.textContent = 'Send OTP';
            }).catch(error => alert("Invalid OTP: " + error.message));
        }
    });

    // --- Sign-Up Flow ---
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const signupButton = document.getElementById('signup-button');

        if (signupButton.textContent.includes('Send')) {
            // Phase 1: Send OTP
            const phoneNumber = document.getElementById('signup-phone').value;
            auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
                .then(confirmationResult => {
                    console.log("OTP Sent (Signup)");
                    window.confirmationResult = confirmationResult;
                    document.getElementById('signup-details-section').classList.add('hidden');
                    document.getElementById('signup-otp-section').classList.remove('hidden');
                    signupButton.textContent = 'Create Account';
                }).catch(error => {
                    alert("Sign up failed: " + error.message);
                    clearRecaptcha(); // Reset on error
                });
        } else {
            // Phase 2: Verify OTP and Create Profile
            const otp = document.getElementById('signup-otp').value;
            window.confirmationResult.confirm(otp).then(result => {
                const user = result.user;
                const name = document.getElementById('signup-name').value;
                const address = document.getElementById('signup-address').value;
                
                console.log("Creating user profile...");
                return db.collection('users').doc(user.uid).set({
                    name: name,
                    address: address,
                    phoneNumber: user.phoneNumber,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }).then(() => {
                alert("Account created successfully!");
                hideModal(authModal);
                // Reset form for next time
                document.getElementById('signup-details-section').classList.remove('hidden');
                document.getElementById('signup-otp-section').classList.add('hidden');
                signupButton.textContent = 'Send OTP';
            }).catch(error => alert("Account creation failed: " + error.message));
        }
    });

    // --- Other Modal & UI Logic ---
    // (Add your listeners for getStartedBtns, buyBtn, sellBtn, etc. here)
    function showModal(modal) { modal.classList.add('active'); }
    function hideModal(modal) { modal.classList.remove('active'); }

    // Example:
    // const getStartedBtns = document.querySelectorAll('.get-started-btn');
    // getStartedBtns.forEach(btn => {
    //     btn.addEventListener('click', () => {
    //         showModal(document.getElementById('buyOrSellModal'));
    //     });
    // });
    
    // Close modal logic
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal-btn')) {
                hideModal(modal);
            }
        });
    });

    // Set year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Manually trigger the login tab click to load the first reCAPTCHA
    loginTabBtn.click();
});