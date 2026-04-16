import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, update, remove, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtb3DLnCKrvNyZ9L7T5UJ2OxknebLUJ_8",
  authDomain: "eco-veg-ee446.firebaseapp.com",
  databaseURL: "https://eco-veg-ee446-default-rtdb.firebaseio.com",
  projectId: "eco-veg-ee446",
  storageBucket: "eco-veg-ee446.appspot.com",
  messagingSenderId: "35768832339",
  appId: "1:35768832339:web:150fa825f7bf2c32f551a6",
  measurementId: "G-22L2Q5362L"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const productsRef = ref(db, 'products');

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

let isAuthenticated = false;
let products = [];
let selectedProductId = null;
let currentImageUrl = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (isAuthenticated) {
        showDashboard();
        initializeAdminDashboard();
    } else {
        showLogin();
    }
    initializeEventListeners();
});

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
        initializeAdminDashboard();
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

function initializeAdminDashboard() {
    loadAdminProducts();
    loadAdminOrders();
    setupDashboardListeners();
}

function setupDashboardListeners() {
    const addProductBtn = document.getElementById('addProductBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const productEditForm = document.getElementById('productEditForm');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const closeProductModalBtn = document.getElementById('closeProductModal');
    const productImageInput = document.getElementById('productImageInput');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const tabButtons = document.querySelectorAll('.tab-btn');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', openAddProductModal);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadAdminProducts);
    }

    if (productEditForm) {
        productEditForm.addEventListener('submit', handleProductFormSubmit);
    }

    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', closeProductModal);
    }

    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', closeProductModal);
    }

    if (productImageInput) {
        productImageInput.addEventListener('change', handleProductImageChange);
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', removeCurrentImage);
    }

    if (tabButtons.length) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                activateTab(targetTab);
            });
        });
    }
}

function activateTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    tabContents.forEach(content => {
        const isActive = content.id === `${tabName}Tab`;
        content.classList.toggle('active', isActive);
        content.style.display = isActive ? 'block' : 'none';
    });
}

function loadAdminProducts() {
    get(productsRef)
        .then((snapshot) => {
            const data = snapshot.val();
            products = convertProductsSnapshot(data);
            renderAdminProducts();
        })
        .catch((error) => {
            console.error('Firebase fetch products error:', error);
            showNotification('Unable to load products from Firebase.', 'error');
        });
}

function convertProductsSnapshot(data) {
    if (!data) return [];
    if (Array.isArray(data)) {
        return data.filter(Boolean).map((product, index) => ({ id: index + 1, ...product }));
    }
    return Object.keys(data).map((key) => ({ id: Number(key), ...data[key] }));
}

