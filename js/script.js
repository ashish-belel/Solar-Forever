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
    const storage = firebase.storage(); // Make sure storage is initialized

    // --- Global State & UI References ---
    let currentUser = null;
    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const buyOrSellModal = document.getElementById('buyOrSellModal');


    // =================================================================
    // PART 1: MODAL AND UI LOGIC
    // =================================================================

    // --- Modal Helper Functions ---
    const openModal = (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
      }
    };

    const closeModal = (modal) => {
      if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    };

    // --- Header "Sign In / Sign Up" Button ---
    const loginSignupBtn = document.getElementById('login-signup-btn-desktop');
    if (loginSignupBtn) {
      loginSignupBtn.addEventListener('click', () => {
        if (currentUser) {
          auth.signOut();
        } else {
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

    // --- "Login / Sign Up" Button (Mobile) ---
    const loginSignupBtnMobile = document.getElementById('login-signup-btn-mobile');
    if (loginSignupBtnMobile) {
      loginSignupBtnMobile.addEventListener('click', () => {
        if (currentUser) {
          auth.signOut();
        } else {
          openModal('authModal');
          resetAuthForms();
        }
      });
    }

    // --- (REPLACED) "View Details" Buttons in Marketplace ---
    // Uses Event Delegation to work on dynamic content
    const marketplaceGrid = document.getElementById('marketplace-grid');
    if (marketplaceGrid) {
      // Map to store data for each card
      const panelDataMap = new Map();

      // Listen for clicks on the whole grid
      marketplaceGrid.addEventListener('click', (e) => {
        const button = e.target.closest('.view-details-btn');
        if (button) {
          const docId = button.dataset.docId;
          const data = panelDataMap.get(docId);

          if (data) {
            // Populate and open the modal
            openModal('productDetailModal');
            document.getElementById('modal-product-img').src = data.panelImageURL || '';
            document.getElementById('modal-product-title').textContent = data.panelParams || 'N/A';
            document.getElementById('modal-product-price').textContent = 'Price on request'; // You can add price to sellQueries later

            // This hidden span now stores the all-important docId
            document.getElementById('modal-product-id').textContent = docId;

            // --- Age Logic ---
            let ageText = 'N/A';
            if (data.purchaseDate) {
              try {
                const purchaseYear = new Date(data.purchaseDate).getFullYear();
                const currentYear = new Date().getFullYear();
                const age = currentYear - purchaseYear;
                if (age === 0) ageText = "(< 1 year old)";
                else if (age === 1) ageText = "(1 year old)";
                else ageText = `(${age} years old)`;
              } catch (e) { /* ignore */ }
            }
            document.getElementById('modal-product-condition').textContent = `Condition: Excellent ${ageText}`;

            try {
              document.getElementById('modal-product-wattage').textContent = data.panelParams.split('W')[0] + 'W';
              document.getElementById('modal-product-age').textContent = ageText.match(/\(([^)]+)\)/)[1];
            } catch (err) { /* ignore if parsing fails */ }
            document.getElementById('modal-product-status').textContent = "Expert Verified";
          }
        }
      });

      // --- NEW: Helper function to create a card ---
      const createMarketplaceCard = (docId, data) => {
        const card = document.createElement('div');
        card.className = "group bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col";

        let ageText = '';
        if (data.purchaseDate) {
          try {
            const purchaseYear = new Date(data.purchaseDate).getFullYear();
            const currentYear = new Date().getFullYear();
            const age = currentYear - purchaseYear;
            if (age === 0) ageText = "(< 1 year old)";
            else if (age === 1) ageText = "(1 year old)";
            else ageText = `(${age} years old)`;
          } catch (e) { /* ignore */ }
        }

        card.innerHTML = `
          <div class="relative overflow-hidden h-56">
            <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                 src="${data.panelImageURL || 'https://via.placeholder.com/400x300.png?text=No+Image'}" alt="Solar Panel">
            <div class="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Expert Verified
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <h3 class="text-xl font-bold text-gray-800 mb-2">${data.panelParams || 'N/A'}</h3>
            <p class="text-gray-600 text-sm mb-4">
              Condition: Excellent ${ageText}
            </p>
            <p class="text-blue-700 font-extrabold text-2xl mb-4">
              Price on request
            </p>
            <div class="mt-auto">
              <button 
                class="view-details-btn w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-blue-700"
                data-doc-id="${docId}">
                View Details
              </button>
            </div>
          </div>
        `;
        return card;
      };

      // --- NEW: Function to load the marketplace (UPDATED to show 8 by default) ---
      const loadMarketplace = async () => {
        let itemCounter = 0; // Counter
        let toggleBtn = null; // Button reference

        try {
          const snapshot = await db.collection('sellQueries')
            .where('status', '==', 'approved')
            .orderBy('submittedAt', 'desc')
            .get();

          marketplaceGrid.innerHTML = ''; // Clear static cards

          if (snapshot.empty) {
            marketplaceGrid.innerHTML = '<p class="text-gray-600 col-span-full">No panels available right now. Check back soon!</p>';
            return;
          }

          snapshot.forEach(doc => {
            itemCounter++; // Increment counter
            const data = doc.data();
            panelDataMap.set(doc.id, data);
            const card = createMarketplaceCard(doc.id, data);

            // Logic to hide extra items
            if (itemCounter > 8) { // <-- CHANGED FROM 6
              card.classList.add('hidden', 'user-marketplace-extra');
            }

            marketplaceGrid.appendChild(card);
          });

          // Add the "Show More" button if needed
          if (itemCounter > 8) { // <-- CHANGED FROM 6
            toggleBtn = document.createElement('button');
            toggleBtn.textContent = `Show More (${itemCounter - 8})`; // <-- CHANGED FROM 6

            toggleBtn.className = 'w-full bg-blue-100 text-blue-800 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-blue-200 mt-8 col-span-full';
            toggleBtn.dataset.state = 'more';

            marketplaceGrid.appendChild(toggleBtn);

            // Add click listener
            toggleBtn.addEventListener('click', () => {
              const extraItems = marketplaceGrid.querySelectorAll('.user-marketplace-extra');

              if (toggleBtn.dataset.state === 'more') {
                extraItems.forEach(item => item.classList.remove('hidden'));
                toggleBtn.textContent = 'Show Less';
                toggleBtn.dataset.state = 'less';
              } else {
                extraItems.forEach(item => item.classList.add('hidden'));
                toggleBtn.textContent = `Show More (${itemCounter - 8})`; // <-- CHANGED FROM 6
                toggleBtn.dataset.state = 'more';
              }
            });
          }

        } catch (error) {
          console.error("Error loading marketplace:", error);
          marketplaceGrid.innerHTML = '<p class="text-red-600 col-span-full">Could not load marketplace. Please try again later.</p>';
        }
      };

      // Load it!
      loadMarketplace();

    } // End if(marketplaceGrid)

    // --- (REPLACED) "Interested?" Button (inside Product Detail Modal) ---
    const interestedBtn = document.getElementById('interested-btn');
    if (interestedBtn) {
      // MODIFIED: Added 'async'
      interestedBtn.addEventListener('click', async () => {
        closeModal(document.getElementById('productDetailModal'));
        if (currentUser) {
          try {
            // --- NEW: Fetch user's address (location) ---
            const userDocRef = db.collection('users').doc(currentUser.uid);
            const userDoc = await userDocRef.get();
            let userLocation = 'N/A';
            if (userDoc.exists) {
              userLocation = userDoc.data().address || 'N/A';
            }
            // --- End fetch ---

            // Gather product and user info
            const productTitle = document.getElementById('modal-product-title')?.textContent || '';
            // FIXED: Get the productId from the hidden span
            const productId = document.getElementById('modal-product-id')?.textContent || '';
            const userId = currentUser.uid;
            const phoneNumber = currentUser.phoneNumber || 'N/A';

            if (!productId) {
              alert('Could not identify the product. Please try again.');
              return;
            }

            // Submit to Firestore
            await db.collection('interestedQueries').add({
              productId: productId,
              productTitle: productTitle,
              userId: userId,
              userPhone: phoneNumber,
              userLocation: userLocation, // <-- ADDED FIELD
              submittedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            openModal('interestedQueryModal');

          } catch (error) {
            alert('Could not register your interest. Please try again.');
            console.error('Error writing interested query:', error);
          }
        } else {
          alert("Please sign in to express your interest.");
          openModal('authModal');
          resetAuthForms();
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

    // --- MODIFIED: Mobile Menu Logic ---
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');

    const openMobileMenu = () => {
      if (mobileMenu) mobileMenu.classList.add('active');
      if (mobileMenuOverlay) mobileMenuOverlay.classList.add('active');
      document.body.classList.add('modal-open');
    };

    const closeMobileMenu = () => {
      if (mobileMenu) mobileMenu.classList.remove('active');
      if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
      document.body.classList.remove('modal-open');
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
    const mobileNavLinks = document.querySelectorAll('#mobile-menu .nav-link-mobile');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // --- Buy/Sell Modal Buttons ---
    const buyBtn = document.getElementById('buy-btn');
    const sellBtn = document.getElementById('sell-btn');

    if (buyBtn && buyOrSellModal) {
      buyBtn.addEventListener('click', () => {
        if (currentUser) {
          closeModal(buyOrSellModal);
          openModal('buyRequestModal');
        } else {
          alert("Please log in or sign up to buy panels.");
          closeModal(buyOrSellModal);
          openModal('authModal');
          resetAuthForms();
        }
      });
    }

    if (sellBtn && buyOrSellModal) {
      sellBtn.addEventListener('click', () => {
        if (currentUser) {
          closeModal(buyOrSellModal);
          openModal('sellPanelModal');
        } else {
          alert("Please log in or sign up to sell panels.");
          closeModal(buyOrSellModal);
          openModal('authModal');
          resetAuthForms();
        }
      });
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

    // --- Sell Panel Form Submission ---
    const sellForm = document.getElementById('sell-form');
    if (sellForm) {
      sellForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
          alert('Please sign in before submitting!');
          openModal(authModal);
          return;
        }

        const purchaseDate = sellForm.querySelector('input[type="date"]').value;
        const purchasedFrom = sellForm.querySelector('input[name="purchased-from"]').value;
        const panelParams = sellForm.querySelector('input[name="panel-params"]').value;
        const sellReceiptFile = document.getElementById('sell-receipt').files[0];
        const sellImageFile = document.getElementById('sell-image').files[0];

        let receiptImageURL = '';
        let panelImageURL = '';
        const storageRef = storage.ref(); // Use initialized storage

        try {
          if (sellImageFile) {
            const imgSnap = await storageRef.child(`sellQueries/${currentUser.uid}/${Date.now()}-panel`).put(sellImageFile);
            panelImageURL = await imgSnap.ref.getDownloadURL();
          }

          if (sellReceiptFile) {
            const receiptSnap = await storageRef.child(`sellQueries/${currentUser.uid}/${Date.now()}-receipt`).put(sellReceiptFile);
            receiptImageURL = await receiptSnap.ref.getDownloadURL();
          }

          await db.collection('sellQueries').add({
            sellerID: currentUser.uid,
            sellerPhone: currentUser.phoneNumber || 'N/A',
            purchaseDate: purchaseDate,
            purchasedFrom: purchasedFrom,
            panelParams: panelParams,
            panelImageURL: panelImageURL,
            receiptImageURL: receiptImageURL,
            status: 'pending',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
          });

          alert('Sell request submitted successfully!');
          sellForm.reset();
          closeModal(document.getElementById('sellPanelModal'));
        } catch (error) {
          alert('Error submitting request.');
          console.error(error);
        }
      });
    }

    // --- Buy Request Form Submission ---
    const buyForm = document.getElementById('buy-form');
    if (buyForm) {
      buyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
          alert('Please sign in before submitting!');
          openModal(authModal);
          return;
        }

        const requiredWattage = buyForm.querySelector('input[name="wattage"]').value;
        const budget = buyForm.querySelector('input[name="budget"]').value;
        const preference = buyForm.querySelector('input[name="preference"]').value;

        try {
          await db.collection('buyQueries').add({
            buyerID: currentUser.uid,
            buyerPhone: currentUser.phoneNumber || 'N/A',
            requiredWattage: parseInt(requiredWattage),
            budget: parseFloat(budget),
            preference: preference,
            status: 'searching',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
          });

          alert('Buy request submitted! We will notify you when matches are found.');
          buyForm.reset();
          closeModal(document.getElementById('buyRequestModal'));
        } catch (error) {
          console.error('Error processing buy request:', error);
          alert('Error occurred while processing your request.');
        }
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

    function clearRecaptcha() {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }

    function resetAuthForms() {
      clearRecaptcha();
      if (loginForm) loginForm.reset();
      const loginPhoneSection = document.getElementById('login-phone-section');
      const loginOtpSection = document.getElementById('login-otp-section');
      const loginButton = document.getElementById('login-button');
      if (loginPhoneSection) loginPhoneSection.classList.remove('hidden');
      if (loginOtpSection) loginOtpSection.classList.add('hidden');
      if (loginButton) loginButton.textContent = 'Send OTP';

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
          const otp = document.getElementById('login-otp').value;
          if (!otp) { alert("Please enter the OTP."); return; }
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
          clearRecaptcha();
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-signup', { size: 'invisible' });
          const phoneNumber = document.getElementById('signup-phone').value;
          auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
            .then((confirmationResult) => {
              window.confirmationResult = confirmationResult;
              document.getElementById('signup-details-section').classList.add('hidden');
              document.getElementById('signup-otp-section').classList.remove('hidden');
              signupButton.textContent = 'Create Account';
              alert('OTP sent successfully!');
            })
            .catch((error) => {
              alert('Sign up failed: ' + error.message);
            });
        } else {
          const otp = document.getElementById('signup-otp').value;
          if (!otp) { alert('Please enter the OTP.'); return; }
          window.confirmationResult.confirm(otp)
            .then((result) => {
              const user = result.user;
              const name = document.getElementById('signup-name').value;
              const address = document.getElementById('signup-address').value;
              return db.collection('users').doc(user.uid).set({
                name: name,
                address: address, // This is the 'userLocation'
                phone: user.phoneNumber,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
              });
            })
            .then(() => {
              alert('Account created successfully!');
              closeModal(authModal);
              resetAuthForms();
            })
            .catch((error) => {
              alert('Account creation failed: ' + error.message);
            });
        }
      });
    }

  } catch (error) {
    console.error("Firebase initialization failed:", error);
    alert("Could not connect to services. Please try again later.");
  }
});