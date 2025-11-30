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
    const sellForm = document.getElementById('sell-panel-form'); 
    const buyForm = document.getElementById('buy-form');
    
    // =================================================================
    // PART 1: MODAL AND UI LOGIC
    // =================================================================

    // --- Modal Helper Functions ---
// --- Modal Helper Functions (UPDATED to prevent background scroll) ---

// --- (NEW) Helper for setting up image previews ---
    function setupImagePreview(inputId, previewId) {
      const input = document.getElementById(inputId);
      const preview = document.getElementById(previewId);
      if (input && preview) {
        input.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            preview.src = URL.createObjectURL(file);
            preview.classList.remove('hidden');
          } else {
            preview.classList.add('hidden');
          }
        });
      }
    }

    // --- (NEW) Activate Image Previews ---
    setupImagePreview('sell-panel-image', 'sell-image-preview');
    setupImagePreview('sell-receipt-image', 'sell-receipt-preview');


    // --- (NEW) Image Compression Function ---
    // Returns a Promise that resolves with a compressed Blob
    function compressImage(file, quality = 0.5, maxWidth = 1024) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Get the compressed blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas toBlob failed.'));
              }
            },
            'image/jpeg', // Force JPEG for compression
            quality       // The compression quality (0.0 - 1.0)
          );
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      });
    }
    // --- (NEW) Helper to Upload a BLOB ---
    // This is the second half of the old uploadCompressedImage function
    function uploadBlob(blob, path, progressElement, fileLabel) {
      // Return a promise that resolves to null if the blob is missing
      if (!blob) {
        return Promise.resolve(null);
      }

      return new Promise((resolve, reject) => {
        const storage = firebase.storage();
        const storageRef = storage.ref(path);
        const uploadTask = storageRef.put(blob);

        uploadTask.on('state_changed',
          (snapshot) => {
            // Update progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progressElement) {
              progressElement.textContent = `Uploading ${fileLabel}: ${Math.round(progress)}%`;
            }
          },
          (error) => {
            console.error(`Upload failed for ${fileLabel}:`, error);
            reject(error);
          },
          () => {
            // Upload Complete - Get Download URL
            uploadTask.snapshot.ref.getDownloadURL()
              .then(downloadURL => {
                console.log(`${fileLabel} available at`, downloadURL);
                resolve(downloadURL); // This is the final URL
              })
              .catch(reject);
          }
        );
      });
    }
    // --- (NEW) Helper to build query lists ---
    function buildQueryList(queries, collectionName) {
      if (queries.empty) {
        return '<p class="text-center text-gray-500">No submissions found.</p>';
      }
      
      let html = '<ul class="divide-y divide-gray-200">';
      queries.forEach(doc => {
        const item = doc.data();
        const docId = doc.id;
        
        let title, details, statusClass, statusText;

        if (collectionName === 'sellQueries') {
          title = item.panelParams;
          details = `Price: ₹${item.price || 'N/A'}`;
        } else {
          title = `Request for ${item.requiredWattage}W`;
          details = `Budget: ₹${item.budget}`;
        }

        switch(item.status) {
          case 'pending_review': statusClass = 'bg-yellow-100 text-yellow-800'; statusText = 'Pending Review'; break;
          case 'approved': statusClass = 'bg-green-100 text-green-800'; statusText = 'Approved'; break;
          case 'rejected': statusClass = 'bg-red-100 text-red-800'; statusText = 'Rejected'; break;
          case 'sold': statusClass = 'bg-blue-100 text-blue-800'; statusText = 'Sold'; break;
          case 'completed': statusClass = 'bg-blue-100 text-blue-800'; statusText = 'Completed'; break;
          default: statusClass = 'bg-gray-100 text-gray-800'; statusText = 'Unknown';
        }

        html += `
          <li class="p-4 flex justify-between items-center">
            <div>
              <p class="font-semibold">${title}</p>
              <p class="text-sm text-gray-600">${details}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClass}">${statusText}</span>
              ${(collectionName === 'buyQueries' && item.status === 'pending_review') ? 
                `<button class="edit-query-btn text-sm text-blue-600 hover:underline" data-doc-id="${docId}" data-collection="buyQueries">Edit</button>` : ''}
            </div>
          </li>
        `;
      });
      html += '</ul>';
      return html;
    }
    async function loadMyQueries() {
      if (!currentUser) return;

      const sellContent = document.getElementById('my-sell-content');
      const buyContent = document.getElementById('my-buy-content');
      sellContent.innerHTML = '<p class="text-center">Loading...</p>';
      buyContent.innerHTML = '<p class="text-center">Loading...</p>';

      try {
        // Run queries in parallel
        const [sellSnapshot, buySnapshot] = await Promise.all([
          db.collection('sellQueries').where('sellerId', '==', currentUser.uid).orderBy('submittedAt', 'desc').get(),
          db.collection('buyQueries').where('buyerId', '==', currentUser.uid).orderBy('submittedAt', 'desc').get()
        ]);

        // Build and inject HTML
        sellContent.innerHTML = buildQueryList(sellSnapshot, 'sellQueries');
        buyContent.innerHTML = buildQueryList(buySnapshot, 'buyQueries');

      } catch (error) {
        console.error("Error loading user queries:", error);
        sellContent.innerHTML = '<p class="text-center text-red-500">Error loading queries.</p>';
        buyContent.innerHTML = '<p class="text-center text-red-500">Error loading queries.</p>';
      }
    }

    // --- (NEW) Helper to Compress and Upload a File ---
    // Returns a Promise that resolves with the Download URL
    // function uploadCompressedImage(file, quality, path, progressElement, fileLabel) {
    //   // Return a promise that resolves to null if the file is missing
    //   if (!file) {
    //     return Promise.resolve(null);
    //   }

    //   return new Promise((resolve, reject) => {
    //     // 1. Compress the image
    //     compressImage(file, quality)
    //       .then(blob => {
    //         // 2. Upload the compressed blob
    //         const storage = firebase.storage();
    //         const storageRef = storage.ref(path);
    //         const uploadTask = storageRef.put(blob);

    //         uploadTask.on('state_changed',
    //           (snapshot) => {
    //             // Update progress
    //             const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //             if (progressElement) {
    //                progressElement.textContent = `Uploading ${fileLabel}: ${Math.round(progress)}%`;
    //             }
    //           },
    //           (error) => {
    //             // Handle Error
    //             console.error(`Upload failed for ${fileLabel}:`, error);
    //             reject(error);
    //           },
    //           () => {
    //             // 3. Upload Complete - Get Download URL
    //             uploadTask.snapshot.ref.getDownloadURL()
    //               .then(downloadURL => {
    //                 console.log(`${fileLabel} available at`, downloadURL);
    //                 resolve(downloadURL); // This is the final URL
    //               })
    //               .catch(reject);
    //           }
    //         );
    //       })
    //       .catch(reject); // Catch errors from compression
    //   });
    // }

    const openModal = (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open'); // Add class to body
      }
    };

    const closeModal = (modal) => {
      if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open'); // Remove class from body
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

// --- (NEW) Event Listener for Mobile Login/Signup Button ---
    const loginSignupBtnMobile = document.getElementById('login-signup-btn-mobile');
    const mobileMenu = document.getElementById('mobile-menu'); // Get mobile menu for closing
    
    if (loginSignupBtnMobile) {
      loginSignupBtnMobile.addEventListener('click', () => {
        if (mobileMenu) mobileMenu.classList.add('hidden'); // Close menu
        
        if (currentUser) {
          auth.signOut();
        } else {
          openModal('authModal');
          resetAuthForms();
        }
      });
    }

    // --- (NEW) Event Listener for Mobile "My Queries" Button ---
    const myQueriesBtnMobile = document.getElementById('my-queries-btn-mobile');
    if (myQueriesBtnMobile) {
      myQueriesBtnMobile.addEventListener('click', () => {
        if (mobileMenu) mobileMenu.classList.add('hidden'); // Close menu
        loadMyQueries(); // Load fresh data
        openModal('myQueriesModal');
        // Default to "Sell" tab
        document.getElementById('my-sell-tab').click();
      });
    }

    // --- "Get Started" Buttons (Hero and Mobile) ---
    const getStartedBtns = document.querySelectorAll('.get-started-btn');
    getStartedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        openModal('buyOrSellModal');
      });
    });

    // --- "View Details" Buttons (Dynamic Click Listener) ---
    const marketplaceGrid = document.getElementById('marketplace-grid');
    if (marketplaceGrid) {
      marketplaceGrid.addEventListener('click', async (e) => {
        // Check if the clicked element is a .view-details-btn
        if (e.target.matches('.view-details-btn')) {
          const docId = e.target.dataset.docId;
          if (!docId) return;

          const productDetailModal = document.getElementById('productDetailModal');
          const modalTitle = document.getElementById('modal-product-title');
          const modalImg = document.getElementById('modal-product-img');
          const modalCondition = document.getElementById('modal-product-condition');
          const modalPrice = document.getElementById('modal-product-price');
          const modalWattage = document.getElementById('modal-product-wattage');
          const modalAge = document.getElementById('modal-product-age');

          // Show loading state
          modalTitle.textContent = 'Loading...';
          modalImg.src = '';
          
          openModal('productDetailModal');

          try {

            // Fetch the item's details from Firestore
            const doc = await db.collection('sellQueries').doc(docId).get();
            if (!doc.exists) {
              modalTitle.textContent = 'Error: Item not found.';
              return;
            }
            
            const item = doc.data();

            // --- Populate the modal ---
            // Store product title for the "Interested?" button
            productDetailModal.dataset.productTitle = item.panelParams;

            modalTitle.textContent = item.panelParams;
            modalImg.src = item.panelImageURL;
            modalPrice.textContent = `$${item.price}`;
            
            // Try to extract extra details
            try {
                // (You still need to add 'condition' to your form)
                modalCondition.textContent = 'Condition: (Add field to form)'; 
                modalWattage.textContent = item.panelParams.split('W')[0] + 'W';
                // Calculate age
                const purchaseYear = new Date(item.purchaseDate).getFullYear();
                const currentYear = new Date().getFullYear();
                const age = currentYear - purchaseYear;
                modalAge.textContent = (age <= 0) ? 'Less than 1 year old' : `${age} years old`;
            } catch (err) { /* ignore parsing errors */ }
            
            document.getElementById('modal-product-status').textContent = "Expert Verified";

          } catch (error) {
            console.error("Error fetching item details:", error);
            modalTitle.textContent = 'Error loading details.';
          }
        }
      });
    }

    async function checkUserProfile(onSuccess) {
      if (!currentUser) {
        alert("Please log in or sign up first.");
        openModal('authModal');
        resetAuthForms(); // Make sure forms are reset
        // Ensure Login tab is active by default when asking to login
        const loginTab = document.getElementById('login-tab-btn');
         if(loginTab) loginTab.click();
        return;
      }

      try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        // Check if the document exists AND has a non-empty 'name' field
        if (userDoc.exists && userDoc.data() && userDoc.data().name) {
          // Profile exists and is complete. Proceed with the action.
          onSuccess(); 
        } else {
          // Profile is missing or incomplete (no name).
          alert("Please complete your profile (name and address) to continue.");
          // Send them to the "Sign Up" tab, which now doubles as "Update Profile"
          openModal('authModal');
          // Programmatically click the signup tab
          const signupTab = document.getElementById('signup-tab-btn');
          if(signupTab) signupTab.click();
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
        alert("Could not verify your profile. Please try again.");
      }
    }
    // --- "Interested?" Button (Corrected with Profile Check & Data Check) ---
    const interestedBtn = document.getElementById('interested-btn');
    if (interestedBtn) {
      interestedBtn.addEventListener('click', () => {
        const productDetailModal = document.getElementById('productDetailModal');
        const productTitle = productDetailModal ? productDetailModal.dataset.productTitle : 'Unknown Product';

        // Use the profile check function - THIS HANDLES THE LOGIN REQUIREMENT
        checkUserProfile(async () => {
          // This code only runs if the user is logged in AND has a profile
          try {
            // Fetch the user document
            const userDoc = await db.collection('users').doc(currentUser.uid).get();

            // --- ADDED CHECKS ---
            let userName = 'N/A';
            let userLocation = 'N/A';
            // Verify the document and its data exist before accessing fields
            if (userDoc.exists && userDoc.data()) {
                const userData = userDoc.data();
                userName = userData.name || 'N/A'; // Use 'N/A' if name field is missing
                userLocation = userData.address || 'N/A'; // Use 'N/A' if address field is missing
            } else {
                // This case should ideally be caught by checkUserProfile, but added for safety
                console.warn("User document missing or empty despite profile check passing. Saving with N/A.");
            }
            // --- END ADDED CHECKS ---

            const userPhone = currentUser.phoneNumber || 'N/A'; // Add fallback for phone

            // Save data to 'interestedQueries' collection
            await db.collection('interestedQueries').add({
              userId: currentUser.uid,
              userName: userName,
              userLocation: userLocation,
              userPhone: userPhone,
              productTitle: productTitle,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Successfully saved interest
            console.log('Interest registered for user:', currentUser.uid);
            closeModal(productDetailModal);
            openModal('interestedQueryModal'); // Show success modal

          } catch (error) {
            // --- MORE DETAILED ERROR LOGGING ---
            console.error("Error saving interest or fetching user data: ", error);
            alert("There was an error registering your interest. Please check the console (F12) for details.");
            closeModal(productDetailModal);
          }
        }); // End of checkUserProfile callback
      }); // End of event listener
    } // End of if (interestedBtn)

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
// --- Sticky Header on Scroll ---
    // --- Sticky Header on Scroll (Mobile-Aware) ---
const header = document.getElementById('header');
if (header) {
  let lastScrollY = window.scrollY; // Store the last scroll position

  window.addEventListener('scroll', () => {
    // This is your existing logic
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // --- NEW: Mobile Hide/Show on Scroll Logic ---
    // We check innerWidth to only run this on mobile (below lg breakpoint)
    if (window.innerWidth < 1024) { 
      if (window.scrollY > lastScrollY && window.scrollY > 100) { 
        // Scrolling Down & past 100px
        header.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling Up
        header.style.transform = 'translateY(0)';
      }
      lastScrollY = window.scrollY < 0 ? 0 : window.scrollY; // Update last scroll position (handle negative scroll)
    } else {
      // On desktop, always ensure header is visible
      header.style.transform = 'translateY(0)';
    }
    // --- End Mobile Hide/Show ---

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
    // auth.onAuthStateChanged(user => {
    //   currentUser = user;
    //   const loginBtnDesktop = document.getElementById('login-signup-btn-desktop');
    //   const loginBtnMobile = document.getElementById('login-signup-btn-mobile');
    //   const myQueriesBtn = document.getElementById('my-queries-btn'); // <-- ADD THIS

    //   if (user) {
    //     console.log("User is signed in:", user.phoneNumber);
    //     if (loginBtnDesktop) loginBtnDesktop.textContent = 'Logout';
    //     if (loginBtnMobile) loginBtnMobile.textContent = 'Logout';
    //     if (myQueriesBtn) myQueriesBtn.classList.remove('hidden'); // <-- ADD THIS
    //   } else {
    //     console.log("User is signed out.");
    //     if (loginBtnDesktop) loginBtnDesktop.textContent = 'Login / Sign Up';
    //     if (loginBtnMobile) loginBtnMobile.textContent = 'Login / Sign Up';
    //     if (myQueriesBtn) myQueriesBtn.classList.add('hidden'); // <-- ADD THIS
    //   }
    // });
  // --- CORE AUTH LOGIC ---
    auth.onAuthStateChanged(user => {
      currentUser = user;
      
      // Get all the buttons
      const loginBtnDesktop = document.getElementById('login-signup-btn-desktop');
      const loginBtnMobile = document.getElementById('login-signup-btn-mobile');
      const myQueriesBtnDesktop = document.getElementById('my-queries-btn');
      const myQueriesBtnMobile = document.getElementById('my-queries-btn-mobile'); // <-- ADDED THIS

      if (user) {
        console.log("User is signed in:", user.phoneNumber);
        
        // Update Login/Logout buttons
        if (loginBtnDesktop) loginBtnDesktop.textContent = 'Logout';
        if (loginBtnMobile) loginBtnMobile.textContent = 'Logout'; // <-- ADDED THIS
        
        // Show "My Queries" buttons
        if (myQueriesBtnDesktop) myQueriesBtnDesktop.classList.remove('hidden');
        if (myQueriesBtnMobile) myQueriesBtnMobile.classList.remove('hidden'); // <-- ADDED THIS

      } else {
        console.log("User is signed out.");
        
        // Update Login/Logout buttons
        if (loginBtnDesktop) loginBtnDesktop.textContent = 'Login / Sign Up';
        if (loginBtnMobile) loginBtnMobile.textContent = 'Login / Sign Up'; // <-- ADDED THIS
        
        // Hide "My Queries" buttons
        if (myQueriesBtnDesktop) myQueriesBtnDesktop.classList.add('hidden');
        if (myQueriesBtnMobile) myQueriesBtnMobile.classList.add('hidden'); // <-- ADDED THIS
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
    // --- Sign-In Flow ---
    if (loginForm) {
      // Define elements specific to the login form
      const loginButton = document.getElementById('login-button');
      const phoneNumberInput = document.getElementById('login-phone');
      const otpInput = document.getElementById('login-otp');
      
      // Add a submit event listener to the form
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic Validation
        const rawPhoneNumberLogin = phoneNumberInput.value.trim();
        if (loginButton.textContent.includes('Send')) { // Phase 1 Validation
             if (!rawPhoneNumberLogin || !/^\d{10}$/.test(rawPhoneNumberLogin)) {
                alert('Please enter a valid 10-digit phone number.');
                return;
             }
        } else { // Phase 2 Validation
             if (!otpInput.value) {
                alert('Please enter the OTP.');
                return;
            }
        }

        // Proceed with Firebase logic
        if (loginButton.textContent.includes('Send')) {
          // --- ENSURE CLEAR HAPPENS FIRST ---
          clearRecaptcha(); 
          // --- Now create the new one ---
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-login', { 
              'size': 'invisible',
              'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                console.log("reCAPTCHA verified"); 
              },
              'expired-callback': () => {
                // Response expired. Ask user to solve reCAPTCHA again.
                alert("reCAPTCHA expired. Please try sending OTP again.");
                resetAuthForms(); // Reset if it expires
              } 
          });
          
          const phoneNumber = "+91" + rawPhoneNumberLogin; // Use the validated/cleaned input
          
          // Render reCAPTCHA explicitly for invisible type
          window.recaptchaVerifier.render().then((widgetId) => {
            window.recaptchaWidgetId = widgetId;
            // Now sign in
            auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
              .then(confirmationResult => {
                window.confirmationResult = confirmationResult;
                document.getElementById('login-phone-section').classList.add('hidden');
                document.getElementById('login-otp-section').classList.remove('hidden');
                loginButton.textContent = 'Verify OTP';
                alert('OTP sent successfully!');
              }).catch(error => {
                  alert("Sign in failed: " + error.message);
                  resetAuthForms(); // Reset on error
              });
          }).catch(error => {
             alert("reCAPTCHA render failed: " + error.message);
             resetAuthForms(); // Reset on render error
          });

        } else { // Verify OTP part
          const otp = otpInput.value;
          window.confirmationResult.confirm(otp).then(result => {
            alert("Successfully signed in!");
            closeModal(authModal);
            resetAuthForms();
          }).catch(error => {
              alert("Invalid OTP: " + error.message);
              // Don't necessarily reset here, let them retry OTP
          });
        }
      }); // END of loginForm event listener
    }

    // --- Sign-Up Flow --- (Corrected Structure)
    // if (signupForm) {
    //   signupForm.addEventListener('submit', (e) => {
    //     e.preventDefault();
    //     const signupButton = document.getElementById('signup-button');
    //     const nameInput = document.getElementById('signup-name');
    //     const addressInput = document.getElementById('signup-address');
    //     const phoneInput = document.getElementById('signup-phone');
    //     const otpInput = document.getElementById('signup-otp');

    //     // Basic Validation
    //     const rawPhoneNumberSignUp = phoneInput.value.trim();
    //     if (signupButton.textContent.includes('Send')) { // Phase 1 Validation
    //          if (!nameInput.value || !addressInput.value || !rawPhoneNumberSignUp) {
    //             alert('Please fill in all required fields (Name, Address, Phone Number).');
    //             return;
    //          }
    //          if (!/^\d{10}$/.test(rawPhoneNumberSignUp)) {
    //             alert('Please enter a valid 10-digit phone number.');
    //             return;
    //          }
    //     } else { // Phase 2 Validation
    //          if (!otpInput.value) {
    //             alert('Please enter the OTP.');
    //             return;
    //         }
    //     }

    //     // --- Proceed with Firebase logic ---

    //     // PHASE 1: Send OTP & Handle reCAPTCHA
    //     if (signupButton.textContent.includes('Send') || signupButton.textContent.includes('Sign Up')) {
    //       // --- ENSURE CLEAR HAPPENS FIRST ---
    //       clearRecaptcha();
    //       // --- Now create the new one ---
    //       window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-signup', {
    //           'size': 'invisible',
    //           'callback': (response) => {
    //             console.log("reCAPTCHA verified");
    //           },
    //           'expired-callback': () => {
    //             alert("reCAPTCHA expired. Please try sending OTP again.");
    //             resetAuthForms();
    //           }
    //       });

    //       const phoneNumber = "+91" + phoneInput.value;

    //       // Render reCAPTCHA explicitly
    //       window.recaptchaVerifier.render().then((widgetId) => {
    //          window.recaptchaWidgetId = widgetId;
    //          // Now sign in to send OTP
    //          auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    //           .then(confirmationResult => {
    //             window.confirmationResult = confirmationResult;
    //             document.getElementById('signup-details-section').classList.add('hidden');
    //             document.getElementById('signup-otp-section').classList.remove('hidden');
    //             signupButton.textContent = 'Create Account'; // Ready for OTP verification
    //             alert('OTP sent successfully!');
    //           }).catch(error => {
    //               alert("Sign up failed (OTP send): " + error.message);
    //               resetAuthForms(); // Reset on error
    //           });
    //       }).catch(error => {
    //          alert("reCAPTCHA render failed: " + error.message);
    //          resetAuthForms(); // Reset on render error
    //       });

    //     // PHASE 2: Verify OTP & Create Profile
    //     } else if (signupButton.textContent.includes('Create Account')) {
    //       const otp = otpInput.value;
    //       const name = nameInput.value; // Get name/address again (could be cleared)
    //       const address = addressInput.value;

    //       if (!name || !address) { // Re-validate name/address just in case
    //         alert("Name and address seem to be missing. Please try signing up again.");
    //         resetAuthForms();
    //         return;
    //       }

    //       window.confirmationResult.confirm(otp)
    //         .then(result => {
    //             const user = result.user;
    //             // Save/Update user details in Firestore
    //             const savePromise = db.collection('users').doc(user.uid).set({
    //                 name: name,
    //                 address: address,
    //                 phone: user.phoneNumber,
    //                 lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    //             }, { merge: true });

    //             return savePromise.then(() => result); // Pass result to next .then()
    //         })
    //         .then((result) => {
    //            // Show appropriate success message
    //            if (result.additionalUserInfo && !result.additionalUserInfo.isNewUser) {
    //                alert("Account details updated! Logging you in.");
    //            } else {
    //                alert("Account created successfully!");
    //            }
    //            closeModal(authModal);
    //            resetAuthForms();
    //         })
    //         .catch(error => {
    //             alert("Account creation/verification failed: " + error.message);
    //             // Don't reset to details here, let them retry OTP if it was invalid
    //             // If the error is different, they might need to restart
    //             if (!error.message.toLowerCase().includes('invalid')) {
    //                resetAuthForms(); // Reset fully for non-OTP errors
    //             }
    //         });
    //     } else {
    //         console.error("Signup button in unexpected state:", signupButton.textContent);
    //         resetAuthForms(); // Reset if button text is wrong
    //     }
    //   });
    // }

    // --- Sign-Up Flow --- (With whitespace validation)
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const signupButton = document.getElementById('signup-button');
        const nameInput = document.getElementById('signup-name');
        const addressInput = document.getElementById('signup-address');
        const phoneInput = document.getElementById('signup-phone');
        const otpInput = document.getElementById('signup-otp');

        // --- UPDATED: Trim all values for validation ---
        const name = nameInput.value.trim();
        const address = addressInput.value.trim();
        const rawPhoneNumberSignUp = phoneInput.value.trim();

        // Basic Validation
        if (signupButton.textContent.includes('Send')) { // Phase 1 Validation
             // --- UPDATED: Check trimmed values ---
             if (!name || !address || !rawPhoneNumberSignUp) {
                alert('Please fill in all required fields (Name, Address, Phone Number).');
                return;
             }
             if (!/^\d{10}$/.test(rawPhoneNumberSignUp)) {
                alert('Please enter a valid 10-digit phone number.');
                return;
             }
        } else { // Phase 2 Validation
             if (!otpInput.value) {
                alert('Please enter the OTP.');
                return;
            }
        }

        // --- Proceed with Firebase logic ---

        // PHASE 1: Send OTP & Handle reCAPTCHA
        if (signupButton.textContent.includes('Send') || signupButton.textContent.includes('Sign Up')) {
          clearRecaptcha();
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-signup', {
              'size': 'invisible',
              'callback': (response) => {
                console.log("reCAPTCHA verified");
              },
              'expired-callback': () => {
                alert("reCAPTCHA expired. Please try sending OTP again.");
                resetAuthForms();
              }
          });

          // --- UPDATED: Use the trimmed phone number ---
          const phoneNumber = "+91" + rawPhoneNumberSignUp; 

          window.recaptchaVerifier.render().then((widgetId) => {
             window.recaptchaWidgetId = widgetId;
             auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
              .then(confirmationResult => {
                window.confirmationResult = confirmationResult;
                document.getElementById('signup-details-section').classList.add('hidden');
                document.getElementById('signup-otp-section').classList.remove('hidden');
                signupButton.textContent = 'Create Account';
                alert('OTP sent successfully!');
              }).catch(error => {
                  alert("Sign up failed (OTP send): " + error.message);
                  resetAuthForms();
              });
          }).catch(error => {
             alert("reCAPTCHA render failed: " + error.message);
             resetAuthForms();
          });

        // PHASE 2: Verify OTP & Create Profile
        } else if (signupButton.textContent.includes('Create Account')) {
          const otp = otpInput.value;
          // --- UPDATED: Re-validate the trimmed values just in case ---
          if (!name || !address) { 
            alert("Name and address seem to be missing. Please try signing up again.");
            resetAuthForms();
            return;
          }

          window.confirmationResult.confirm(otp)
            .then(result => {
                const user = result.user;
                // Save/Update user details in Firestore
                const savePromise = db.collection('users').doc(user.uid).set({
                    name: name, // Save the trimmed name
                    address: address, // Save the trimmed address
                    phone: user.phoneNumber,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                return savePromise.then(() => result);
            })
            .then((result) => {
               if (result.additionalUserInfo && !result.additionalUserInfo.isNewUser) {
                   alert("Account details updated! Logging you in.");
               } else {
                   alert("Account created successfully!");
               }
               closeModal(authModal);
               resetAuthForms();
            })
            .catch(error => {
                alert("Account creation/verification failed: " + error.message);
                if (!error.message.toLowerCase().includes('invalid')) {
                   resetAuthForms();
                }
            });
        } else {
            console.error("Signup button in unexpected state:", signupButton.textContent);
            resetAuthForms();
        }
      });
    }

    // --- Sell Panel Form Validation & Submission --- (UPDATED for Price)
    // --- Sell Panel Form Validation & Submission --- (UPDATED for new fields)
    // --- Sell Panel Form Validation & Submission --- (UPDATED for new fields)
    // --- Sell Panel Form Validation & Submission --- (UPDATED for new fields)
    if (sellForm) {
        // --- This function will reset your form after success ---
        window.resetSellForm = () => {
            sellForm.reset();
            document.getElementById('sell-image-preview').classList.add('hidden');
            document.getElementById('sell-receipt-preview').classList.add('hidden'); 
            document.getElementById('sell-success').classList.add('hidden');
            sellForm.classList.remove('hidden');
            const submitButton = document.getElementById('sell-submit-button');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit for Review';
        }

        sellForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // 1. Get form elements and values
            const brandInput = document.getElementById('sell-brand');
            const modelInput = document.getElementById('sell-model');
            const wattageInput = document.getElementById('sell-wattage');
            const quantityInput = document.getElementById('sell-quantity');
            const purchaseDateInput = document.getElementById('sell-purchase-date');
            const locationInput = document.getElementById('sell-location');
            const priceInput = document.getElementById('sell-price');
            const purchasedFromInput = document.getElementById('sell-purchased-from');
            const panelImageInput = document.getElementById('sell-panel-image');
            const receiptImageInput = document.getElementById('sell-receipt-image');
            const submitButton = document.getElementById('sell-submit-button');
            const progressText = document.getElementById('upload-progress');
            
            // Get values
            const panelFile = panelImageInput.files[0];
            const receiptFile = receiptImageInput.files[0];
            
            const brand = brandInput.value.trim();
            const model = modelInput.value.trim();
            const wattage = wattageInput.value;
            const quantity = quantityInput.value;
            const purchaseDate = purchaseDateInput.value;
            const location = locationInput.value.trim();
            const price = priceInput.value;
            const purchasedFrom = purchasedFromInput.value.trim();

            // 2. Validation
            if (!brand || !wattage || !quantity || !purchaseDate || !location || !price || !panelFile) {
                alert('Please fill in all required fields (*), including a panel image.');
                return;
            }
            
            // --- NEW: Date Validation ---
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to midnight this morning
            
            // Treats the input 'YYYY-MM-DD' as local time, not UTC
            const inputDate = new Date(purchaseDate + 'T00:00:00'); 

            if (inputDate > today) {
                alert('Purchase date cannot be in the future. Please enter a valid date.');
                return;
            }
            // --- END: Date Validation ---

            // 3. Check for logged-in user (already done by checkUserProfile, but good for safety)
            if (!currentUser) {
                alert("You must be logged in to sell a panel.");
                closeModal(document.getElementById('sellPanelModal'));
                openModal('authModal');
                return;
            }

            // 4. Disable button and show progress
            submitButton.disabled = true;
            submitButton.textContent = 'Compressing...';
            progressText.classList.remove('hidden');
            progressText.textContent = 'Compressing images...';

            // 5. Define compression settings
            const compressionQuality = 0.7; 
            const compressionMaxWidth = 800;
            
            // 6. Create compression promises
            const panelCompressPromise = compressImage(panelFile, compressionQuality, compressionMaxWidth);
            const receiptCompressPromise = receiptFile ? compressImage(receiptFile, compressionQuality, compressionMaxWidth) : Promise.resolve(null);

            // 7. Wait for compression to finish
            Promise.all([panelCompressPromise, receiptCompressPromise])
                .then(([panelBlob, receiptBlob]) => {
                    
                    submitButton.textContent = 'Uploading...';
                    progressText.textContent = 'Upload started...';

                    // 8. Create upload promises
                    const panelPath = `sell-images/${currentUser.uid}/${Date.now()}-panel-${panelFile.name}`;
                    const receiptPath = receiptFile ? `sell-images/${currentUser.uid}/${Date.now()}-receipt-${receiptFile.name}` : null;

                    const panelUploadPromise = uploadBlob(panelBlob, panelPath, progressText, 'Panel');
                    const receiptUploadPromise = uploadBlob(receiptBlob, receiptPath, progressText, 'Receipt');

                    // 9. Wait for uploads to finish
                    return Promise.all([panelUploadPromise, receiptUploadPromise]);
                })
                .then(([panelImageURL, receiptImageURL]) => {
                    // 10. Save data to Firestore
                    submitButton.textContent = 'Saving Details...';
                    return db.collection('sellQueries').add({
                        sellerId: currentUser.uid,
                        sellerPhone: currentUser.phoneNumber,
                        
                        // --- NEW FIELDS ---
                        brand: brand,
                        model: model || null, // Store null if empty
                        wattage: Number(wattage),
                        quantity: Number(quantity),
                        location: location,
                        // --- END NEW FIELDS ---

                        purchaseDate: purchaseDate,
                        price: Number(price), 
                        purchasedFrom: purchasedFrom || null, // Store null if empty
                        
                        panelImageURL: panelImageURL, 
                        receiptImageURL: receiptImageURL || null, 
                        
                        status: 'pending_review',
                        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
                        
                        // 'panelParams' is now removed
                    });
                })
                .then(() => {
                    // 11. SUCCESS: Show success message
                    console.log("Sell query successfully submitted with images!");
                    sellForm.classList.add('hidden');
                    progressText.classList.add('hidden');
                    document.getElementById('sell-success').classList.remove('hidden');
                })
                .catch((error) => {
                    // 12. ERROR: Handle all errors
                    console.error("Submission failed: ", error);
                    alert("There was an error during submission. Check the console (F12) for details.");
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit for Review';
                    progressText.classList.add('hidden');
                });
        });
    }

    // --- Buy Request Form Validation & Submission ---
    // --- Buy Request Form Validation & Submission --- (UPDATED WITH FIREBASE)
    if (buyForm) {
        buyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form elements
            const wattageInput = buyForm.querySelector('input[placeholder*="5000 W"]');
            const budgetInput = buyForm.querySelector('input[placeholder*="2000"]');
            const preferenceInput = buyForm.querySelector('input[placeholder*="Canadian Solar"]');
            const submitButton = buyForm.querySelector('button[type="submit"]');

            // Get form values
            const wattage = wattageInput.value;
            const budget = budgetInput.value;
            const preference = preferenceInput.value || 'N/A'; // Use 'N/A' if empty

            // 1. Validation
            if (!wattage || !budget) {
                alert('Please fill in the required wattage and budget.');
                return;
            }

            // 2. Check for logged-in user (should be available in `currentUser`)
            if (!currentUser) {
                alert("You must be logged in to submit a request.");
                closeModal(document.getElementById('buyRequestModal'));
                openModal('authModal');
                return;
            }
            
            // 3. Disable button to prevent double clicks
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            // 4. Add data to Firestore
            db.collection('buyQueries').add({
                buyerId: currentUser.uid,
                buyerPhone: currentUser.phoneNumber,
                requiredWattage: Number(wattage), // Save as a number
                budget: Number(budget),           // Save as a number
                preference: preference,
                status: 'pending_review',
                submittedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                // 5. SUCCESS: Show success message
                console.log("Buy query successfully submitted to Firestore.");
                buyForm.classList.add('hidden');
                
                // You can pick which message to show, or keep your random logic.
                // I'll just show the 'found' one for this example.
                document.getElementById('buy-result-found').classList.remove('hidden');
                
                // 6. Reset form for next time
                buyForm.reset();
                submitButton.disabled = false;
                submitButton.textContent = 'Find a Match';
            })
            .catch((error) => {
                // 7. ERROR: Show error and re-enable button
                console.error("Error adding buy query: ", error);
                alert("There was an error submitting your request. Please try again.");
                submitButton.disabled = false;
                submitButton.textContent = 'Find a Match';
            });
        });

        // --- (NEW) Load Main Marketplace ---
        
