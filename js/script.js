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
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- Global State & UI References ---
    let currentUser = null;
    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const buyOrSellModal = document.getElementById('buyOrSellModal');


    // =================================================================
    // PART 1: MODAL AND UI LOGIC
    // =================================================================

    // --- Modal Helper Functions --- (*** THIS IS THE CORRECTED PART ***)
    // --- Modal Helper Functions (UPDATED) ---
const openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    // Instead of changing display, add the 'active' class
    modal.classList.add('active');
  }
};

const closeModal = (modal) => {
  if (modal) {
    // Instead of changing display, remove the 'active' class
    modal.classList.remove('active');
  }
};

    // --- Header "Login / Sign Up" Button ---
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

    // --- Buy/Sell Modal Buttons ---
    const buyBtn = document.getElementById('buy-btn');
    const sellBtn = document.getElementById('sell-btn');

    if (buyBtn && buyOrSellModal) {
      buyBtn.addEventListener('click', () => {
        closeModal(buyOrSellModal); // Close the current modal
        openModal('buyRequestModal'); // Open the "Buy Request" modal
      });
    }

    if (sellBtn && buyOrSellModal) {
      sellBtn.addEventListener('click', () => {
        closeModal(buyOrSellModal); // Close the current modal
        openModal('sellPanelModal'); // Open the "Sell Panel" modal
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
        if (loginBtnDesktop) loginBtnDesktop.textContent = 'Logout';
      } else {
        console.log("User is signed out.");
        if (loginBtnDesktop) loginBtnDesktop.textContent = 'Login / Sign Up';
      }
    });

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
      if (loginForm) loginForm.reset();
      const loginPhoneSection = document.getElementById('login-phone-section');
      const loginOtpSection = document.getElementById('login-otp-section');
      const loginButton = document.getElementById('login-button');

      if (loginPhoneSection) loginPhoneSection.classList.remove('hidden');
      if (loginOtpSection) loginOtpSection.classList.add('hidden');
      if (loginButton) loginButton.textContent = 'Send OTP';

      // Reset Signup Form
      if (signupForm) signupForm.reset();
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
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-login', {
            'size': 'invisible'
          });
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
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-signup', {
            'size': 'invisible'
          });
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

});
