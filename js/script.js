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
            //document.getElementById('modal-product-price').textContent = 'Price on request'; //Price can be added later
            document.getElementById('modal-product-price').textContent = data.price ? `₹${data.price}` : 'Price on request';

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

            /*
            try {
              document.getElementById('modal-product-wattage').textContent = data.panelParams.split('W')[0] + 'W';
              document.getElementById('modal-product-load').textContent = data.loadType || 'General Home Use';
              document.getElementById('modal-product-age').textContent = ageText.match(/\(([^)]+)\)/)[1];
            } catch (err) { /* ignore if parsing fails  }*/
            try {
              document.getElementById('modal-product-wattage').textContent = data.panelParams.includes('W') ? data.panelParams.split('W')[0] + 'W' : data.panelParams;
              document.getElementById('modal-product-load').textContent = data.loadType || 'General Home Use';

              // Safety check for ageText before regex
              if (ageText.includes('(')) {
                document.getElementById('modal-product-age').textContent = ageText.match(/\(([^)]+)\)/)[1];
              } else {
                document.getElementById('modal-product-age').textContent = ageText;
              }
            } catch (err) { console.error("UI Update Error:", err); }
            document.getElementById('modal-product-status').textContent = "Expert Verified";
            // ==========================================
            // NEW: SAVINGS CALCULATOR LOGIC
            // ==========================================
            // const savingsContainer = document.getElementById('modal-savings-container');
            // if (savingsContainer) {
            //   // 1. Extract wattage number from a string like "350W Monocrystalline"
            //   const wattageMatch = data.panelParams ? data.panelParams.match(/(\d+)/) : null;
            //   const wattage = wattageMatch ? parseInt(wattageMatch[0]) : 0;

            //   // 2. Safely get the used price (fallback to 0 if price isn't added to DB yet)
            //   const usedPrice = data.price ? parseFloat(data.price) : 0;

            //   if (wattage > 0) {
            //     // The Math Assumptions: 
            //     // - New panels cost approx ₹30 per Watt in India
            //     // - Avg 5 hours of peak sun/day
            //     // - Electricity rate of approx ₹8/kWh
            //     const newPanelCost = wattage * 30;
            //     const monthlyEnergySavings = (wattage / 1000) * 5 * 30 * 8;

            //     let savingsHTML = `
            //       <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
            //           <h4 class="font-bold text-green-800 flex items-center mb-2">
            //               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            //                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            //               </svg>
            //               Estimated Savings
            //           </h4>
            //     `;

            //     // If price exists in DB, show upfront savings. Otherwise, just show the cost of a new panel.
            //     if (usedPrice > 0) {
            //       const upfrontSavings = newPanelCost - usedPrice;
            //       savingsHTML += `<p class="text-sm text-green-700 mb-1">Save <strong>₹${upfrontSavings.toLocaleString()}</strong> upfront compared to buying new (Est. ₹${newPanelCost.toLocaleString()}).</p>`;
            //     } else {
            //       savingsHTML += `<p class="text-sm text-green-700 mb-1">New panel cost estimate: <strong>₹${newPanelCost.toLocaleString()}</strong>.</p>`;
            //     }

            //     savingsHTML += `
            //           <p class="text-sm text-green-700">Estimated electricity savings: <strong>₹${monthlyEnergySavings.toFixed(0)}/month</strong></p>
            //           <p class="text-[10px] text-green-600 mt-2 opacity-80">*Based on 5hrs avg sun/day and ₹8/kWh electricity rate.</p>
            //       </div>
            //     `;
            //     savingsContainer.innerHTML = savingsHTML;
            //   } else {
            //     savingsContainer.innerHTML = ''; // Clear box if no valid wattage is found
            //   }
            // }
            const savingsContainer = document.getElementById('modal-savings-container');
            if (savingsContainer) {
              // 1. Extract wattage number from a string like "350W Monocrystalline"
              const wattageMatch = data.panelParams ? data.panelParams.match(/(\d+)/) : null;
              const wattage = wattageMatch ? parseInt(wattageMatch[0]) : 0;

              // 2. Robust Price Check (Handles numbers and "Price on request" strings)
              const usedPrice = parseFloat(data.price);
              const hasValidPrice = !isNaN(usedPrice) && usedPrice > 0;

              if (wattage > 0) {
                const newPanelCost = wattage * 30; // ₹30/Watt market average
                const monthlyEnergySavings = (wattage / 1000) * 5 * 30 * 8;

                // Start building the UI (Keeping your SVG icon)
                let savingsHTML = `
                  <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <h4 class="font-bold text-green-800 flex items-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Estimated Savings
                      </h4>
                `;

                // Logic: Only show Upfront Savings if a price is actually listed
                if (hasValidPrice) {
                  const upfrontSavings = newPanelCost - usedPrice;
                  savingsHTML += `<p class="text-sm text-green-700 mb-1">Save <strong>₹${upfrontSavings.toLocaleString()}</strong> upfront compared to buying new (Est. ₹${newPanelCost.toLocaleString()}).</p>`;
                } else {
                  savingsHTML += `<p class="text-sm text-green-700 mb-1">New panel cost estimate: <strong>₹${newPanelCost.toLocaleString()}</strong>.</p>`;
                }

                // Add the monthly savings and your disclaimer
                savingsHTML += `
                      <p class="text-sm text-green-700">Estimated electricity savings: <strong>₹${monthlyEnergySavings.toFixed(0)}/month</strong></p>
                      <p class="text-[10px] text-green-600 mt-2 opacity-80">*Based on 5hrs avg sun/day and ₹8/kWh electricity rate.</p>
                  </div>
                `;
                savingsContainer.innerHTML = savingsHTML;
              } else {
                savingsContainer.innerHTML = '';
              }
            }
            // ==========================================
            // END OF SAVINGS CALCULATOR LOGIC
            // ========================================== 
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
              ${data.price ? `₹${data.price}` : 'Price on request'}
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

    // --- "Interested?" Button Logic ---
    const interestedBtn = document.getElementById('interested-btn');
    if (interestedBtn) {
      interestedBtn.addEventListener('click', async () => {
        // 1. Get the ID from the hidden span we added to index.html
        const productId = document.getElementById('modal-product-id')?.textContent || '';
        const productTitle = document.getElementById('modal-product-title')?.textContent || '';

        if (!productId) {
          alert('Could not identify the product. Please try again.');
          return;
        }

        closeModal(document.getElementById('productDetailModal'));

        if (currentUser) {
          try {
            // Fetch user's address/location
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            const userLocation = userDoc.exists ? (userDoc.data().address || 'N/A') : 'N/A';

            // Submit inquiry
            await db.collection('interestedQueries').add({
              productId: productId,
              productTitle: productTitle,
              userId: currentUser.uid,
              userPhone: currentUser.phoneNumber || 'N/A',
              userLocation: userLocation,
              status: 'pending',
              submittedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('Request sent! The admin will contact you soon.');
          } catch (error) {
            console.error('Error:', error);
            alert('Failed to send request.');
          }
        } else {
          alert("Please log in to express interest.");
          openModal('authModal');
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

    // Updated Sell Button Listener (use openModal helper)
    if (sellBtn) {
      sellBtn.addEventListener('click', () => {
        resetSellModal();
        closeModal(buyOrSellModal); // close selector if open
        openModal('sellPanelModal');
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
    // --- Updated Sell Form Submission Handler ---
    const sellForm = document.getElementById('sell-form');
    if (sellForm) {
      sellForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Check if user is logged in
        if (!auth.currentUser) {
          alert("Please login to list your panel.");
          return;
        }

        const submitBtn = sellForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        try {
          // 2. Get values from the NEW fields
          const purchaseDate = sellForm.elements['purchase-date'].value;
          const purchasedFrom = sellForm.elements['purchased-from'].value;
          const price = document.getElementById('sell-price').value;
          const loadType = document.getElementById('sell-load-type').value;

          // New Separate Fields
          const panelType = document.getElementById('sell-panel-type').value;
          const wattage = document.getElementById('sell-wattage').value;
          const brand = document.getElementById('sell-brand').value;

          // Construct the display string for the Marketplace Title
          const displayParams = `${wattage}W ${panelType}${brand ? ' (' + brand + ')' : ''}`;

          // 3. Handle File Uploads
          const imageFile = document.getElementById('sell-image').files[0];
          const receiptFile = document.getElementById('sell-receipt').files[0];

          let panelImageUrl = "";
          let receiptImageUrl = "";

          if (imageFile) {
            const imgRef = storage.ref(`panels/${Date.now()}_${imageFile.name}`);
            await imgRef.put(imageFile);
            panelImageUrl = await imgRef.getDownloadURL();
          }

          if (receiptFile) {
            const recRef = storage.ref(`receipts/${Date.now()}_${receiptFile.name}`);
            await recRef.put(receiptFile);
            receiptImageUrl = await recRef.getDownloadURL();
          }

          // 4. Save to Firestore
          await db.collection('sellQueries').add({
            sellerId: auth.currentUser.uid,
            sellerPhone: auth.currentUser.phoneNumber,
            purchaseDate: purchaseDate,
            purchasedFrom: purchasedFrom,
            panelParams: displayParams, // Used for the title
            actualWattage: parseInt(wattage), // Used for the calculator
            price: parseFloat(price),
            loadType: loadType,
            panelImageURL: panelImageUrl,
            receiptImageURL: receiptImageUrl,
            status: 'pending', // Waiting for Admin Approval
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
          });

          // 5. SUCCESS UI: Hide form and show success message
          sellForm.classList.add('hidden');
          document.getElementById('sell-success').classList.remove('hidden');

        } catch (error) {
          console.error("Submission error:", error);
          alert("Error submitting: " + error.message);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit for Review';
        }
      });
    }

    // --- Function to reset the Sell Modal UI ---
    // --- Function to reset the Sell Modal UI ---
    function resetSellModal() {
      const form = document.getElementById('sell-form');
      const success = document.getElementById('sell-success');
      const preview = document.getElementById('seller-live-preview');

      if (form) {
        form.classList.remove('hidden');
        form.reset();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit for Review';
        }
      }
      if (success) success.classList.add('hidden');
      if (preview) preview.classList.add('hidden');
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
      // --- MY ACTIVITY & NOTIFICATIONS LOGIC ---
      const activityBellBtn = document.getElementById('activity-bell-btn');
      const notificationBadge = document.getElementById('notification-badge');
      const activityModal = document.getElementById('activityModal');
      const activityListContainer = document.getElementById('activity-list-container');

      if (user) {
        // Show the floating bell since they are logged in
        if (activityBellBtn) activityBellBtn.classList.remove('hidden');

        // Listen to this specific user's listings
        db.collection('sellQueries')
          .where('sellerId', '==', user.uid)
          .orderBy('submittedAt', 'desc')
          .onSnapshot((snapshot) => {
            activityListContainer.innerHTML = ''; // Clear loading text
            let hasUnread = false;

            if (snapshot.empty) {
              activityListContainer.innerHTML = '<p class="text-center text-gray-500 py-8">You haven\'t listed any panels yet.</p>';
              return;
            }

            snapshot.forEach((doc) => {
              const data = doc.data();
              const docId = doc.id;

              // Check if admin left a message that the user hasn't seen
              if (data.hasUnreadNotification) {
                hasUnread = true;
              }

              // Determine status color and text
              let statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">Pending Review</span>`;
              if (data.status === 'approved') statusBadge = `<span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Live on Market</span>`;
              if (data.status === 'rejected') statusBadge = `<span class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">Rejected / Delisted</span>`;
              if (data.status === 'sold') statusBadge = `<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Sold!</span>`;

              // Build the Admin Message Box (if it exists)
              const adminMessageBox = data.adminMessage
                ? `<div class="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 text-sm text-blue-800">
                   <strong>Admin Note:</strong> ${data.adminMessage}
                 </div>`
                : '';

              // Build the Card
              const card = document.createElement('div');
              card.className = "border rounded-lg p-4 shadow-sm relative";
              card.innerHTML = `
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="font-bold text-lg">${data.panelParams}</h4>
                  <p class="text-gray-600 text-sm">Listed Price: ₹<span id="price-display-${docId}">${data.price}</span></p>
                </div>
                ${statusBadge}
              </div>
              
              ${adminMessageBox}

              <div class="mt-4 flex gap-2 justify-end">
                ${data.status === 'pending' || data.status === 'approved' ? `
                  <button onclick="editUserPanelPrice('${docId}', ${data.price})" class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded border">Edit Price</button>
                  <button onclick="deleteUserPanel('${docId}')" class="text-sm bg-red-50 hover:bg-red-100 text-red-600 py-1 px-3 rounded border border-red-200">Remove Listing</button>
                ` : ''}
              </div>
            `;
              activityListContainer.appendChild(card);
            });

            // Show/Hide the Red Dot
            if (hasUnread) {
              notificationBadge.classList.remove('hidden');
            } else {
              notificationBadge.classList.add('hidden');
            }
          });

        // // Open Modal and Clear "Unread" status when clicked
        // activityBellBtn.addEventListener('click', () => {
        //   activityModal.classList.remove('hidden');
        //   activityModal.classList.add('flex');

        //   // Mark all as read in Firestore
        //   db.collection('sellQueries').where('sellerId', '==', user.uid).where('hasUnreadNotification', '==', true).get().then(snapshot => {
        //     snapshot.forEach(doc => {
        //       db.collection('sellQueries').doc(doc.id).update({ hasUnreadNotification: false });
        //     });
        //   });
        // });

      } else {
        // Hide if logged out
        if (activityBellBtn) activityBellBtn.classList.add('hidden');
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

  // --- LIVE VALUE SCORE PREVIEW (robust, ID fixes) ---
  const sellWattageInput = document.getElementById('sell-wattage'); // matches HTML
  const sellPriceInput = document.getElementById('sell-price');
  const previewBox = document.getElementById('seller-live-preview');
  const previewText = document.getElementById('preview-text');

  function updateSellerPreview() {
    // Guard against missing DOM nodes
    if (!sellWattageInput || !sellPriceInput || !previewBox || !previewText) return;

    const watts = parseInt(sellWattageInput.value, 10) || 0;
    const price = parseFloat(sellPriceInput.value) || 0;

    if (watts > 0 && price > 0) {
      const estNewPrice = watts * 30;
      const savings = Math.round(estNewPrice - price);
      previewBox.classList.remove('hidden');

      if (savings > 0) {
        previewText.innerHTML = `Buyers will see that they save <b>₹${savings.toLocaleString()}</b> by choosing your panel over a new one!`;
      } else {
        previewText.innerHTML = `⚠️ Your price is close to the cost of a new panel (₹${estNewPrice.toLocaleString()}). Consider lowering it to sell faster!`;
      }
    } else {
      previewBox.classList.add('hidden');
      previewText.textContent = '';
    }
  }

  if (sellWattageInput) sellWattageInput.addEventListener('input', updateSellerPreview);
  if (sellPriceInput) sellPriceInput.addEventListener('input', updateSellerPreview);

  // initialize preview if values are prefilled
  updateSellerPreview();
  // --- GLOBAL FUNCTIONS FOR MY ACTIVITY ---
  window.editUserPanelPrice = async function (docId, currentPrice) {
    const newPrice = prompt(`Enter new price (Current: ₹${currentPrice}):`, currentPrice);

    if (newPrice && !isNaN(newPrice) && newPrice !== currentPrice.toString()) {
      try {
        await db.collection('sellQueries').doc(docId).update({
          price: parseFloat(newPrice)
        });
        alert("Price updated successfully!");
      } catch (error) {
        console.error("Error updating price:", error);
        alert("Failed to update price.");
      }
    }
  };

  window.deleteUserPanel = async function (docId) {
    if (confirm("Are you sure you want to remove this listing permanently?")) {
      try {
        await db.collection('sellQueries').doc(docId).delete();
        alert("Listing removed.");
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to remove listing.");
      }
    }
  };
  // --- BULLETPROOF BELL ICON LISTENER ---
  const myBellBtn = document.getElementById('activity-bell-btn');
  const myActivityModal = document.getElementById('activityModal');

  if (myBellBtn && myActivityModal) {
    myBellBtn.addEventListener('click', () => {
      console.log("Activity bell clicked!"); // To help us verify it works

      // 1. Open the modal (Toggle Tailwind classes)
      myActivityModal.classList.remove('hidden');
      myActivityModal.classList.add('flex');

      // 2. Clear the red dot immediately on the UI
      const badge = document.getElementById('notification-badge');
      if (badge) badge.classList.add('hidden');

      // 3. Tell Firebase to mark messages as read (if user is logged in)
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        db.collection('sellQueries')
          .where('sellerId', '==', currentUser.uid)
          .where('hasUnreadNotification', '==', true)
          .get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              db.collection('sellQueries').doc(doc.id).update({ hasUnreadNotification: false });
            });
          })
          .catch(err => console.error("Error clearing notifications:", err));
      }
    });
  }
});