// --- (NEW) Load Main Marketplace ---
    async function loadMainMarketplace() {
      const grid = document.getElementById('marketplace-grid');
      if (!grid) return;

      grid.innerHTML = '<p class="col-span-4 text-center">Loading available panels...</p>';

      try {
        const querySnapshot = await db.collection('sellQueries')
                                      .where('status', '==', 'approved')
                                      .orderBy('submittedAt', 'desc')
                                      .get();
        
        if (querySnapshot.empty) {
          grid.innerHTML = '<p class="col-span-4 text-center">No panels are available right now. Check back soon!</p>';
          return;
        }

        let html = '';
        querySnapshot.forEach((doc) => {
          const item = doc.data();
          const docId = doc.id; // We'll need this for the "View Details" button

          html += `
            <div class="bg-white rounded-lg overflow-hidden shadow-lg group border">
              <img src="${item.panelImageURL}" class="w-full h-48 object-cover" alt="Solar Panel">
              <div class="p-4">
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Expert Verified</span>
                <h3 class="font-bold mt-2 text-lg text-gray-800" style="width:250px;height:56px;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                  ${item.panelParams}
                </h3>
                <p class="text-gray-600 text-sm">Condition: (Add field to form)</p>
                <p class="text-blue-700 font-bold text-xl mt-2">₹${item.price}</p>
                <button class="view-details-btn w-full mt-4 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors" data-doc-id="${docId}">
                  View Details
                </button>
              </div>
            </div>
          `;
        });
        grid.innerHTML = html;

      } catch (error) {
        console.error("Error loading marketplace: ", error);
        grid.innerHTML = '<p class="col-span-4 text-center text-red-500">Could not load panels. Please try again later.</p>';
      }
      
    }
    
