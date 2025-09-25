// Simple admin login logic for static frontend
// Username: adminuser | Password: solar@2025

document.addEventListener('DOMContentLoaded', function () {
  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const loginForm = document.getElementById('admin-login-form');
  const errorMsg = document.getElementById('admin-login-error');

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    if (username === 'adminuser' && password === 'solar@2025') {
      loginSection.classList.add('hidden');
      dashboardSection.classList.remove('hidden');
    } else {
      errorMsg.classList.remove('hidden');
    }
  });
});
