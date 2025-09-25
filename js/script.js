document.addEventListener('DOMContentLoaded', function () {
  let userAction = null;
  let isLoggedIn = false;
  let userPhone = null;

  // Restore login state from localStorage
  if (localStorage.getItem('isLoggedIn') === 'true') {
    isLoggedIn = true;
    userPhone = localStorage.getItem('userPhone') || null;
  }

  const header = document.getElementById('header');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinksMobile = document.querySelectorAll('.nav-link-mobile');

  const modals = document.querySelectorAll('.modal-backdrop');
  const buyOrSellModal = document.getElementById('buyOrSellModal');
  const authModal = document.getElementById('authModal');
  const sellPanelModal = document.getElementById('sellPanelModal');
  const buyRequestModal = document.getElementById('buyRequestModal');

  // === NEW: Reference to the new modal ===
  const productDetailModal = document.getElementById('productDetailModal');

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

  const showModal = (modal) => modal.classList.add('active');
  const hideModal = (modal) => modal.classList.remove('active');

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

  loginSignupBtn.addEventListener('click', () => {
    showModal(authModal);
    loginTabBtn.click();
  });

  const proceedToForm = () => {
    if (userAction === 'buy') {
      showModal(buyRequestModal);
    } else if (userAction === 'sell') {
      showModal(sellPanelModal);
    }
  };

  buyBtn.addEventListener('click', () => {
    userAction = 'buy';
    hideModal(buyOrSellModal);
    if (isLoggedIn) {
      proceedToForm();
    } else {
      showModal(authModal);
      loginTabBtn.click();
    }
  });
  sellBtn.addEventListener('click', () => {
    userAction = 'sell';
    hideModal(buyOrSellModal);
    if (isLoggedIn) {
      proceedToForm();
    } else {
      showModal(authModal);
      loginTabBtn.click();
    }
  });

  loginTabBtn.addEventListener('click', () => {
    loginTabBtn.classList.add('active');
    signupTabBtn.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  signupTabBtn.addEventListener('click', () => {
    signupTabBtn.classList.add('active');
    loginTabBtn.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });


  const handleAuthSuccess = (phone) => {
    isLoggedIn = true;
    userPhone = phone;
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userPhone', phone);
    hideModal(authModal);
    proceedToForm();
  };

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('login-phone').value;
    handleAuthSuccess(phone);
  });
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('signup-phone').value;
    handleAuthSuccess(phone);
  });

  sellForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sellForm.classList.add('hidden');
    sellSuccessDiv.classList.remove('hidden');
  });

  buyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    buyForm.classList.add('hidden');
    if (Math.random() > 0.5) {
      buyResultFound.classList.remove('hidden');
    } else {
      buyResultNotFound.classList.remove('hidden');
    }
  });

  // === UPDATED: LOGIC FOR PRODUCT DETAIL MODAL (Single Section) ===
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
  // === END OF UPDATED LOGIC ===


  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('close-modal-btn')) {
        hideModal(modal);
        // Reset forms on close
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