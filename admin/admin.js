document.addEventListener('DOMContentLoaded', function () {
  const adminLoginSection = document.getElementById('admin-login-section');
  const adminDashboardSection = document.getElementById('admin-dashboard-section');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginError = document.getElementById('admin-login-error');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const confirmationMessage = document.getElementById('confirmation-message');

  // --- Generic Modal Handlers (for static modals) ---
  function setupStaticModals() {
    // Open Modals
    document.querySelectorAll('[data-modal-target]').forEach(button => {
      button.addEventListener('click', () => {
        const modalId = button.getAttribute('data-modal-target');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex'); // Use flex for centering
        }
      });
    });

    // Close Modals
    document.querySelectorAll('[data-modal-close]').forEach(button => {
      button.addEventListener('click', () => {
        const modalId = button.getAttribute('data-modal-close');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    });
  }

  // Run the modal setup
  setupStaticModals();

  // Firebase references
  const db = firebase.firestore();
  const auth = firebase.auth();

  // --- Admin Login ---
  adminLoginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    // Hide any previous errors
    adminLoginError.classList.add('hidden');

    // Firebase Email/Password Auth
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        adminLoginSection.classList.add('hidden');
        adminDashboardSection.classList.remove('hidden');
        console.log('Logged in as:', userCredential.user.email);

        // Load admin data after login
        loadPendingSellerVerifications();
        loadPendingBuyerQueries();
        loadMarketplacePanels();
      })
      .catch((error) => {
        // Show error message
        adminLoginError.classList.remove('hidden');
        adminLoginError.textContent = 'Invalid email or password. Please try again.';
        console.error('Login error:', error.message);
      });
  });

  // --- Logout ---
  logoutBtn?.addEventListener('click', () => {
    auth.signOut().catch(console.error);
  });

  // --- Auth State Observer ---
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      adminLoginSection.classList.add('hidden');
      adminDashboardSection.classList.remove('hidden');
      adminLoginError.classList.add('hidden');

      // Load admin data
      loadPendingSellerVerifications();
      loadPendingBuyerQueries();
      loadMarketplacePanels();
    } else {
      adminDashboardSection.classList.add('hidden');
      adminLoginSection.classList.remove('hidden');
      adminLoginForm.email.value = '';
      adminLoginForm.password.value = '';
    }
  });

  // --- Load Pending Seller Verifications (UPDATED with Event Delegation) ---
  async function loadPendingSellerVerifications() {
    const tbody = document.getElementById('seller-queries-tbody');
    if (!tbody) return;

    // We need a way to link the clicked button back to its data
    const sellerDataMap = new Map();

    try {
      const snapshot = await db.collection('sellQueries')
        .where('status', '==', 'pending')
        .orderBy('submittedAt', 'desc')
        .get();

      tbody.innerHTML = ''; // Clear old rows

      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-gray-600 text-center">No pending seller verifications.</td></tr>';
        return;
      }

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Store the data in our map using the doc ID as the key
        sellerDataMap.set(doc.id, data);

        const row = createSellerVerificationRow(doc.id, data);
        tbody.appendChild(row);
      });

      // --- NEW: Add ONE listener to the entire table body ---
      tbody.addEventListener('click', (event) => {
        // Check if the clicked element is our button
        const button = event.target.closest('.view-details-btn');

        if (button) {
          // Get the ID we stored on the button
          const docId = button.dataset.docId;

          // Get the data from our map
          const data = sellerDataMap.get(docId);

          if (data) {
            // It works! Open the modal.
            showSellerVerificationModal(docId, data);
          }
        }
      });
      // --- End of new listener ---

    } catch (error) {
      console.error('Error loading seller verifications:', error);
      tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-red-600 text-center">Error loading data.</td></tr>';
    }
  }

  // --- MODIFIED: Create Seller Verification ROW ---
  function createSellerVerificationRow(docId, data) {
    // MODIFIED: Create a <tr> element
    const row = document.createElement('tr');
    row.className = 'border-b hover:bg-gray-50';

    // Format the date, or show N/A
    const submittedDate = data.submittedAt ? data.submittedAt.toDate().toLocaleDateString() : 'N/A';

    // MODIFIED: Use <td> table cell markup
    row.innerHTML = `
      <td class="p-4">${data.sellerPhone || 'N/A'}</td>
      <td class="p-4">${data.panelParams || 'N/A'}</td>
      <td class="p-4 text-sm text-gray-500">${submittedDate}</td>
      <td class="p-4">
        <button 
          class="view-details-btn bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full hover:bg-blue-200"
          data-doc-id="${docId}">
          View Details
        </button>
      </td>
    `;

    // CHANGE: The addEventListener was REMOVED from here

    return row;
  }

