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
        document.body.classList.add('modal-open'); // Add class to body
      }
    };

    const closeModal = (modal) => {
      if (modal) {
        // Instead of changing display, remove the 'active' class
        modal.classList.remove('active');
        document.body.classList.remove('modal-open'); // Remove class from body
      }
    };

    // --- Header "Sign In / Sign Up" Button ---
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
        /*if (currentUser) {
          // User is logged in → show buy/sell modal
          openModal('buyOrSellModal');
        } else {
          // User not logged in → open login modal
          openModal('authModal');
          resetAuthForms();
        }*/
      });
    });

    // --- "Login / Sign Up" Button (Mobile) ---
    const loginSignupBtnMobile = document.getElementById('login-signup-btn-mobile');
    if (loginSignupBtnMobile) {
      loginSignupBtnMobile.addEventListener('click', () => {
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

    // --- "View Details" Buttons in Marketplace ---
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        /*
        // --- ADDED: Auth check for viewing details ---
        if (!currentUser) {
          alert("Please log in or sign up to view product details.");
          openModal('authModal');
          resetAuthForms();
          return; // Stop execution
        }
        // --- END ADDED BLOCK ---
        */
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
        if (currentUser) {
          // Gather product and user info
          const productTitle = document.getElementById('modal-product-title')?.textContent || '';
          const productId = document.getElementById('modal-product-id')?.textContent || '';
          const userId = currentUser.uid;
          const phoneNumber = currentUser.phoneNumber || '';

          // Submit to Firestore
          db.collection('interestedQueries').add({
            productId: productId,
            productTitle: productTitle,
            userId: userId,
            userPhone: phoneNumber,
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => {
            openModal('interestedQueryModal');
          }).catch(error => {
            alert('Could not register your interest. Please try again.');
            console.error('Error writing interested query:', error);
          });
        } else {
          alert("Please sign in to express your interest.");
          openModal('authModal');
          resetAuthForms();
        }
      });
    }
    /*const interestedBtn = document.getElementById('interested-btn');
    if (interestedBtn) {
      interestedBtn.addEventListener('click', () => {
        if (currentUser) {
          // Logged in → show interest modal
          closeModal(document.getElementById('productDetailModal'));
          openModal('interestedQueryModal');
        } else {
          // Not logged in → show login modal
          closeModal(document.getElementById('productDetailModal'));
          alert("Please sign in to express your interest.");
          openModal('authModal');
          resetAuthForms();
        }
      });
    }
    // Gather product details from the modal (example ids, adapt for your markup)
    const productTitle = document.getElementById('modal-product-title').textContent;
    const productId = document.getElementById('modal-product-id') ? document.getElementById('modal-product-id').textContent : '';
    const userId = currentUser.uid;
    const phoneNumber = currentUser.phoneNumber || 'N/A';

    // Save new interest query to Firestore
    db.collection('interestedQueries').add({
      productId: productId,
      productTitle: productTitle,
      userId: userId,
      userPhone: phoneNumber,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      closeModal(document.getElementById('productDetailModal'));
      openModal('interestedQueryModal');
      // Optional: Display success message or toast
    }).catch(error => {
      alert('Could not register your query. Please try again later.');
      console.error('Error writing interested query:', error);
    });
   */
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

    // --- MODIFIED: Mobile Menu Logic ---
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');

    const openMobileMenu = () => {
      if (mobileMenu) mobileMenu.classList.add('active');
      if (mobileMenuOverlay) mobileMenuOverlay.classList.add('active');
      document.body.classList.add('modal-open'); // Prevent background scrolling
    };

    const closeMobileMenu = () => {
      if (mobileMenu) mobileMenu.classList.remove('active');
      if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
      document.body.classList.remove('modal-open'); // Allow background scrolling
    };

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', openMobileMenu);
    }

    if (mobileMenuCloseBtn) {
      mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);
    }

    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }

    // ADDED: Close menu when a nav link is clicked
    const mobileNavLinks = document.querySelectorAll('#mobile-menu .nav-link-mobile');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
    // --- END OF MENU MODIFICATIONS ---

    // --- Buy/Sell Modal Buttons ---
    const buyBtn = document.getElementById('buy-btn');
    const sellBtn = document.getElementById('sell-btn');

    if (buyBtn && buyOrSellModal) {
      // --- MODIFIED: Added auth check as requested ---
      buyBtn.addEventListener('click', () => {
        if (currentUser) {
          closeModal(buyOrSellModal);
          openModal('buyRequestModal');
        } else {
          alert("Please log in or sign up to buy panels."); // Your custom alert
          closeModal(buyOrSellModal);
          openModal('authModal');
          resetAuthForms();
        }
      });
      // --- END MODIFIED BLOCK ---
    }

    if (sellBtn && buyOrSellModal) {
      // --- MODIFIED: Added auth check as requested ---
      sellBtn.addEventListener('click', () => {
        if (currentUser) {
          closeModal(buyOrSellModal);
          openModal('sellPanelModal');
        } else {
          alert("Please log in or sign up to sell panels."); // Your custom alert
          closeModal(buyOrSellModal);
          openModal('authModal');
          resetAuthForms();
        }
      });
      // --- END MODIFIED BLOCK ---
    }

    // --- Auth Modal Tabs (Sign In/Sign Up) ---
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

    const sellForm = document.getElementById('sell-form');
    if (sellForm) {
      sellForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
          alert('Please sign in before submitting!');
          openModal('authModal');
          return;
        }

        // Collect form fields (adjust IDs if different)
        const purchaseDate = sellForm.querySelector('input[type=date]').value;
        const sellerName = sellForm.querySelector('input[type=text]').value; // match to correct seller field
        const panelParams = sellForm.querySelectorAll('input[type=text]')[1].value; // second text input for params
        const sellReceiptFile = document.getElementById('sell-receipt').files[0];
        const sellImageFile = document.getElementById('sell-image').files[0];

        let receiptUrl = '';
        let imageUrl = '';
        const storageRef = firebase.storage().ref();

        // Upload panel image (required)
        if (sellImageFile) {
          const imgSnap = await storageRef.child(`sellerQueries/${currentUser.uid}/${Date.now()}-panel`).put(sellImageFile);
          imageUrl = await imgSnap.ref.getDownloadURL();
        }

        // Upload receipt if provided (optional)
        if (sellReceiptFile) {
          const receiptSnap = await storageRef.child(`sellerQueries/${currentUser.uid}/${Date.now()}-receipt`).put(sellReceiptFile);
          receiptUrl = await receiptSnap.ref.getDownloadURL();
        }

        db.collection('sellerQueries').add({
          userId: currentUser.uid,
          userPhone: currentUser.phoneNumber || '',
          purchaseDate,
          sellerName,
          panelParams,
          imageUrl,
          receiptUrl,
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          alert('Sell request submitted!');
          sellForm.reset();
          closeModal(document.getElementById('sellPanelModal'));
        }).catch(error => {
          alert('Error submitting request.');
          console.error(error);
        });
      });
    }

    const buyForm = document.getElementById('buy-form');
    if (buyForm) {
      buyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
          alert('Please sign in before submitting!');
          openModal('authModal');
          return;
        }

        // Collect values (adjust selectors as needed)
        const wattage = buyForm.querySelectorAll('input[type=number]')[0].value;
        const budget = buyForm.querySelectorAll('input[type=number]')[1].value;
        const brand = buyForm.querySelector('input[type=text]').value;

        // If you add file inputs for buyer queries:
        const buyReceiptFile = document.getElementById('buy-receipt')?.files[0];
        const buyImageFile = document.getElementById('buy-image')?.files[0];

        let receiptUrl = '';
        let imageUrl = '';
        const storageRef = firebase.storage().ref();

        if (buyImageFile) {
          const imgSnap = await storageRef.child(`buyerQueries/${currentUser.uid}/${Date.now()}-panel`).put(buyImageFile);
          imageUrl = await imgSnap.ref.getDownloadURL();
        }

        if (buyReceiptFile) {
          const receiptSnap = await storageRef.child(`buyerQueries/${currentUser.uid}/${Date.now()}-receipt`).put(buyReceiptFile);
          receiptUrl = await receiptSnap.ref.getDownloadURL();
        }

        db.collection('buyerQueries').add({
          userId: currentUser.uid,
          userPhone: currentUser.phoneNumber || '',
          wattage,
          budget,
          brand,
          imageUrl,
          receiptUrl,
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          alert('Your buy request was submitted!');
          buyForm.reset();
          closeModal(document.getElementById('buyRequestModal'));
        }).catch(error => {
          alert('Error submitting buy request.');
          console.error(error);
        });
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
        if (loginBtnDesktop) loginBtnDesktop.textContent = 'Sign In / Sign Up';
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