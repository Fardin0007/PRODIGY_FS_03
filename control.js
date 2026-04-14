import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtb3DLnCKrvNyZ9L7T5UJ2OxknebLUJ_8",
  authDomain: "fresh-d0524.firebaseapp.com",
  databaseURL: "https://fresh-d0524-default-rtdb.firebaseio.com",
  projectId: "fresh-d0524"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Admin Credentials
const ADMIN_CREDENTIALS = {
    username: 'sufedaveg',
    password: 'sufeda@786'
};

// State
let isAuthenticated = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (isAuthenticated) {
        showDashboard();
    } else {
        showLogin();
    }
    initializeEventListeners();
});

// Authentication
function checkAuth() {
    const auth = localStorage.getItem('adminAuth');
    isAuthenticated = auth === 'true';
}

function showLogin() {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
}

function login(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminAuth', 'true');
        isAuthenticated = true;
        showDashboard();
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('adminAuth');
    isAuthenticated = false;
    showLogin();
    document.getElementById('loginForm').reset();
}

// Event Listeners
function initializeEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;

            if (login(username, password)) {
                showNotification('Login successful!', 'success');
            } else {
                showNotification('Invalid credentials!', 'error');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateProduct() {
  const id = document.getElementById("id").value;
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;

  set(ref(db, 'products/' + id), {
    name: name,
    price: price
  });

  alert("Updated in Firebase!");
}

window.updateProduct = updateProduct;