// --- Call the new function ---
loadMainMarketplace();
    }

    // --- (NEW) Event Listeners for "My Queries" Modals ---

    // Open "My Queries" modal
    document.getElementById('my-queries-btn').addEventListener('click', () => {
      loadMyQueries(); // Load fresh data
      openModal('myQueriesModal');
      // Default to "Sell" tab
      document.getElementById('my-sell-tab').click();
    });

    // Tab switching in "My Queries" modal
    document.getElementById('my-sell-tab').addEventListener('click', () => {
      document.getElementById('my-sell-tab').classList.add('active');
      document.getElementById('my-buy-tab').classList.remove('active');
      document.getElementById('my-sell-content').classList.remove('hidden');
      document.getElementById('my-buy-content').classList.add('hidden');
    });
    document.getElementById('my-buy-tab').addEventListener('click', () => {
      document.getElementById('my-buy-tab').classList.add('active');
      document.getElementById('my-sell-tab').classList.remove('active');
      document.getElementById('my-buy-content').classList.remove('hidden');
      document.getElementById('my-sell-content').classList.add('hidden');
    });


    // --- (NEW) Event Listener for Edit/Save/Delete ---
    // We listen on the whole body to catch clicks on dynamic buttons
    document.body.addEventListener('click', async (e) => {
      
      // Handle "Edit" button click
      if (e.target.matches('.edit-query-btn')) {
        const docId = e.target.dataset.docId;
        const collection = e.target.dataset.collection;
        
        if (collection === 'buyQueries') {
          try {
            const doc = await db.collection('buyQueries').doc(docId).get();
            if (!doc.exists) throw new Error("Document not found.");
            
            const data = doc.data();
            // Populate the edit modal
            document.getElementById('edit-buy-wattage').value = data.requiredWattage;
            document.getElementById('edit-buy-budget').value = data.budget;
            document.getElementById('edit-buy-preference').value = data.preference;
            document.getElementById('save-buy-query-btn').dataset.docId = docId;
            document.getElementById('delete-buy-query-btn').dataset.docId = docId;

            closeModal(document.getElementById('myQueriesModal'));
            openModal('editBuyQueryModal');
          } catch (error) {
            console.error("Error loading query for edit:", error);
            alert("Error: " + error.message);
          }
        }
        // You can add an 'else if (collection === 'sellQueries')' here later
      }
    });

    // Handle "Save Changes" on edit form
    document.getElementById('edit-buy-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const docId = document.getElementById('save-buy-query-btn').dataset.docId;
      if (!docId) return;

      const newWattage = document.getElementById('edit-buy-wattage').value;
      const newBudget = document.getElementById('edit-buy-budget').value;
      const newPreference = document.getElementById('edit-buy-preference').value;

      try {
        await db.collection('buyQueries').doc(docId).update({
          requiredWattage: Number(newWattage),
          budget: Number(newBudget),
          preference: newPreference || 'N/A'
        });

        alert("Request updated!");
        closeModal(document.getElementById('editBuyQueryModal'));
        
      } catch (error) {
        console.error("Error updating document:", error);
        alert("Error: " + error.message);
      }
    });

    // Handle "Delete" button
    document.getElementById('delete-buy-query-btn').addEventListener('click', async (e) => {
      const docId = e.target.dataset.docId;
      if (!docId) return;

      if (confirm("Are you sure you want to delete this request?")) {
        try {
          await db.collection('buyQueries').doc(docId).delete();
          alert("Request deleted.");
          closeModal(document.getElementById('editBuyQueryModal'));
        } catch (error) {
          console.error("Error deleting document:", error);
          alert("Error: " + error.message);
        }
      }
    });

  } catch (error) {
    console.error("Firebase initialization failed:", error);
    alert("Could not connect to services. Please try again later.");
  }
});