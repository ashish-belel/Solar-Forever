// document.addEventListener('DOMContentLoaded', function () {
//   let userAction = null;
//   let isLoggedIn = false;
//   let userPhone = null;

//   // Restore login state from localStorage
//   if (localStorage.getItem('isLoggedIn') === 'true') {
//     isLoggedIn = true;
//     userPhone = localStorage.getItem('userPhone') || null;
//   }

//   const header = document.getElementById('header');
//   const mobileMenuButton = document.getElementById('mobile-menu-button');
//   const mobileMenu = document.getElementById('mobile-menu');
//   const navLinksMobile = document.querySelectorAll('.nav-link-mobile');

//   const modals = document.querySelectorAll('.modal-backdrop');
//   const buyOrSellModal = document.getElementById('buyOrSellModal');
//   const authModal = document.getElementById('authModal');
//   const sellPanelModal = document.getElementById('sellPanelModal');
//   const buyRequestModal = document.getElementById('buyRequestModal');

//   // === NEW: Reference to the new modal ===
//   const productDetailModal = document.getElementById('productDetailModal');

//   const getStartedBtns = document.querySelectorAll('.get-started-btn');
//   const loginSignupBtn = document.getElementById('login-signup-btn-desktop');
//   const buyBtn = document.getElementById('buy-btn');
//   const sellBtn = document.getElementById('sell-btn');
//   const loginTabBtn = document.getElementById('login-tab-btn');
//   const signupTabBtn = document.getElementById('signup-tab-btn');

//   const loginForm = document.getElementById('login-form');
//   const signupForm = document.getElementById('signup-form');
//   const sellForm = document.getElementById('sell-form');
//   const sellSuccessDiv = document.getElementById('sell-success');
//   const buyForm = document.getElementById('buy-form');
//   const buyResultFound = document.getElementById('buy-result-found');
//   const buyResultNotFound = document.getElementById('buy-result-not-found');

//   const showModal = (modal) => modal.classList.add('active');
//   const hideModal = (modal) => modal.classList.remove('active');

//   window.addEventListener('scroll', () => {
//     header.classList.toggle('bg-blue-900', window.scrollY > 50);
//     header.classList.toggle('shadow-lg', window.scrollY > 50);
//   });

//   mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
//   navLinksMobile.forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));

//   getStartedBtns.forEach(btn => {
//     btn.addEventListener('click', () => {
//       mobileMenu.classList.add('hidden');
//       showModal(buyOrSellModal);
//     });
//   });

//   loginSignupBtn.addEventListener('click', () => {
//     showModal(authModal);
//     loginTabBtn.click();
//   });

//   const proceedToForm = () => {
//     if (userAction === 'buy') {
//       showModal(buyRequestModal);
//     } else if (userAction === 'sell') {
//       showModal(sellPanelModal);
//     }
//   };

//   buyBtn.addEventListener('click', () => {
//     userAction = 'buy';
//     hideModal(buyOrSellModal);
//     if (isLoggedIn) {
//       proceedToForm();
//     } else {
//       showModal(authModal);
//       loginTabBtn.click();
//     }
//   });
//   sellBtn.addEventListener('click', () => {
//     userAction = 'sell';
//     hideModal(buyOrSellModal);
//     if (isLoggedIn) {
//       proceedToForm();
//     } else {
//       showModal(authModal);
//       loginTabBtn.click();
//     }
//   });

//   loginTabBtn.addEventListener('click', () => {
//     loginTabBtn.classList.add('active');
//     signupTabBtn.classList.remove('active');
//     loginForm.classList.remove('hidden');
//     signupForm.classList.add('hidden');
//   });

//   signupTabBtn.addEventListener('click', () => {
//     signupTabBtn.classList.add('active');
//     loginTabBtn.classList.remove('active');
//     signupForm.classList.remove('hidden');
//     loginForm.classList.add('hidden');
//   });


//   const handleAuthSuccess = (phone) => {
//     isLoggedIn = true;
//     userPhone = phone;
//     localStorage.setItem('isLoggedIn', 'true');
//     localStorage.setItem('userPhone', phone);
//     hideModal(authModal);
//     proceedToForm();
//   };

//   loginForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const phone = document.getElementById('login-phone').value;
//     handleAuthSuccess(phone);
//   });
//   signupForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const phone = document.getElementById('signup-phone').value;
//     handleAuthSuccess(phone);
//   });

//   sellForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     sellForm.classList.add('hidden');
//     sellSuccessDiv.classList.remove('hidden');
//   });

//   buyForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     buyForm.classList.add('hidden');
//     if (Math.random() > 0.5) {
//       buyResultFound.classList.remove('hidden');
//     } else {
//       buyResultNotFound.classList.remove('hidden');
//     }
//   });

