document.addEventListener('DOMContentLoaded', function() {
  const adminLoginSection = document.getElementById('admin-login-section');
  const adminDashboardSection = document.getElementById('admin-dashboard-section');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginError = document.getElementById('admin-login-error');

  // Admin Login Logic
  adminLoginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    // Simple validation (replace with actual auth)
    if (username === 'adminuser' && password === 'solar@2025') {
      adminLoginSection.classList.add('hidden');
      adminDashboardSection.classList.remove('hidden');
    } else {
      adminLoginError.classList.remove('hidden');
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
    });
  });
});
