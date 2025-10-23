document.addEventListener('DOMContentLoaded', () => {

  // --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
  const firebaseConfig = {
    apiKey: "AIzaSyBFazdEmqatvQaFgrEiC7btxohKXbkGOyw",
    authDomain: "solar-forever.firebaseapp.com",
    databaseURL: "https://solar-forever-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "solar-forever",
    storageBucket: "solar-forever.firebasestorage.app", // Corrected bucket name
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
    const sellForm = document.getElementById('sell-form');
    const buyForm = document.getElementById('buy-form');

    // =================================================================
    // PART 1: MODAL AND UI LOGIC
    // =================================================================

    // --- Modal Helper Functions ---
    const openModal = (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active'); // Use class for CSS transitions
      }
    };

    const closeModal = (modal) => {
      if (modal) {
        modal.classList.remove('active'); // Use class for CSS transitions
      }
    };

    // --- Header "Login / Sign Up" Button (Desktop) ---
    const loginSignupBtnDesktop = document.getElementById('login-signup-btn-desktop');
    if (loginSignupBtnDesktop) {
      loginSignupBtnDesktop.addEventListener('click', () => {
        if (currentUser) {
          auth.signOut();
        } else {
          openModal('authModal');
          resetAuthForms();
        }
      });
    }

    // --- Event Listener for Mobile Login/Signup Button ---
    const loginSignupBtnMobile = document.getElementById('login-signup-btn-mobile');
    const mobileMenu = document.getElementById('mobile-menu');
    if (loginSignupBtnMobile) {
      loginSignupBtnMobile.addEventListener('click', () => {
        if (currentUser) {
          auth.signOut();
          if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
             mobileMenu.classList.add('hidden');
          }
        } else {
          openModal('authModal');
          resetAuthForms();
           if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
             mobileMenu.classList.add('hidden');
          }
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
        const productDetailModal = document.getElementById('productDetailModal');
        openModal('productDetailModal');
        const card = e.target.closest('.group');
        const title = card.querySelector('h3').textContent;
        const condition = card.querySelector('.text-gray-600').textContent;
        const price = card.querySelector('.text-blue-700').textContent;
        const imgSrc = card.querySelector('img').src;

        // Store product title in the modal element's dataset for later retrieval
        if (productDetailModal) {
            productDetailModal.dataset.productTitle = title || 'Unknown Product';
        }


        document.getElementById('modal-product-img').src = imgSrc;
        document.getElementById('modal-product-title').textContent = title;
        document.getElementById('modal-product-condition').textContent = condition;
        document.getElementById('modal-product-price').textContent = price;
        try {
          document.getElementById('modal-product-wattage').textContent = title.split('W')[0] + 'W';
          document.getElementById('modal-product-age').textContent = condition.match(/\(([^)]+)\)/)[1];
        } catch (err) { /* ignore */ }
        document.getElementById('modal-product-status').textContent = "Expert Verified";
      });
    });

    // --- "Interested?" Button (inside Product Detail Modal) --- Updated Logic ---
    const interestedBtn = document.getElementById('interested-btn');
    if (interestedBtn) {
      interestedBtn.addEventListener('click', () => {
        const productDetailModal = document.getElementById('productDetailModal');

        if (currentUser) {
          // --- User is logged in, proceed to save interest ---
          const productTitle = productDetailModal ? productDetailModal.dataset.productTitle : 'Unknown Product';

          // Attempt to get user details from 'users' collection (assuming it might still exist from previous logic)
          // **Important:** Since we removed saving to 'users' in signup, this fetch might fail
          // if the user signed up *after* that code removal. Handle this gracefully.
          db.collection('users').doc(currentUser.uid).get()
            .then(doc => {
              let userName = 'N/A';
              let userLocation = 'N/A';
              if (doc.exists) {
                userName = doc.data().name || 'N/A';
                userLocation = doc.data().address || 'N/A';
              } else {
                // Handle case where user profile data wasn't saved (or collection doesn't exist)
                console.warn("User profile data not found in Firestore for UID:", currentUser.uid);
                // Optionally, prompt user for details here if needed
              }

              // Save data to 'interestedQueries' collection
              return db.collection('interestedQueries').add({
                userId: currentUser.uid,
                userName: userName,
                userLocation: userLocation,
                userPhone: currentUser.phoneNumber,
                productTitle: productTitle,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
              });
            })
            .then(() => {
              // Successfully saved interest
              console.log('Interest registered for user:', currentUser.uid, 'for product:', productTitle);
              closeModal(productDetailModal);
              openModal('interestedQueryModal'); // Show success modal
            })
            .catch(error => {
              console.error("Error saving interest or fetching user data: ", error);
              alert("There was an error registering your interest. Please try again.");
              closeModal(productDetailModal); // Still close product modal on error
            });

        } else {
          // --- User is NOT logged in ---
          closeModal(productDetailModal); // Close the product details
          alert("Please log in or sign up to express interest."); // Inform the user
          openModal('authModal'); // Open the login/signup modal
          resetAuthForms(); // Reset the forms
        }
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
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // --- Buy/Sell Modal Buttons (with Login Check) ---
    const buyBtn = document.getElementById('buy-btn');
    const sellBtn = document.getElementById('sell-btn');
    const buyOrSellModal = document.getElementById('buyOrSellModal');

    if (buyBtn && buyOrSellModal) {
      buyBtn.addEventListener('click', () => {
        closeModal(buyOrSellModal);
        if (currentUser) {
           openModal('buyRequestModal');
        } else {
           alert("Please log in or sign up to buy panels.");
           openModal('authModal');
           resetAuthForms();
        }
      });
    }

    if (sellBtn && buyOrSellModal) {
      sellBtn.addEventListener('click', () => {
        closeModal(buyOrSellModal);
        if (currentUser) {
            openModal('sellPanelModal');
        } else {
            alert("Please log in or sign up to sell panels.");
            openModal('authModal');
            resetAuthForms();
        }
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
    // PART 2: FIREBASE AUTH LOGIC & FORM VALIDATION
    // =================================================================

    // --- CORE AUTH LOGIC ---
    auth.onAuthStateChanged(user => {
      currentUser = user;
      const loginBtnDesktop = document.getElementById('login-signup-btn-desktop');
      const loginBtnMobile = document.getElementById('login-signup-btn-mobile');
      if (user) {
        console.log("User is signed in:", user.phoneNumber);
        if (loginBtnDesktop) loginBtnDesktop.textContent = 'Logout';
        if (loginBtnMobile) loginBtnMobile.textContent = 'Logout';
      } else {
        console.log("User is signed out.");
        if (loginBtnDesktop) loginBtnDesktop.textContent = 'Login / Sign Up';
        if (loginBtnMobile) loginBtnMobile.textContent = 'Login / Sign Up';
      }
    });

    // Function to clear old reCAPTCHA
    function clearRecaptcha() {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }

    // Function to reset auth forms
    function resetAuthForms() {
        clearRecaptcha();
        if(loginForm) loginForm.reset();
        const loginPhoneSection = document.getElementById('login-phone-section');
        const loginOtpSection = document.getElementById('login-otp-section');
        const loginButton = document.getElementById('login-button');
        if (loginPhoneSection) loginPhoneSection.classList.remove('hidden');
        if (loginOtpSection) loginOtpSection.classList.add('hidden');
        if (loginButton) loginButton.textContent = 'Send OTP';

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
        const phoneNumberInput = document.getElementById('login-phone');
        const otpInput = document.getElementById('login-otp');

        // Basic Validation
        const rawPhoneNumber = phoneNumberInput.value.trim();
        if (loginButton.textContent.includes('Send')) {
            if (!rawPhoneNumber) {
                alert('Please enter your 10-digit phone number.');
                return;
            }
            if (!/^\d{10}$/.test(rawPhoneNumber)) {
                alert('Please enter a valid 10-digit phone number.');
                return;
            }
        }
         if (loginButton.textContent.includes('Verify') && !otpInput.value) {
            alert('Please enter the OTP.');
            return;
        }

        // Proceed with Firebase logic
        if (loginButton.textContent.includes('Send')) {
          clearRecaptcha();
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-login', { 'size': 'invisible' });
          const phoneNumber = "+91" + phoneNumberInput.value; // Correct variable used
          auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
            .then(confirmationResult => {
              window.confirmationResult = confirmationResult;
              document.getElementById('login-phone-section').classList.add('hidden');
              document.getElementById('login-otp-section').classList.remove('hidden');
              loginButton.textContent = 'Verify OTP';
              alert('OTP sent successfully!');
            }).catch(error => alert("Sign in failed: " + error.message));
        } else {
          const otp = otpInput.value;
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

    // --- Sign-Up Flow --- (Updated: Removed Firestore save, added existing user check)
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const signupButton = document.getElementById('signup-button');
        const nameInput = document.getElementById('signup-name');
        const addressInput = document.getElementById('signup-address');
        const phoneInput = document.getElementById('signup-phone');
        const otpInput = document.getElementById('signup-otp');

        // Basic Validation
        const rawPhoneNumberSignUp = phoneInput.value.trim();
        if (signupButton.textContent.includes('Send')) {
             if (!nameInput.value || !addressInput.value || !rawPhoneNumberSignUp) {
                alert('Please fill in all required fields (Name, Address, Phone Number).');
                return;
             }
             if (!/^\d{10}$/.test(rawPhoneNumberSignUp)) {
                alert('Please enter a valid 10-digit phone number.');
                return;
             }
        } else {
             if (!otpInput.value) {
                alert('Please enter the OTP.');
                return;
            }
        }

        // Proceed with Firebase logic
        if (signupButton.textContent.includes('Send')) {
          clearRecaptcha();
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-signup', { 'size': 'invisible' });
          const phoneNumber = "+91" + phoneInput.value; // Correct variable used
          auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
            .then(confirmationResult => {
              window.confirmationResult = confirmationResult;
              document.getElementById('signup-details-section').classList.add('hidden');
              document.getElementById('signup-otp-section').classList.remove('hidden');
              signupButton.textContent = 'Create Account';
              alert('OTP sent successfully!');
            }).catch(error => {
                alert("Sign up failed: " + error.message);
                 document.getElementById('signup-details-section').classList.remove('hidden');
                 document.getElementById('signup-otp-section').classList.add('hidden');
                 signupButton.textContent = 'Send OTP & Sign Up';
            });
        } else {
          // Phase 2: Verify OTP
          const otp = otpInput.value;
          window.confirmationResult.confirm(otp)
            .then(result => {
                // Check if it's a new user or existing user
                if (result.additionalUserInfo && !result.additionalUserInfo.isNewUser) {
                     alert("Account already exists, logging you in.");
                } else {
                     alert("Account created successfully!");
                }
                // *** REMOVED FIRESTORE SAVE LOGIC HERE ***
                // const user = result.user;
                // const name = nameInput.value;
                // const address = addressInput.value;
                // return db.collection('users').doc(user.uid).set({ ... });

                // Directly close modal and reset after successful OTP confirmation
                closeModal(authModal);
                resetAuthForms();
            })
            // .then(() => {  // Removed this .then() as Firestore save is gone
            //    // This block is no longer needed
            // })
            .catch(error => {
                alert("Account creation/verification failed: " + error.message);
                document.getElementById('signup-details-section').classList.remove('hidden');
                document.getElementById('signup-otp-section').classList.add('hidden');
                signupButton.textContent = 'Send OTP & Sign Up';
            });
        }
      });
    }

    // --- Sell Panel Form Validation & Submission ---
    if (sellForm) {
        sellForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const purchaseDate = sellForm.querySelector('input[type="date"]');
            const purchasedFrom = sellForm.querySelector('input[placeholder*="SunPower"]');
            const panelParams = sellForm.querySelector('input[placeholder*="Brand"]');
            const panelImage = sellForm.querySelector('input[type="file"][required]');

            if (!purchaseDate.value || !purchasedFrom.value || !panelParams.value || !panelImage.files.length) {
                alert('Please fill in all required fields and upload an image.');
                return;
            }
            console.log("Sell form submitted and validated (basic).");
            sellForm.classList.add('hidden');
            document.getElementById('sell-success').classList.remove('hidden');
        });
    }

    // --- Buy Request Form Validation & Submission ---
    if (buyForm) {
        buyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const wattage = buyForm.querySelector('input[placeholder*="5000 W"]');
            const budget = buyForm.querySelector('input[placeholder*="2000"]');

            if (!wattage.value || !budget.value) {
                alert('Please fill in the required wattage and budget.');
                return;
            }
            console.log("Buy form submitted and validated (basic).");
            buyForm.classList.add('hidden');
            const matchFound = Math.random() > 0.5;
            if (matchFound) {
                 document.getElementById('buy-result-found').classList.remove('hidden');
            } else {
                 document.getElementById('buy-result-not-found').classList.remove('hidden');
            }
        });
    }


  } catch (error) {
    console.error("Firebase initialization failed:", error);
    alert("Could not connect to services. Please try again later.");
  }
});