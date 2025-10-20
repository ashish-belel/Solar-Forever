// document.addEventListener('DOMContentLoaded', function () {
//     // PASTE YOUR FIREBASE CONFIG OBJECT HERE
//     const firebaseConfig = {
<<<<<<< Updated upstream
//       apiKey: "AIzaSyA5qKJibHW8GK_L8Th4oPYLbONR0vWYQ8c", // Your real API Key
=======
//       apiKey: "AIzaSy...", // Your real API Key
>>>>>>> Stashed changes
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


<<<<<<< Updated upstream

document.addEventListener('DOMContentLoaded', () => {

  // --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFazdEmqatvQaFgrEiC7btxohKXbkGOyw",
  authDomain: "solar-forever.firebaseapp.com",
  databaseURL: "https://solar-forever-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "solar-forever",
  storageBucket: "solar-forever.firebasestorage.app",
  messagingSenderId: "15804210993",
  appId: "1:15804210993:web:f031750b9651e609b69a10",
  measurementId: "G-T6955CSP1N"
};
  // --- Initialize Firebase ---
  try {
=======
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
>>>>>>> Stashed changes
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- Global State & UI References ---
    let currentUser = null;
    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
<<<<<<< Updated upstream

    // =================================================================
    // PART 1: MODAL AND UI LOGIC
    // =================================================================

    // --- Modal Helper Functions ---
    const openModal = (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'flex';
      }
    };

    const closeModal = (modal) => {
      if (modal) {
        modal.style.display = 'none';
      }
    };

    // --- Header "Login / Sign Up" Button ---
    // THIS IS THE CODE FOR YOUR BUTTON
    const loginSignupBtn = document.getElementById('login-signup-btn-desktop');
    if (loginSignupBtn) {
      loginSignupBtn.addEventListener('click', () => {
        if (currentUser) {
          // If user is logged in, log them out
          auth.signOut();
        } else {
          // If user is logged out, show login modal
          openModal('authModal');
          resetAuthForms();
        }
      });
    }

    // --- "Get Started" Buttons (Hero and Mobile) ---
    const getStartedBtns = document.querySelectorAll('.get-started-btn');
    getStartedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        openModal('buyOrSellModal');
      });
    });

    // --- "View Details" Buttons in Marketplace ---
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        openModal('productDetailModal');
        const card = e.target.closest('.group');
        const title = card.querySelector('h3').textContent;
        const condition = card.querySelector('.text-gray-600').textContent;
        const price = card.querySelector('.text-blue-700').textContent;
        const imgSrc = card.querySelector('img').src;

        document.getElementById('modal-product-img').src = imgSrc;
        document.getElementById('modal-product-title').textContent = title;
        document.getElementById('modal-product-condition').textContent = condition;
        document.getElementById('modal-product-price').textContent = price;
        try {
          document.getElementById('modal-product-wattage').textContent = title.split('W')[0] + 'W';
          document.getElementById('modal-product-age').textContent = condition.match(/\(([^)]+)\)/)[1];
        } catch (err) { /* ignore if parsing fails */ }
        document.getElementById('modal-product-status').textContent = "Expert Verified";
      });
    });

    // --- "Interested?" Button (inside Product Detail Modal) ---
    const interestedBtn = document.getElementById('interested-btn');
    if (interestedBtn) {
      interestedBtn.addEventListener('click', () => {
        closeModal(document.getElementById('productDetailModal'));
        openModal('interestedQueryModal');
      });
    }

    // --- All "Close" Buttons ---
    const closeBtns = document.querySelectorAll('.close-modal-btn');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalToClose = e.target.closest('.modal-backdrop');
        if (modalToClose) {
          closeModal(modalToClose);
        }
      });
    });

    // --- Close modal by clicking on the backdrop ---
    const allModals = document.querySelectorAll('.modal-backdrop');
    allModals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // --- Mobile Menu Button ---
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // --- Auth Modal Tabs (Login/Signup) ---
    const loginTab = document.getElementById('login-tab-btn');
    const signupTab = document.getElementById('signup-tab-btn');
    if (loginTab && signupTab && loginForm && signupForm) {
      loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        resetAuthForms();
      });

      signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        resetAuthForms();
      });
    }

    // --- Sticky Header on Scroll ---
    const header = document.getElementById('header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }

    // --- Set current year in footer ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }


    // =================================================================
    // PART 2: FIREBASE AUTH LOGIC
    // =================================================================

    // --- CORE AUTH LOGIC ---
    auth.onAuthStateChanged(user => {
      currentUser = user;
      const loginBtnDesktop = document.getElementById('login-signup-btn-desktop');
      if (user) {
        console.log("User is signed in:", user.phoneNumber);
        loginBtnDesktop.textContent = 'Logout';
      } else {
        console.log("User is signed out.");
        loginBtnDesktop.textContent = 'Login / Sign Up';
      }
    });

    // Function to clear old reCAPTCHA
    // Function to clear old reCAPTCHA
    function clearRecaptcha() {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null; // Set it to null after clearing
      }
    }
    
    // Function to reset auth forms to their original state
    function resetAuthForms() {
        clearRecaptcha();
        
        // Reset Login Form
        if(loginForm) loginForm.reset();
        const loginPhoneSection = document.getElementById('login-phone-section');
        const loginOtpSection = document.getElementById('login-otp-section');
        const loginButton = document.getElementById('login-button');
        
        if (loginPhoneSection) loginPhoneSection.classList.remove('hidden');
        if (loginOtpSection) loginOtpSection.classList.add('hidden');
        if (loginButton) loginButton.textContent = 'Send OTP';

        // Reset Signup Form
        if(signupForm) signupForm.reset();
        const signupDetailsSection = document.getElementById('signup-details-section');
        const signupOtpSection = document.getElementById('signup-otp-section');
        const signupButton = document.getElementById('signup-button');

        if (signupDetailsSection) signupDetailsSection.classList.remove('hidden');
        if (signupOtpSection) signupOtpSection.classList.add('hidden');
        if (signupButton) signupButton.textContent = 'Send OTP & Sign Up';
    }


    // --- Sign-In Flow ---
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const loginButton = document.getElementById('login-button');

        if (loginButton.textContent.includes('Send')) {
          // Phase 1: Send OTP
          clearRecaptcha();
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-login', { 'size': 'invisible' });
          const phoneNumber = document.getElementById('login-phone').value;
          
          auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
            .then(confirmationResult => {
              window.confirmationResult = confirmationResult;
              document.getElementById('login-phone-section').classList.add('hidden');
              document.getElementById('login-otp-section').classList.remove('hidden');
              loginButton.textContent = 'Verify OTP';
              alert('OTP sent successfully!');
            }).catch(error => alert("Sign in failed: " + error.message));
        } else {
          // Phase 2: Verify OTP
          const otp = document.getElementById('login-otp').value;
          if (!otp) {
              alert("Please enter the OTP.");
              return;
          }
          window.confirmationResult.confirm(otp).then(result => {
            alert("Successfully signed in!");
            closeModal(authModal);
            resetAuthForms();
          }).catch(error => {
              alert("Invalid OTP: " + error.message);
          });
        }
      });
    }

    // --- Sign-Up Flow ---
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const signupButton = document.getElementById('signup-button');

        if (signupButton.textContent.includes('Send')) {
          // Phase 1: Send OTP
          clearRecaptcha();
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-signup', { 'size': 'invisible' });
          const phoneNumber = document.getElementById('signup-phone').value;
          
          auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
            .then(confirmationResult => {
              window.confirmationResult = confirmationResult;
              document.getElementById('signup-details-section').classList.add('hidden');
              document.getElementById('signup-otp-section').classList.remove('hidden');
              signupButton.textContent = 'Create Account';
              alert('OTP sent successfully!');
            }).catch(error => alert("Sign up failed: " + error.message));
        } else {
          // Phase 2: Verify OTP and Create Profile
          const otp = document.getElementById('signup-otp').value;
          if (!otp) {
              alert("Please enter the OTP.");
              return;
          }
          window.confirmationResult.confirm(otp).then(result => {
            const user = result.user;
            const name = document.getElementById('signup-name').value;
            const address = document.getElementById('signup-address').value;
            
            // Save user info to Firestore
            return db.collection('users').doc(user.uid).set({
              name: name,
              address: address,
              phoneNumber: user.phoneNumber,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }).then(() => {
            alert("Account created successfully!");
            closeModal(authModal);
            resetAuthForms();
          }).catch(error => alert("Account creation failed: " + error.message));
        }
      });
    }

  } catch (error) {
    console.error("Firebase initialization failed:", error);
    alert("Could not connect to services. Please try again later.");
  }
=======
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
>>>>>>> Stashed changes
});