//   // === UPDATED: LOGIC FOR PRODUCT DETAIL MODAL (Single Section) ===
//   const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
//   viewDetailsBtns.forEach(btn => {
//     btn.addEventListener('click', (e) => {
//       e.preventDefault();
//       const card = btn.closest('.group');
//       const imgSrc = card.querySelector('img').src;
//       const title = card.querySelector('h3').textContent;
//       const condition = card.querySelector('.text-gray-600.text-sm').textContent;
//       const price = card.querySelector('.text-blue-700.font-bold').textContent;
//       const status = card.querySelector('span.text-xs').textContent;

//       document.getElementById('modal-product-img').src = imgSrc;
//       document.getElementById('modal-product-title').textContent = title;
//       document.getElementById('modal-product-condition').textContent = condition;
//       document.getElementById('modal-product-price').textContent = price;
//       document.getElementById('modal-product-status').textContent = status;

//       const wattage = title.match(/\d+W/);
//       const age = condition.match(/\d+ years? old/);
//       document.getElementById('modal-product-wattage').textContent = wattage ? wattage[0] : 'N/A';
//       document.getElementById('modal-product-age').textContent = age ? age[0] : 'N/A';

//       // Hide query message if previously shown
//       const queryMsg = document.getElementById('interested-query-message');
//       if (queryMsg) queryMsg.classList.add('hidden');

//       showModal(productDetailModal);
//     });
//   });

//   // Show query modal on "I am Interested" button click, hide product details modal
//   document.addEventListener('click', function (e) {
//     if (e.target && e.target.id === 'interested-btn') {
//       const queryModal = document.getElementById('interestedQueryModal');
//       const productDetailModal = document.getElementById('productDetailModal');
//       if (productDetailModal) productDetailModal.classList.remove('active');
//       if (queryModal) queryModal.classList.add('active');
//     }
//   });
//   // === END OF UPDATED LOGIC ===


//   modals.forEach(modal => {
//     modal.addEventListener('click', (e) => {
//       if (e.target === modal || e.target.classList.contains('close-modal-btn')) {
//         hideModal(modal);
//         // Reset forms on close
//         setTimeout(() => {
//           sellForm.classList.remove('hidden');
//           sellSuccessDiv.classList.add('hidden');
//           buyForm.classList.remove('hidden');
//           buyResultFound.classList.add('hidden');
//           buyResultNotFound.classList.add('hidden');
//         }, 300);
//       }
//     });
//   });

//   document.getElementById('year').textContent = new Date().getFullYear();
// });


document.addEventListener('DOMContentLoaded', function () {
    // --- Firebase Configuration ---
    // PASTE YOUR FIREBASE CONFIG OBJECT HERE
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
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- Global State ---
    let currentUser = null;
    let userAction = null; // Tracks if the user wants to 'buy' or 'sell'

    // --- UI Element References ---
    const header = document.getElementById('header');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinksMobile = document.querySelectorAll('.nav-link-mobile');
    const modals = document.querySelectorAll('.modal-backdrop');
    const buyOrSellModal = document.getElementById('buyOrSellModal');
    const authModal = document.getElementById('authModal');
    const sellPanelModal = document.getElementById('sellPanelModal');
    const buyRequestModal = document.getElementById('buyRequestModal');
    const productDetailModal = document.getElementById('productDetailModal');
    const interestedQueryModal = document.getElementById('interestedQueryModal');
    const getStartedBtns = document.querySelectorAll('.get-started-btn');
    const loginSignupBtn = document.getElementById('login-signup-btn-desktop');
    const buyBtn = document.getElementById('buy-btn');
    const sellBtn = document.getElementById('sell-btn');
    const loginTabBtn = document.getElementById('login-tab-btn');
    const signupTabBtn = document.getElementById('signup-tab-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const sellForm = document.getElementById('sell-form');
    const sellSuccessDiv = document.getElementById('sell-success');
    const buyForm = document.getElementById('buy-form');
    const buyResultFound = document.getElementById('buy-result-found');
    const buyResultNotFound = document.getElementById('buy-result-not-found');

    // --- Helper Functions ---
    const showModal = (modal) => modal.classList.add('active');
    const hideModal = (modal) => modal.classList.remove('active');

    // --- CORE AUTHENTICATION LOGIC ---

    // 1. Listen for auth state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loginSignupBtn.textContent = 'Logout';
            console.log("User logged in:", user.phoneNumber);
        } else {
            currentUser = null;
            loginSignupBtn.textContent = 'Login / Sign Up';
            console.log("User logged out.");
        }
    });
    
    // 2. Main Login/Logout Button Handler
    loginSignupBtn.addEventListener('click', () => {
        if (currentUser) {
            auth.signOut();
        } else {
            showModal(authModal);
            loginTabBtn.click(); // Default to login tab
        }
    });

    // 3. Setup reCAPTCHA Verifier
    // This is essential for phone auth to prevent abuse
    // Find and REPLACE your old setupRecaptcha function with this new one
