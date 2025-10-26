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

// --- Show Seller Verification Modal (UPDATED) ---
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
            <h3 class="text-xl font-bold">Seller Verification Details</h3>
            <button class="close-modal-btn text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
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
          
          <div class="flex justify-end items-center p-4 bg-gray-50 border-t gap-3">
            <button class="close-modal-btn bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">
              Close
            </button>
            <button id="disapprove-btn" class="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
              Disapprove Listing
            </button>
            <button id="approve-btn" class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">
              Approve Listing
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add close listeners ONCE when modal is created
      // This will work for both the &times; and the 'Close' button
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
    
    // --- Populate modal with data (from original file) ---
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
    
    // --- Attach approve/disapprove listeners ---
    // We use .onclick here because it re-assigns the listener every time,
    // ensuring the buttons are always linked to the correct (docId, data).
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
    } catch (error) {
      console.error('Error disapproving listing:', error);
      showConfirmation('Error disapproving listing.');
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

  // --- NEW: Show Buyer Query Modal ---
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
            <button class="close-modal-btn text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
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
          <div class="flex justify-end items-center p-4 bg-gray-50 border-t rounded-b-lg">
            <button class="close-modal-btn bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Close</button>
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
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  // --- Load Marketplace Panels (if you have a marketplace collection) ---
  async function loadMarketplacePanels() {
    // Implement if you have a separate marketplace collection
    // For now, this can show approved sellQueries
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
});