// --- Show Seller Verification Modal (UPDATED with hover effect) ---
  function showSellerVerificationModal(docId, data) {
    // Check if a modal already exists, if not, create it
    let modal = document.getElementById('sellerVerificationModal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sellerVerificationModal';
      modal.className = 'modal hidden fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4';
      
      modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl transform">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">Panel Details</h3>
            
            <button class="close-modal-btn mt-0 text-gray-400 text-2xl font-bold rounded-full h-8 w-8 flex items-center justify-center leading-none transition-colors hover:bg-gray-700 hover:text-white">
              &times;
            </button>

          </div>

          <div class="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <div>
              <p class="font-bold mb-2">Panel Image:</p>
              <img id="modal-panel-image" src="" alt="Panel Image" class="w-full h-64 object-cover rounded-md mb-4 bg-gray-100">
            </div>
            
            <div class="space-y-2 text-gray-700">
              <p><span class="font-bold">Panel Parameters:</span> <span id="modal-panel-params"></span></p>
              <p><span class="font-bold">Seller ID:</span> <span id="modal-seller-id"></span></p>
              <p><span class="font-bold">Seller Phone:</span> <span id="modal-seller-phone"></span></p>
              <p><span class="font-bold">Purchase Date:</span> <span id="modal-purchase-date"></span></p>
              <p><span class="font-bold">Purchased From:</span> <span id="modal-purchased-from"></span></p>
              <p><span class="font-bold">Status:</span> <span id="modal-status"></span></p>
            </div>
            
            <div class="mt-4" id="receipt-section">
              <p class="font-bold mb-2">Receipt:</p>
              <img id="modal-receipt-image" src="" alt="Receipt" class="w-full max-h-48 object-contain rounded-md bg-gray-100">
            </div>
          </div>
          
          <div class="p-4 bg-gray-50 border-t">
            <div id="pending-actions" class="flex justify-end items-center gap-3">
              <button class="close-modal-btn mt-0 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">
                Close
              </button>
              <button id="disapprove-btn" class="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
                Disapprove Listing
              </button>
              <button id="approve-btn" class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">
                Approve Listing
              </button>
            </div>
            
            <div id="approved-actions" class="flex justify-end items-center gap-3">
              <button class="close-modal-btn mt-0 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">
                Close
              </button>
              <button id="delist-btn" class="bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-700">
                De-list Panel
              </button>
              <button id="sold-btn" class="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700">
                Mark as Sold
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add close listeners ONCE (applies to all buttons with this class)
      modal.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        });
      });
      
      // Add backdrop click listener ONCE
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    }
    
    // --- Populate modal with data ---
    document.getElementById('modal-panel-image').src = data.panelImageURL || '';
    document.getElementById('modal-panel-params').textContent = data.panelParams || 'N/A';
    document.getElementById('modal-seller-id').textContent = data.sellerID || 'N/A';
    document.getElementById('modal-seller-phone').textContent = data.sellerPhone || 'N/A';
    document.getElementById('modal-purchase-date').textContent = data.purchaseDate || 'N/A';
    document.getElementById('modal-purchased-from').textContent = data.purchasedFrom || 'N/A';
    document.getElementById('modal-status').textContent = data.status || 'N/A';
    
    // Handle receipt image
    const receiptSection = document.getElementById('receipt-section');
    if (data.receiptImageURL) {
      document.getElementById('modal-receipt-image').src = data.receiptImageURL;
      receiptSection.classList.remove('hidden');
    } else {
      document.getElementById('modal-receipt-image').src = '';
      receiptSection.classList.add('hidden');
    }

    // --- NEW: Show the correct set of buttons based on status ---
    const pendingActions = document.getElementById('pending-actions');
    const approvedActions = document.getElementById('approved-actions');

    if (data.status === 'pending') {
      pendingActions.classList.remove('hidden');
      approvedActions.classList.add('hidden');
    } else if (data.status === 'approved') {
      approvedActions.classList.remove('hidden');
      pendingActions.classList.add('hidden');
    } else {
      pendingActions.classList.add('hidden');
      approvedActions.classList.add('hidden');
    }

    // --- Attach ALL button listeners ---
    
    // Pending actions
    document.getElementById('approve-btn').onclick = async () => {
      await approveSellerListing(docId, data);
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };
    
    document.getElementById('disapprove-btn').onclick = async () => {
      await disapproveSellerListing(docId);
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };

    // Approved actions
    document.getElementById('sold-btn').onclick = async () => {
      await markPanelAsSold(docId, data);
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };
    
    document.getElementById('delist-btn').onclick = async () => {
      await deListPanel(docId);
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };
    
    // --- Show modal ---
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  // --- Approve Seller Listing ---
  async function approveSellerListing(docId, data) {
    try {
      // Update sellQueries status to approved
      await db.collection('sellQueries').doc(docId).update({
        status: 'approved'
      });

      // Optional: Add to SoldSolar or marketplace collection
      // This depends on your business logic

      showConfirmation('Seller listing approved successfully!');
      loadPendingSellerVerifications(); // Reload the list
      loadMarketplacePanels(); // <-- ADD THIS LINE to reload the marketplace
    } catch (error) {
      console.error('Error approving listing:', error);
      showConfirmation('Error approving listing.');
    }
  }

  // --- Disapprove Seller Listing ---
  async function disapproveSellerListing(docId) {
    try {
      await db.collection('sellQueries').doc(docId).update({
        status: 'rejected'
      });

      showConfirmation('Seller listing disapproved.');
      loadPendingSellerVerifications(); // Reload the list
      loadMarketplacePanels(); // <-- ADD THIS LINE to reload the marketplace
    } catch (error) {
      console.error('Error disapproving listing:', error);
      showConfirmation('Error disapproving listing.');
    }
  }

  // --- NEW: Helper to fetch user data ---
  async function fetchUserInfo(userId) {
    if (!userId) return null;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  }

  // --- NEW: De-list a Panel ---
  // This will remove a panel from the marketplace
  async function deListPanel(docId) {
    try {
      await db.collection('sellQueries').doc(docId).update({
        status: 'rejected' // 'rejected' will hide it from all marketplaces
      });

      showConfirmation('Panel has been de-listed.');
      loadPendingSellerVerifications(); // Reload the list
      loadMarketplacePanels(); // Reload the marketplace
    } catch (error) {
      console.error('Error de-listing panel:', error);
      showConfirmation('Error de-listing panel.');
    }
  }

