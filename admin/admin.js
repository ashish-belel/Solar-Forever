<<<<<<< Updated upstream
document.addEventListener('DOMContentLoaded', function() {
=======
// Firebase JS SDK initialization (add at very top of admin.js)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFazdEmqatvQaFgrEiC7btxohKXbkGOyw",
  authDomain: "solar-forever.firebaseapp.com",
  databaseURL: "https://solar-forever-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "solar-forever",
  storageBucket: "solar-forever.firebasestorage.app",
  messagingSenderId: "15804210993",
  appId: "1:15804210993:web:50a812c621a7cc1eb69a10",
  measurementId: "G-4X8N9FQY64"
};

// IF USING CDN SCRIPTS in index.html:
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js"></script>
firebase.initializeApp(firebaseConfig);
// For realtime database:
const database = firebase.database();
// For Firestore:
// const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function () {
>>>>>>> Stashed changes
  const adminLoginSection = document.getElementById('admin-login-section');
  const adminDashboardSection = document.getElementById('admin-dashboard-section');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginError = document.getElementById('admin-login-error');

  // Admin Login
  adminLoginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    /*    // Simple validation (replace with actual auth)
        if (email === 'adminuser@gmail.com' && password === 'solar@2025') {
          adminLoginSection.classList.add('hidden');
          adminDashboardSection.classList.remove('hidden');
        } else {
          adminLoginError.classList.remove('hidden');
        }
      });
    */
    // Firebase Email/Password Auth
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        adminLoginSection.classList.add('hidden');
        adminDashboardSection.classList.remove('hidden');
      })
      .catch((error) => {
        adminLoginError.classList.remove('hidden');
        // Optionally, display error.message for debugging
      });
  });
  // Modal Logic
  const openModalButtons = document.querySelectorAll('[data-modal-target]');
  const closeModalButtons = document.querySelectorAll('[data-modal-close]');

  openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = document.getElementById(button.dataset.modalTarget);
      modal.classList.remove('hidden');
    });
  });

  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = document.getElementById(button.dataset.modalClose);
      modal.classList.add('hidden');
      // If it's an action button, show confirmation
      if(button.classList.contains('action-btn')) {
         let message = 'Action confirmed.';
         if (button.textContent.includes('Approve')) message = 'Listing Approved!';
         if (button.textContent.includes('Disapprove')) message = 'Listing Disapproved.';
         showConfirmation(message);
      }
    });
  });

  // Close modal by clicking on the background overlay
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
  });

  // Confirmation Message Logic
  const confirmationMessage = document.getElementById('confirmation-message');
  const marketplaceActionButtons = document.querySelectorAll('#marketplace-management .action-btn');

  function showConfirmation(message) {
    confirmationMessage.textContent = message;
    confirmationMessage.classList.remove('hidden', 'translate-x-full');
    confirmationMessage.classList.add('translate-x-0');

    setTimeout(() => {
      confirmationMessage.classList.remove('translate-x-0');
      confirmationMessage.classList.add('translate-x-full');
      setTimeout(() => {
        confirmationMessage.classList.add('hidden');
      }, 300); // Wait for transition to finish
    }, 3000); // Message visible for 3 seconds
  }

<<<<<<< Updated upstream
  marketplaceActionButtons.forEach(button => {
    button.addEventListener('click', () => {
        let message = 'Panel status updated.';
        if(button.textContent.includes('Sold')) message = 'Panel marked as sold.';
        if(button.textContent.includes('De-list')) message = 'Panel has been de-listed.';
        showConfirmation(message);
    });
  });

  // Add confirmation for Mark as Sold and De-list in modals
  document.querySelectorAll('.modal .action-btn').forEach(button => {
    button.addEventListener('click', function() {
      let message = '';
      if (button.textContent.includes('Sold')) message = 'Panel marked as sold.';
      if (button.textContent.includes('De-list')) message = 'Panel has been de-listed.';
      if (message) showConfirmation(message);
=======
  // Backend API call to update panel status
  async function adminAction(panelId, actionType) {
    const endpointMap = {
      approve: `/api/admin/panels/${panelId}/approve`,
      disapprove: `/api/admin/panels/${panelId}/disapprove`,
      sold: `/api/admin/panels/${panelId}/sold`,
      delist: `/api/admin/panels/${panelId}/delist`
    };
    const url = endpointMap[actionType];
    if (!url) {
      showConfirmation('Unknown action.');
      return;
    }
    try {
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      showConfirmation(data.message || 'Action completed.');
    } catch (error) {
      showConfirmation('Error performing action.');
      console.error(error);
    }
  }

  // Listen for admin action button clicks inside modals
  document.querySelectorAll('.modal .action-btn').forEach(button => {
    button.addEventListener('click', function () {
      const panelId = button.getAttribute('data-panel-id');
      const actionType = button.getAttribute('data-action');
      if (panelId && actionType) {
        adminAction(panelId, actionType);
      }
    });
  });

  // Also update confirmation for marketplace management buttons (if needed)
  const marketplaceActionButtons = document.querySelectorAll('#marketplace-management .action-btn');
  marketplaceActionButtons.forEach(button => {
    button.addEventListener('click', () => {
      let message = 'Panel status updated.';
      if (button.textContent.includes('Sold')) message = 'Panel marked as sold.';
      if (button.textContent.includes('De-list')) message = 'Panel has been de-listed.';
      showConfirmation(message);
>>>>>>> Stashed changes
    });
  });
});