function renderAdminProducts() {
    const grid = document.getElementById('productsManagementGrid');
    if (!grid) return;

    grid.innerHTML = '';
    if (products.length === 0) {
        grid.innerHTML = '<p style="color:#666; padding: 2rem; text-align:center;">No products found in Firebase yet.</p>';
        return;
    }

    products.sort((a, b) => a.id - b.id).forEach((product) => {
        const card = document.createElement('div');
        card.className = 'product-management-card';
        card.innerHTML = `
            <div class="product-card-header">
                <div>
                    <h4>${product.name}</h4>
                    <p class="product-id">ID: ${product.id}</p>
                </div>
                <div class="product-actions">
                    <button class="btn-secondary" onclick="window.editProduct(${product.id})">Edit</button>
                    <button class="btn-danger" onclick="window.deleteProduct(${product.id})">Delete</button>
                </div>
            </div>
            <p>${product.description || 'No description available.'}</p>
            <div class="product-management-footer">
                <span>Category: ${product.category || 'N/A'}</span>
                <strong>₹${product.price}/kg</strong>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.editProduct = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    selectedProductId = productId;
    currentImageUrl = product.imageUrl || null;
    document.getElementById('productModalTitle').textContent = `Edit Product #${productId}`;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productCategory').value = product.category || 'leafy';

    const imagePreview = document.getElementById('currentImagePreview');
    const currentEmoji = document.getElementById('currentEmoji');
    const removeImageBtn = document.getElementById('removeImageBtn');

    if (currentImageUrl) {
        imagePreview.src = currentImageUrl;
        imagePreview.style.display = 'block';
        currentEmoji.style.display = 'none';
        removeImageBtn.style.display = 'inline-block';
    } else {
        imagePreview.style.display = 'none';
        currentEmoji.style.display = 'block';
        currentEmoji.textContent = product.image || '🥬';
        removeImageBtn.style.display = 'none';
    }

    document.getElementById('productEditModal').classList.add('active');
};

window.deleteProduct = function(productId) {
    if (!confirm('Delete this product from Firebase?')) return;
    remove(ref(db, `products/${productId}`))
        .then(() => {
            showNotification('Product deleted successfully.', 'success');
            loadAdminProducts();
        })
        .catch((error) => {
            console.error('Delete product error:', error);
            showNotification('Unable to delete product.', 'error');
        });
};

function openAddProductModal() {
    selectedProductId = null;
    currentImageUrl = null;
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = 'leafy';
    document.getElementById('productImageInput').value = '';
    document.getElementById('currentImagePreview').style.display = 'none';
    document.getElementById('currentEmoji').style.display = 'block';
    document.getElementById('currentEmoji').textContent = '🥬';
    document.getElementById('removeImageBtn').style.display = 'none';
    document.getElementById('productEditModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productEditModal').classList.remove('active');
}

function handleProductImageChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageUrl = e.target.result;
        const preview = document.getElementById('currentImagePreview');
        const emoji = document.getElementById('currentEmoji');
        preview.src = currentImageUrl;
        preview.style.display = 'block';
        emoji.style.display = 'none';
        document.getElementById('removeImageBtn').style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
}

function removeCurrentImage() {
    currentImageUrl = null;
    document.getElementById('currentImagePreview').style.display = 'none';
    const currentEmoji = document.getElementById('currentEmoji');
    currentEmoji.style.display = 'block';
    currentEmoji.textContent = '🥬';
    document.getElementById('removeImageBtn').style.display = 'none';
    document.getElementById('productImageInput').value = '';
}

function handleProductFormSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const price = Number(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;

    if (!name || !price || !category) {
        showNotification('Please complete product details.', 'error');
        return;
    }

    const productData = {
        name,
        description,
        price,
        category,
        imageUrl: currentImageUrl || null,
        image: '🥬'
    };

    if (selectedProductId) {
        update(ref(db, `products/${selectedProductId}`), productData)
            .then(() => {
                showNotification('Product updated in Firebase.', 'success');
                closeProductModal();
                loadAdminProducts();
            })
            .catch((error) => {
                console.error('Update error:', error);
                showNotification('Unable to update product.', 'error');
            });
    } else {
        const nextId = getNextProductId();
        set(ref(db, `products/${nextId}`), productData)
            .then(() => {
                showNotification('Product added to Firebase.', 'success');
                closeProductModal();
                loadAdminProducts();
            })
            .catch((error) => {
                console.error('Add product error:', error);
                showNotification('Unable to add product.', 'error');
            });
    }
}

function getNextProductId() {
    if (products.length === 0) return 1;
    const maxId = products.reduce((max, item) => Math.max(max, item.id || 0), 0);
    return maxId + 1;
}

function loadAdminOrders() {
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    renderOrders(savedOrders);
    updateOrderStats(savedOrders);
}

function renderOrders(orderList) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    if (orderList.length === 0) {
        ordersList.innerHTML = '<p style="color:#666; padding:1.5rem; text-align:center;">No orders available yet.</p>';
        return;
    }

    ordersList.innerHTML = '';
    orderList.forEach(order => {
        const item = document.createElement('div');
        item.className = 'order-item';
        item.innerHTML = `
            <div class="order-info">
                <p><strong>Order ID:</strong> ${order.id || 'N/A'}</p>
                <p><strong>Name:</strong> ${order.name || 'Unknown'}</p>
                <p><strong>Total:</strong> ₹${order.total || 0}</p>
                <p><strong>Status:</strong> ${order.status || 'pending'}</p>
            </div>
        `;
        ordersList.appendChild(item);
    });
}

function updateOrderStats(orderList = []) {
    const statusCount = {
        pending: 0,
        confirmed: 0,
        preparing: 0,
        'out-for-delivery': 0,
        delivered: 0
    };
    let revenue = 0;

    orderList.forEach(order => {
        const status = order.status || 'pending';
        if (statusCount[status] !== undefined) {
            statusCount[status] += 1;
        }
        revenue += Number(order.total || 0);
    });

    document.getElementById('pendingCount').textContent = statusCount.pending;
    document.getElementById('confirmedCount').textContent = statusCount.confirmed;
    document.getElementById('preparingCount').textContent = statusCount.preparing;
    document.getElementById('deliveryCount').textContent = statusCount['out-for-delivery'];
    document.getElementById('deliveredCount').textContent = statusCount.delivered;
    document.getElementById('totalRevenue').textContent = revenue;
    document.getElementById('newOrdersCount').textContent = statusCount.pending;
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
