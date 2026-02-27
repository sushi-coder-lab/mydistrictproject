const API_URL = 'https://mydistrictproject-5.onrender.com/api';

const loginForm = document.getElementById('login-form');
const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            loginSection.style.display = 'none';
            adminDashboard.style.display = 'block';
            logoutBtn.style.display = 'block';

            // Store session (optional for now, using UI state)
            localStorage.setItem('adminLoggedIn', 'true');
        } else {
            loginError.style.display = 'block';
            loginError.textContent = data.message || 'Invalid credentials';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.style.display = 'block';
        loginError.textContent = 'Server connection failed';
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    location.reload();
});

// Check if already logged in
if (localStorage.getItem('adminLoggedIn') === 'true') {
    loginSection.style.display = 'none';
    adminDashboard.style.display = 'block';
    logoutBtn.style.display = 'block';
}
