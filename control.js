import { initializeApp } from "https://eco-veg-ee446-default-rtdb.firebaseio.com";
import { getDatabase, ref, set, update, remove, get } from "https://eco-veg-ee446-default-rtdb.firebaseio.com";

const firebaseConfig = {
  apiKey: "AIzaSyB3783H6jL702__hpF-tnAQ6O32xR55qLg",
  authDomain: "eco-veg-ee446.firebaseapp.com",
  databaseURL: "https://eco-veg-ee446-default-rtdb.firebaseio.com",
  projectId: "eco-veg-ee446"
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
    console.log('Checking credentials:', username, 'vs', ADMIN_CREDENTIALS.username);
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        console.log('Credentials match, setting auth');
        localStorage.setItem('adminAuth', 'true');
        isAuthenticated = true;
        showDashboard();
        initializeAdminDashboard();
        return true;
    }
    console.log('Credentials do not match');
    return false;
}

function logout() {
    localStorage.removeItem('adminAuth');
    isAuthenticated = false;
    showLogin();
    document.getElementById('loginForm').reset();
}

function initializeEventListeners() {
    console.log('Initializing event listeners...');

    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    console.log('Login form found:', !!loginForm);
    console.log('Logout button found:', !!logoutBtn);

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Login form submitted');
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            console.log('Login attempt:', username, password ? '***' : 'no password');

            if (login(username, password)) {
                console.log('Login successful');
                showNotification('Login successful!', 'success');
            } else {
                console.log('Login failed');
                showNotification('Invalid credentials!', 'error');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logout clicked');
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
}

function initializeAdminDashboard() {
    console.log('Initializing admin dashboard...');
    loadAdminProducts();
    loadAdminOrders();
    setupDashboardListeners();
    // Activate products tab by default
    activateTab('products');
}

function setupDashboardListeners() {
    console.log('Setting up dashboard listeners...');

    const addProductBtn = document.getElementById('addProductBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const productEditForm = document.getElementById('productEditForm');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const closeProductModalBtn = document.getElementById('closeProductModal');
    const productImageInput = document.getElementById('productImageInput');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const tabButtons = document.querySelectorAll('.tab-btn');

    console.log('Found elements:', {
        addProductBtn: !!addProductBtn,
        refreshBtn: !!refreshBtn,
        productEditForm: !!productEditForm,
        cancelProductBtn: !!cancelProductBtn,
        closeProductModalBtn: !!closeProductModalBtn,
        tabButtons: tabButtons.length
    });

    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            console.log('Add product button clicked');
            openAddProductModal();
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('Refresh button clicked');
            loadAdminProducts();
        });
    }

    if (productEditForm) {
        productEditForm.addEventListener('submit', (e) => {
            console.log('Product form submitted');
            handleProductFormSubmit(e);
        });
    }

    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', () => {
            console.log('Cancel button clicked');
            closeProductModal();
        });
    }

    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', () => {
            console.log('Close modal button clicked');
            closeProductModal();
        });
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
                console.log('Tab clicked:', targetTab);
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
    console.log('Loading admin products from Firebase...');
    get(productsRef)
        .then((snapshot) => {
            const data = snapshot.val();
            console.log('Firebase data received:', data);
            products = convertProductsSnapshot(data);

            // If no products in Firebase, add some defaults
            if (!products || products.length === 0) {
                console.log('No products in Firebase, adding defaults');
                products = [
                    { id: 1, name: "Fresh Tomatoes", description: "Ripe, red tomatoes perfect for salads and cooking", price: 20, category: "fruit-veg", image: "🍅", imageUrl: null },
                    { id: 2, name: "Organic Spinach", description: "Fresh, leafy green spinach rich in iron", price: 30, category: "leafy", image: "🥬", imageUrl: null },
                    { id: 3, name: "Carrots", description: "Sweet and crunchy carrots, great for snacking", price: 40, category: "root", image: "🥕", imageUrl: null }
                ];
                // Save defaults to Firebase
                const defaultsRef = ref(db, 'products');
                set(defaultsRef, {
                    1: products[0],
                    2: products[1],
                    3: products[2]
                }).then(() => {
                    console.log('Default products saved to Firebase');
                }).catch((error) => {
                    console.error('Error saving defaults:', error);
                });
            }

            console.log('Final products:', products);
            renderAdminProducts();
        })
        .catch((error) => {
            console.error('Firebase fetch products error:', error);
            showNotification('Unable to load products from Firebase. Using defaults.', 'error');

            // Fallback to default products
            products = [
                { id: 1, name: "Fresh Tomatoes", description: "Ripe, red tomatoes perfect for salads and cooking", price: 20, category: "fruit-veg", image: "🍅", imageUrl: null },
                { id: 2, name: "Organic Spinach", description: "Fresh, leafy green spinach rich in iron", price: 30, category: "leafy", image: "🥬", imageUrl: null },
                { id: 3, name: "Carrots", description: "Sweet and crunchy carrots, great for snacking", price: 40, category: "root", image: "🥕", imageUrl: null }
            ];
            renderAdminProducts();
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

// Make functions globally available
window.editProduct = function(productId) {
    console.log('Edit product clicked:', productId);
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

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
    console.log('Delete product clicked:', productId);
    if (!confirm('Delete this product from Firebase?')) return;
    remove(ref(db, `products/${productId}`))
        .then(() => {
            console.log('Product deleted successfully');
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
    console.log('Closing product modal');
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