// Find and REPLACE your old setupRecaptcha function with this new one

function setupRecaptcha(containerId) {
    // If an old verifier exists, clear it from the UI first
    if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
    }
    
    // Create a new reCAPTCHA verifier
    try {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(containerId, {
            'size': 'invisible',
            'callback': (response) => { 
                console.log("reCAPTCHA solved, ready to send OTP."); 
            }
        });
    } catch (error) {
        console.error("reCAPTCHA setup error:", error);
    }
}
    
    // 4. Sign-Up Flow
    signupTabBtn.addEventListener('click', () => {
        // We must render the reCAPTCHA verifier into a visible element
        if (!document.getElementById('recaptcha-container-signup')) {
            const recaptchaContainer = document.createElement('div');
            recaptchaContainer.id = 'recaptcha-container-signup';
            signupForm.appendChild(recaptchaContainer);
        }
        setupRecaptcha('recaptcha-container-signup');
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phoneNumber = document.getElementById('signup-phone').value;
        const appVerifier = window.recaptchaVerifier;

        auth.signInWithPhoneNumber(phoneNumber, appVerifier)
            .then((confirmationResult) => {
                const otp = prompt('Please enter the OTP sent to your phone.');
                if (otp) {
                    return confirmationResult.confirm(otp);
                } else {
                    return Promise.reject("OTP entry cancelled.");
                }
            })
            .then((result) => {
                const user = result.user;
                const name = document.getElementById('signup-name').value;
                const address = document.getElementById('signup-address').value;

                // Save user profile to Firestore
                return db.collection('users').doc(user.uid).set({
                    name: name,
                    address: address,
                    phoneNumber: user.phoneNumber,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                alert("Account created successfully!");
                handleAuthSuccess();
            })
            .catch((error) => {
                console.error("Sign up failed:", error);
                alert("Sign up failed: " + error.message);
            });
    });

    // 5. Sign-In Flow
    loginTabBtn.addEventListener('click', () => {
        if (!document.getElementById('recaptcha-container-login')) {
            const recaptchaContainer = document.createElement('div');
            recaptchaContainer.id = 'recaptcha-container-login';
            loginForm.appendChild(recaptchaContainer);
        }
        setupRecaptcha('recaptcha-container-login');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phoneNumber = document.getElementById('login-phone').value;
        const appVerifier = window.recaptchaVerifier;

        auth.signInWithPhoneNumber(phoneNumber, appVerifier)
            .then((confirmationResult) => {
                const otp = prompt('Please enter the OTP sent to your phone.');
                if (otp) {
                    return confirmationResult.confirm(otp);
                } else {
                    return Promise.reject("OTP entry cancelled.");
                }
            })
            .then((result) => {
                alert("Successfully signed in!");
                handleAuthSuccess();
            })
            .catch((error) => {
                console.error("Sign in failed:", error);
                alert("Sign in failed: " + error.message);
            });
    });

    function handleAuthSuccess() {
        hideModal(authModal);
        if (userAction) {
            proceedToForm();
        }
    }
    
    // --- FIRESTORE QUERY SUBMISSIONS ---

    // 1. Sell Form Submission
    sellForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Please log in to submit a query.");
            return;
        }

        const sellData = {
            purchaseDate: sellForm.querySelector('input[type="date"]').value,
            purchasedFrom: sellForm.querySelector('input[placeholder*="SunPower"]').value,
            panelParams: sellForm.querySelector('input[placeholder*="Brand"]').value,
            sellerId: currentUser.uid,
            sellerPhone: currentUser.phoneNumber,
            status: 'pending_review',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection('sellQueries').add(sellData)
            .then(() => {
                sellForm.classList.add('hidden');
                sellSuccessDiv.classList.remove('hidden');
            })
            .catch(error => {
                alert("Error submitting form: " + error.message);
            });
    });

    // 2. Buy Form Submission
    buyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Please log in to submit a query.");
            return;
        }

        const buyData = {
            requiredWattage: buyForm.querySelector('input[type="number"][placeholder*="5000 W"]').value,
            budget: buyForm.querySelector('input[type="number"][placeholder*="2000"]').value,
            preferences: buyForm.querySelector('input[type="text"][placeholder*="Canadian Solar"]').value,
            buyerId: currentUser.uid,
            buyerPhone: currentUser.phoneNumber,
            status: 'searching',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection('buyQueries').add(buyData)
            .then(() => {
                buyForm.classList.add('hidden');
                buyResultNotFound.classList.remove('hidden');
            })
            .catch(error => {
                alert("Error submitting form: " + error.message);
            });
    });

    // 3. "Interested" button on product details
    document.getElementById('interested-btn').addEventListener('click', () => {
        if (!currentUser) {
            alert("Please log in to show your interest.");
            showModal(authModal);
            return;
        }

        const productTitle = document.getElementById('modal-product-title').textContent;
        const productPrice = document.getElementById('modal-product-price').textContent;

        const interestData = {
            userId: currentUser.uid,
            userPhone: currentUser.phoneNumber,
            productTitle: productTitle,
            productPrice: productPrice,
            status: 'new_interest',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection('interestQueries').add(interestData)
            .then(() => {
                hideModal(productDetailModal);
                showModal(interestedQueryModal);
            })
            .catch(error => {
                alert("Could not register interest: " + error.message);
            });
    });


    // --- GENERAL UI LOGIC (Kept from original file) ---

    window.addEventListener('scroll', () => {
        header.classList.toggle('bg-blue-900', window.scrollY > 50);
        header.classList.toggle('shadow-lg', window.scrollY > 50);
    });

    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    navLinksMobile.forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));

    getStartedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            showModal(buyOrSellModal);
        });
    });

    const proceedToForm = () => {
        if (userAction === 'buy') {
            showModal(buyRequestModal);
        } else if (userAction === 'sell') {
            showModal(sellPanelModal);
        }
        userAction = null; // Reset action
    };

    buyBtn.addEventListener('click', () => {
        userAction = 'buy';
        hideModal(buyOrSellModal);
        if (currentUser) {
            proceedToForm();
        } else {
            showModal(authModal);
            loginTabBtn.click();
        }
    });

    sellBtn.addEventListener('click', () => {
        userAction = 'sell';
        hideModal(buyOrSellModal);
        if (currentUser) {
            proceedToForm();
        } else {
            showModal(authModal);
            loginTabBtn.click();
        }
    });

    signupTabBtn.addEventListener('click', () => {
        signupTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
    
    loginTabBtn.addEventListener('click', () => {
        loginTabBtn.classList.add('active');
        signupTabBtn.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.group');
            const imgSrc = card.querySelector('img').src;
            const title = card.querySelector('h3').textContent;
            const condition = card.querySelector('.text-gray-600.text-sm').textContent;
            const price = card.querySelector('.text-blue-700.font-bold').textContent;
            const status = card.querySelector('span.text-xs').textContent;

            document.getElementById('modal-product-img').src = imgSrc;
            document.getElementById('modal-product-title').textContent = title;
            document.getElementById('modal-product-condition').textContent = condition;
            document.getElementById('modal-product-price').textContent = price;
            document.getElementById('modal-product-status').textContent = status;
            const wattage = title.match(/\d+W/);
            const age = condition.match(/\d+ years? old/);
            document.getElementById('modal-product-wattage').textContent = wattage ? wattage[0] : 'N/A';
            document.getElementById('modal-product-age').textContent = age ? age[0] : 'N/A';

            showModal(productDetailModal);
});
    });
    
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal-btn')) {
                hideModal(modal);
                setTimeout(() => {
                    sellForm.classList.remove('hidden');
                    sellSuccessDiv.classList.add('hidden');
                    buyForm.classList.remove('hidden');
                    buyResultFound.classList.add('hidden');
                    buyResultNotFound.classList.add('hidden');
                }, 300);
            }
        });
    });

    document.getElementById('year').textContent = new Date().getFullYear();
});

async function getNewestSellQueries(numberOfQueries) {
  try {
    console.log("Fetching the", numberOfQueries, "newest sell queries...");

    // 1. Reference the 'sellQueries' collection in your database
    const queryCollection = db.collection("sellQueries");

    // 2. Create the query
    const query = queryCollection
      .orderBy("submittedAt", "desc") // Order by the timestamp, newest first
      .limit(numberOfQueries);        // Get only the number of queries you want

    // 3. Execute the query
    const querySnapshot = await query.get();

    // 4. Process and display the results
    if (querySnapshot.empty) {
      console.log("No sell queries found.");
      return;
    }

    console.log("Here are the newest queries:");
    querySnapshot.forEach((doc) => {
      // doc.id is the unique ID of the query
      // doc.data() is the object with all the form data (panelParams, sellerPhone, etc.)
      console.log(`ID: ${doc.id}`, doc.data());
    });

  } catch (error) {
    console.error("Error getting new queries: ", error);
  }
}

// --- HOW TO USE IT ---
// You can call this function anytime you want to see the latest data.
// For example, to get the 5 newest queries:
getNewestSellQueries(5);

// To get the 10 newest queries:
// getNewestSellQueries(10);