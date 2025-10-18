document.addEventListener('DOMContentLoaded', function () {
  const adminLoginSection = document.getElementById('admin-login-section');
  const adminDashboardSection = document.getElementById('admin-dashboard-section');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginError = document.getElementById('admin-login-error');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const confirmationMessage = document.getElementById('confirmation-message');

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
        console.log('Logged in as:', userCredential.user.email);
      })
      .catch((error) => {
        adminLoginError.classList.remove('hidden');
        console.error('Login error:', error);
      });
  });
  logoutBtn?.addEventListener('click', () => {
    firebase.auth().signOut().catch(console.error);
  });

  firebase.auth().onAuthStateChanged(user => {
  if (user) {
    adminLoginSection.classList.add('hidden');
    adminDashboardSection.classList.remove('hidden');
    adminLoginError.classList.add('hidden');
  } else {
    adminDashboardSection.classList.add('hidden');
    adminLoginSection.classList.remove('hidden');

    // Clear email and password fields on logout
    adminLoginForm.email.value = '';
    adminLoginForm.password.value = '';
  }
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

// Show confirmation message function
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
  });
});
});
// Note: Ensure your backend server (e.g., Express with Firebase Admin SDK) is set up to handle the API requests made in adminAction function.
// Example backend setup (not included in this file):
// const express = require('express');
// const admin = require('firebase-admin');
// const app = express();
// app.use(express.json());
// app.post('/api/admin/panels/:id/:action', async (req, res) => {
//   const { id, action } = req.params;
//   try {
//     // Perform the action using Firebase Admin SDK
//     await admin.firestore().collection('panels').doc(id).update({ status: action });
//     res.json({ message: 'Action successful.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error performing action.' });
//   }
// });