// --- UPDATED: Mark a Panel as Sold ---
  // This moves the data to SoldSolar and removes it from the marketplace
  async function markPanelAsSold(docId, panelData) {
    try {
      // 1. Get Seller Info from 'users' collection
      const sellerInfo = await fetchUserInfo(panelData.sellerID);

      // 2. Create the new SoldSolar document
      // NOTE: Using SoldSolar as requested.
      await db.collection('SoldSolar').add({
        panelInfo: panelData,
        sellerInfo: sellerInfo || { uid: panelData.sellerID, phone: panelData.sellerPhone },
        buyerInfo: {}, // No buyer info available from this button
        saleDate: firebase.firestore.FieldValue.serverTimestamp(),
        salePrice: null // No price available from this button
      });
      
      // 3. Update the original sellQuery status to 'sold'
      await db.collection('sellQueries').doc(docId).update({
        status: 'sold'
      });
      
      showConfirmation('Panel marked as sold and moved to SoldSolar.');
      loadMarketplacePanels(); // Reload the marketplace

    } catch (error) {
      console.error('Error marking as sold:', error);
      showConfirmation('Error marking panel as sold.');
    }
  }

  // --- Load Pending Buyer Queries from buyQueries ---
  async function loadPendingBuyerQueries() {
    // MODIFIED: Target the new tbody ID
    const tbody = document.getElementById('buyer-queries-tbody');
    if (!tbody) return;

    try {
      const snapshot = await db.collection('buyQueries')
        .where('status', '==', 'searching')
        .orderBy('submittedAt', 'desc')
        .get();

      tbody.innerHTML = ''; // Clear old rows

      if (snapshot.empty) {
        // MODIFIED: Show message in a table row
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-gray-600 text-center">No pending buyer queries.</td></tr>';
        return;
      }

      snapshot.forEach((doc) => {
        const data = doc.data();
        // MODIFIED: Create a <tr> element
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';

        const submittedDate = data.submittedAt ? data.submittedAt.toDate().toLocaleDateString() : 'N/A';

        // MODIFIED: Use <td> table cell markup
        row.innerHTML = `
          <td class="p-4">${data.buyerPhone || 'N/A'}</td>
          <td class="p-4">${data.requiredWattage || 'N/A'}W / ₹${data.budget || 'N/A'}</td>
          <td class="p-4 text-sm text-gray-500">${submittedDate}</td>
          <td class="p-4">
            <button class="view-details-btn bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full hover:bg-green-200">
              View
            </button>
          </td>
        `;

        // MODIFIED: Add a click listener to open a dynamic modal
        row.querySelector('.view-details-btn').addEventListener('click', () => {
          showBuyerQueryModal(doc.id, data);
        });

        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Error loading buyer queries:', error);
      tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-red-600 text-center">Error loading data.</td></tr>';
    }
  }

  // --- NEW: Create Marketplace Card ---
  function createMarketplaceCard(docId, data) {
    const card = document.createElement('div');
    card.className = "bg-white rounded-lg overflow-hidden shadow-md border flex flex-col";

    // --- Tag Logic ---
    let tagHtml = '';
    if (data.status === 'approved') {
      tagHtml = `<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Expert Verified</span>`;
    } else if (data.status === 'pending') {
      card.style.opacity = '0.65'; // Make pending items faded
      tagHtml = `<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending Verification</span>`;
    }
    // --- End Tag Logic ---

    // --- Age Logic ---
    let ageText = '';
    if (data.purchaseDate) {
      try {
        const purchaseYear = new Date(data.purchaseDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - purchaseYear;
        if (age === 0) ageText = "(< 1 year old)";
        else if (age === 1) ageText = "(1 year old)";
        else ageText = `(${age} years old)`;
      } catch (e) { /* ignore date error */ }
    }
    // --- End Age Logic ---

    card.innerHTML = `
    <img
      src="${data.panelImageURL || 'https://via.placeholder.com/400x300.png?text=No+Image'}"
      class="w-full h-48 object-cover bg-gray-100" alt="Solar Panel">
    <div class="p-4 flex-1 flex flex-col">
      ${tagHtml}
      <h3 class="font-bold mt-2 text-lg text-gray-800">${data.panelParams || 'N/A'}</h3>
      <p class="text-gray-600 text-sm">Condition: ${ageText}</p>
      <div class="mt-4 flex-1 flex items-end">
        <button data-doc-id="${docId}"
          class="view-marketplace-btn w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  `;
    return card;
  }

// --- UPDATED: Show Buyer Query Modal (with hover effect) ---
  function showBuyerQueryModal(docId, data) {
    // Check if a modal already exists, if not, create it
    let modal = document.getElementById('buyerQueryModal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'buyerQueryModal';
      modal.className = 'modal hidden fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4';
      
      modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-lg transform">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">Buyer Inquiry Details</h3>

            <button class="close-modal-btn mt-0 text-gray-400 text-2xl font-bold rounded-full h-8 w-8 flex items-center justify-center leading-none transition-colors hover:bg-gray-700 hover:text-white">
              &times;
            </button>

          </div>
          <div class="p-6 space-y-3">
            <h4 class="font-semibold text-lg border-b pb-2">Buyer Information</h4>
            <p><strong>Buyer ID:</strong> <span id="modal-buyer-id"></span></p>
            <p><strong>Phone:</strong> <span id="modal-buyer-phone"></span></p>
            <hr>
            <h4 class="font-semibold text-lg pt-2">Requirements</h4>
            <p><strong>Required Wattage:</strong> <span id="modal-buyer-wattage"></span> W</p>
            <p><strong>Budget:</strong> ₹<span id="modal-buyer-budget"></span></p>
            <p><strong>Preference:</strong> <span id="modal-buyer-preference"></span></p>
          </div>
          <div class="flex justify-end items-center p-4 bg-gray-50 border-t gap-3">
            <button class="close-modal-btn mt-0 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Close</button>
            <button id="assign-seller-btn" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
              Assign Seller
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add close listeners ONCE when modal is created
      modal.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        });
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    }
    
    // Populate modal with specific data for THIS row
    document.getElementById('modal-buyer-id').textContent = data.buyerID || 'N/A';
    document.getElementById('modal-buyer-phone').textContent = data.buyerPhone || 'N/A';
    document.getElementById('modal-buyer-wattage').textContent = data.requiredWattage || 'N/A';
    document.getElementById('modal-buyer-budget').textContent = data.budget || 'N/A';
    document.getElementById('modal-buyer-preference').textContent = data.preference || 'N/A';

    // --- NEW: Add .onclick listener for the "Assign" button ---
    document.getElementById('assign-seller-btn').onclick = () => {
      // Pass the buyer's query ID and data to the new modal
      showAssignSellerModal(docId, data);
      modal.classList.add('hidden'); // Hide this modal
      modal.classList.remove('flex');
    };
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  // --- Load Marketplace Panels (UPDATED to show 8 by default) ---
  async function loadMarketplacePanels() {
    const container = document.getElementById('marketplace-grid');
    if (!container) return;

    const panelDataMap = new Map();
    let itemCounter = 0; // <-- Counter
    let toggleBtn = null; // <-- Button reference

    try {
      const snapshot = await db.collection('sellQueries')
        .where('status', 'in', ['pending', 'approved'])
        .orderBy('submittedAt', 'desc')
        .get();

      container.innerHTML = ''; // Clear all static/old cards

      if (snapshot.empty) {
        container.innerHTML = '<p class="text-gray-600 col-span-full">No panels in the marketplace yet.</p>';
        return;
      }

      snapshot.forEach((doc) => {
        itemCounter++; // <-- Increment counter
        const data = doc.data();
        panelDataMap.set(doc.id, data);
        const card = createMarketplaceCard(doc.id, data);

        // --- NEW: Logic to hide extra items ---
        if (itemCounter > 8) { // <-- CHANGED FROM 6
          card.classList.add('hidden', 'admin-marketplace-extra');
        }
        // --- End new logic ---

        container.appendChild(card);
      });

      // --- NEW: Add the "Show More" button if needed ---
      if (itemCounter > 8) { // <-- CHANGED FROM 6
        toggleBtn = document.createElement('button');
        toggleBtn.textContent = `Show More (${itemCounter - 8})`; // <-- CHANGED FROM 6
        toggleBtn.className = 'w-full bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors mt-4 col-span-full';
        toggleBtn.dataset.state = 'more';

        container.appendChild(toggleBtn);

        // Add click listener for the new button
        toggleBtn.addEventListener('click', () => {
          const extraItems = container.querySelectorAll('.admin-marketplace-extra');

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
      // --- End new button logic ---


      // --- Event Listener for new buttons (This is the same as before) ---
      container.addEventListener('click', (e) => {
        const button = e.target.closest('.view-marketplace-btn');
        if (button) {
          const docId = button.dataset.docId;
          const data = panelDataMap.get(docId);
          if (data) {
            showSellerVerificationModal(docId, data);
          }
        }
      });

    } catch (error) {
      console.error("Error loading marketplace panels:", error);
      container.innerHTML = '<p class="text-red-600 col-span-full">Error loading marketplace data.</p>';
    }
  }

  // --- Show Confirmation Message ---
  function showConfirmation(message) {
    if (!confirmationMessage) return;

    confirmationMessage.textContent = message;
    confirmationMessage.classList.remove('hidden', 'translate-x-full');
    confirmationMessage.classList.add('translate-x-0');

    setTimeout(() => {
      confirmationMessage.classList.remove('translate-x-0');
      confirmationMessage.classList.add('translate-x-full');
      setTimeout(() => {
        confirmationMessage.classList.add('hidden');
      }, 300);
    }, 3000);
  }

// --- NEW: Function to open the "Assign Seller" modal (UPDATED with hover effect) ---
  function showAssignSellerModal(buyerDocId, buyerData) {
    // 1. Create the modal if it doesn't exist
    let modal = document.getElementById('assignSellerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'assignSellerModal';
      modal.className = 'modal hidden fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4';
      
      modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-3xl transform">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">Assign Seller to Buyer</h3>

            <button class="close-modal-btn mt-0 text-gray-400 text-2xl font-bold rounded-full h-8 w-8 flex items-center justify-center leading-none transition-colors hover:bg-gray-700 hover:text-white">
              &times;
            </button>

          </div>
          <div class="p-6 max-h-[70vh] overflow-y-auto">
            <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 class="font-bold text-blue-800">Buyer's Request:</h4>
              <p><strong>Wattage:</strong> ${buyerData.requiredWattage}W</p>
              <p><strong>Budget:</strong> ₹${buyerData.budget}</p>
              <p><strong>Phone:</strong> ${buyerData.buyerPhone}</p>
            </div>
            <h4 class="font-bold text-gray-800 mb-2">Select an Available Panel to Assign:</h4>
            <div id="available-panels-list" class="space-y-3">
              <p>Loading available panels...</p>
            </div>
          </div>
          <div class="flex justify-end items-center p-4 bg-gray-50 border-t gap-3">
            <button class="close-modal-btn mt-0 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Add close listeners ONCE
      modal.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        });
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    }

    // 2. Show the modal and load the panels
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    loadAvailablePanels(buyerDocId, buyerData); // Call the next function
  }

  // --- NEW: Function to load available panels into the "Assign" modal ---
  async function loadAvailablePanels(buyerDocId, buyerData) {
    const container = document.getElementById('available-panels-list');
    if (!container) return;

    // This map will store the data for each seller panel
    const sellerPanelMap = new Map();

    try {
      // Find panels that are 'approved' and meet the buyer's wattage request
      const snapshot = await db.collection('sellQueries')
        .where('status', '==', 'approved')
        // Optional: Filter by wattage. Remove this line if you want to see all panels.
        // .where('panelParams', '>=', buyerData.requiredWattage + 'W') 
        .get();
      
      container.innerHTML = ''; // Clear "Loading..."

      if (snapshot.empty) {
        container.innerHTML = '<p class="text-gray-600">No approved panels match this request.</p>';
        return;
      }

      snapshot.forEach(doc => {
        const sellerData = doc.data();
        const sellerDocId = doc.id;
        sellerPanelMap.set(sellerDocId, sellerData); // Store data

        const card = document.createElement('div');
        card.className = 'p-3 bg-white border rounded-lg flex justify-between items-center';
        card.innerHTML = `
          <div>
            <p class="font-bold">${sellerData.panelParams}</p>
            <p class="text-sm text-gray-600">Seller Phone: ${sellerData.sellerPhone}</p>
          </div>
          <button class="assign-confirm-btn bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700" data-seller-id="${sellerDocId}">
            Assign
          </button>
        `;
        container.appendChild(card);
      });

      // Add one listener to the container (Event Delegation)
      container.addEventListener('click', async (e) => {
        const button = e.target.closest('.assign-confirm-btn');
        if (button) {
          if (!confirm("Are you sure you want to assign this panel? This will complete the sale.")) {
            return;
          }
          
          const sellerDocId = button.dataset.sellerId;
          const sellerData = sellerPanelMap.get(sellerDocId);
          
          if (sellerData) {
            await confirmAssignment(buyerDocId, buyerData, sellerDocId, sellerData);
          }
        }
      });

    } catch (error) {
      console.error("Error loading available panels:", error);
      container.innerHTML = '<p class="text-red-600">Error loading panels.</p>';
    }
  }

  // --- NEW: Function to finalize the assignment and save to SoldSolar ---
  async function confirmAssignment(buyerDocId, buyerData, sellerDocId, sellerData) {
    try {
      // 1. Get full buyer and seller user info
      const buyerInfo = await fetchUserInfo(buyerData.buyerID);
      const sellerInfo = await fetchUserInfo(sellerData.sellerID);

      // 2. Create the SoldSolar document
      await db.collection('SoldSolar').add({
        panelInfo: sellerData,
        sellerInfo: sellerInfo || { uid: sellerData.sellerID, phone: sellerData.sellerPhone },
        buyerInfo: {
          ...buyerInfo,
          uid: buyerData.buyerID,
          phone: buyerData.buyerPhone,
          requirements: {
            budget: buyerData.budget,
            preference: buyerData.preference,
            wattage: buyerData.requiredWattage
          }
        },
        saleDate: firebase.firestore.FieldValue.serverTimestamp(),
        salePrice: null // You can add a field for this in the modal later
      });

      // 3. Update the buyerQuery status to 'completed'
      await db.collection('buyQueries').doc(buyerDocId).update({
        status: 'completed'
      });

      // 4. Update the sellQuery status to 'sold'
      await db.collection('sellQueries').doc(sellerDocId).update({
        status: 'sold'
      });

      // 5. Success!
      showConfirmation('Sale completed and saved to SoldSolar!');
      document.getElementById('assignSellerModal')?.classList.add('hidden'); // Close modal
      
      // Reload all lists
      loadPendingBuyerQueries();
      loadMarketplacePanels();

    } catch (error) {
      console.error("Error confirming assignment:", error);
      alert("Error confirming assignment. Please try again.");
    }
  }
});
