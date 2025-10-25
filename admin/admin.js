document.addEventListener('DOMContentLoaded', function () {
  const adminLoginSection = document.getElementById('admin-login-section');
  const adminDashboardSection = document.getElementById('admin-dashboard-section');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginError = document.getElementById('admin-login-error');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const confirmationMessage = document.getElementById('confirmation-message');

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

  // --- Load Pending Seller Verifications from sellQueries ---
  async function loadPendingSellerVerifications() {
    const container = document.getElementById('pending-seller-verifications');
    if (!container) return;

    try {
      const snapshot = await db.collection('sellQueries')
        .where('status', '==', 'pending')
        .orderBy('submittedAt', 'desc')
        .get();

      container.innerHTML = '';

      if (snapshot.empty) {
        container.innerHTML = '<p class="text-gray-600">No pending seller verifications.</p>';
        return;
      }

      snapshot.forEach((doc) => {
        const data = doc.data();
        const card = createSellerVerificationCard(doc.id, data);
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading seller verifications:', error);
      container.innerHTML = '<p class="text-red-600">Error loading data.</p>';
    }
  }

  // --- Create Seller Verification Card ---
  function createSellerVerificationCard(docId, data) {
    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-lg shadow-md border border-gray-200';
    
    card.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <div>
          <h4 class="font-bold text-gray-800">${data.panelParams || 'N/A'}</h4>
          <p class="text-sm text-gray-600">Seller ID: ${data.sellerID}</p>
          <p class="text-sm text-gray-600">Phone: ${data.sellerPhone}</p>
          <p class="text-sm text-gray-600">Purchase Date: ${data.purchaseDate || 'N/A'}</p>
          <p class="text-sm text-gray-600">Purchased From: ${data.purchasedFrom || 'N/A'}</p>
        </div>
        <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          ${data.status}
        </span>
      </div>
      <button 
        class="view-details-btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-2"
        data-doc-id="${docId}">
        View Details
      </button>
    `;

    // Add click listener to view details button
    card.querySelector('.view-details-btn').addEventListener('click', () => {
      showSellerVerificationModal(docId, data);
    });

    return card;
  }

  // --- Show Seller Verification Modal (Similar to Landing Page) ---
  function showSellerVerificationModal(docId, data) {
    // Create modal dynamically or use existing one
    let modal = document.getElementById('sellerVerificationModal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sellerVerificationModal';
      modal.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4';
      
      modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
          <div class="p-6 max-h-96 overflow-y-auto relative">
            <button class="close-modal-btn absolute top-4 right-4 text-2xl font-bold text-gray-600 hover:text-black">&times;</button>
            
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Seller Verification Details</h3>
            
            <div class="mb-4">
              <img id="modal-panel-image" src="" alt="Panel Image" class="w-full h-64 object-cover rounded-md mb-4">
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
              <img id="modal-receipt-image" src="" alt="Receipt" class="w-full max-h-48 object-contain rounded-md">
            </div>
          </div>
          
          <div class="flex justify-end items-center p-4 bg-gray-50 border-t gap-3">
            <button id="disapprove-btn" class="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700">
              Disapprove Listing
            </button>
            <button id="approve-btn" class="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700">
              Approve Listing
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close button
      modal.querySelector('.close-modal-btn').addEventListener('click', () => {
        modal.classList.add('hidden');
      });
      
      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    }
    
    // Populate modal with data
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
      receiptSection.classList.add('hidden');
    }
    
    // Approve button
    document.getElementById('approve-btn').onclick = async () => {
      await approveSellerListing(docId, data);
      modal.classList.add('hidden');
    };
    
    // Disapprove button
    document.getElementById('disapprove-btn').onclick = async () => {
      await disapproveSellerListing(docId);
      modal.classList.add('hidden');
    };
    
    modal.classList.remove('hidden');
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
    const container = document.getElementById('pending-buyer-queries');
    if (!container) return;

    try {
      const snapshot = await db.collection('buyQueries')
        .where('status', '==', 'searching')
        .orderBy('submittedAt', 'desc')
        .get();

      container.innerHTML = '';

      if (snapshot.empty) {
        container.innerHTML = '<p class="text-gray-600">No pending buyer queries.</p>';
        return;
      }

      snapshot.forEach((doc) => {
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg shadow-md border border-gray-200';
        
        card.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-600">Buyer ID: ${data.buyerID}</p>
              <p class="text-sm text-gray-600">Phone: ${data.buyerPhone}</p>
              <p class="text-sm text-gray-600">Wattage: ${data.requiredWattage}W</p>
              <p class="text-sm text-gray-600">Budget: ₹${data.budget}</p>
              <p class="text-sm text-gray-600">Preference: ${data.preference || 'None'}</p>
            </div>
            <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              ${data.status}
            </span>
          </div>
        `;
        
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading buyer queries:', error);
      container.innerHTML = '<p class="text-red-600">Error loading data.</p>';
    }
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
