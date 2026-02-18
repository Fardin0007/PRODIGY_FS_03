// Admin Credentials (In production, this should be server-side)
const ADMIN_CREDENTIALS = {
    username: 'sufedaveg',
    password: 'sufeda@786'
};

// State
let isAuthenticated = false;
let orders = [];
let products = [];
let refreshInterval = null;
let currentEditingProductId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProducts();
    if (isAuthenticated) {
        showDashboard();
    } else {
        showLogin();
    }
    initializeEventListeners();
});

// Load Products
function loadProducts() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        try {
            products = JSON.parse(savedProducts);
            if (!products || products.length === 0) {
                initializeDefaultProducts();
            }
        } catch (e) {
            console.error('Error parsing products:', e);
            initializeDefaultProducts();
        }
    } else {
        initializeDefaultProducts();
    }
}

function initializeDefaultProducts() {
    products = [
        { id: 1, name: "Fresh Tomatoes", description: "Ripe, red tomatoes perfect for salads and cooking", price: 40, category: "fruit-veg", image: "🍅", imageUrl:"https://img.freepik.com/premium-photo/fresh-tomato_181303-6010.jpg" },
        { id: 2, name: "Organic Spinach", description: "Fresh, leafy green spinach rich in iron", price: 30, category: "leafy", image: "🥬", imageUrl: null },
        { id: 3, name: "Carrots", description: "Sweet and crunchy carrots, great for snacking", price: 35, category: "root", image: "🥕", imageUrl: null },
        { id: 4, name: "Bell Peppers", description: "Colorful bell peppers - red, green, and yellow", price: 60, category: "fruit-veg", image: "🫑", imageUrl: null },
        { id: 5, name: "Broccoli", description: "Fresh broccoli florets, packed with nutrients", price: 50, category: "leafy", image: "🥦", imageUrl: null },
        { id: 6, name: "Potatoes", description: "Fresh potatoes, perfect for all cooking needs", price: 25, category: "root", image: "🥔", imageUrl: null },
        { id: 7, name: "Onions", description: "Fresh onions, essential for every kitchen", price: 30, category: "root", image: "🧅", imageUrl: null },
        { id: 8, name: "Cucumber", description: "Crisp and refreshing cucumbers", price: 20, category: "fruit-veg", image: "🥒", imageUrl: null },
        { id: 9, name: "Cabbage", description: "Fresh green cabbage, great for salads", price: 25, category: "leafy", image: "🥬", imageUrl: null },
        { id: 10, name: "Cauliflower", description: "Fresh white cauliflower florets", price: 45, category: "leafy", image: "🥬", imageUrl: null },
        { id: 11, name: "Coriander", description: "Fresh coriander leaves for garnishing", price: 15, category: "herbs", image: "🌿", imageUrl: null },
        { id: 12, name: "Mint Leaves", description: "Fresh mint leaves, aromatic and refreshing", price: 20, category: "herbs", image: "🌿", imageUrl: null },
        { id: 13, name: "Green Beans", description: "Tender green beans, perfect for stir-fry", price: 40, category: "fruit-veg", image: "🫛", imageUrl: null },
        { id: 14, name: "Radish", description: "Crisp white radish, great for salads", price: 20, category: "root", image: "🥕", imageUrl: null },
        { id: 15, name: "Lettuce", description: "Fresh lettuce leaves for salads", price: 35, category: "leafy", image: "🥬", imageUrl: null }
    ];
    saveProducts();
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
    // Also update the customer-facing products
    if (typeof window.updateCustomerProducts === 'function') {
        window.updateCustomerProducts(products);
    }
}

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
    // Initialize with orders tab
    switchTab('orders');
    startAutoRefresh();
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
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    showLogin();
    document.getElementById('loginForm').reset();
}

// Event Listeners
function initializeEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const statusFilter = document.getElementById('statusFilter');
    const closeOrderModal = document.getElementById('closeOrderModal');

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

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.classList.add('loading');
            loadOrders();
            setTimeout(() => {
                refreshBtn.classList.remove('loading');
            }, 500);
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            loadOrders();
        });
    }

    if (closeOrderModal) {
        closeOrderModal.addEventListener('click', () => {
            document.getElementById('orderDetailModal').classList.remove('active');
        });
    }

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = btn.getAttribute('data-tab');
            if (tab) {
                switchTab(tab);
            }
        });
    });

    // Product management
    const addProductBtn = document.getElementById('addProductBtn');
    const productEditForm = document.getElementById('productEditForm');
    const productImageInput = document.getElementById('productImageInput');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const closeProductModal = document.getElementById('closeProductModal');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openProductModal(null);
        });
    }

    if (productEditForm) {
        productEditForm.addEventListener('submit', handleProductSave);
    }

    if (productImageInput) {
        productImageInput.addEventListener('change', handleImageUpload);
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            document.getElementById('currentImagePreview').style.display = 'none';
            document.getElementById('currentImagePreview').src = '';
            document.getElementById('productImageInput').value = '';
            removeImageBtn.style.display = 'none';
            if (currentEditingProductId) {
                const product = products.find(p => p.id === currentEditingProductId);
                if (product) {
                    document.getElementById('currentEmoji').textContent = product.image;
                    document.getElementById('currentEmoji').style.display = 'block';
                }
            }
        });
    }

    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', () => {
            closeProductModalFunc();
        });
    }

    if (closeProductModal) {
        closeProductModal.addEventListener('click', () => {
            closeProductModalFunc();
        });
    }

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const orderModal = document.getElementById('orderDetailModal');
        const productModal = document.getElementById('productEditModal');
        if (e.target === orderModal) {
            orderModal.classList.remove('active');
        }
        if (e.target === productModal) {
            closeProductModalFunc();
        }
    });
}

// Tab Switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabName === 'orders') {
        document.getElementById('ordersTab').classList.add('active');
        loadOrders();
    } else if (tabName === 'products') {
        document.getElementById('productsTab').classList.add('active');
        loadProductsManagement();
    }
}

// Products Management
function loadProductsManagement() {
    const grid = document.getElementById('productsManagementGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #999;">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No products found. Click "Add New Product" to get started.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-management-card">
            <div class="product-mgmt-image">
                ${product.imageUrl ? 
                    `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 5px;">` : 
                    `<span style="font-size: 4rem;">${product.image}</span>`
                }
            </div>
            <div class="product-mgmt-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-mgmt-price">₹${product.price}/kg</div>
                <div style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">
                    Category: ${formatCategory(product.category)}
                </div>
            </div>
            <div class="product-mgmt-actions">
                <button class="btn-edit-product" onclick="openProductModal(${product.id})">
                    <i class="fas fa-edit"></i> Edit Price & Photo
                </button>
            </div>
        </div>
    `).join('');
}

function openProductModal(productId) {
    currentEditingProductId = productId;
    const modal = document.getElementById('productEditModal');
    const form = document.getElementById('productEditForm');
    const title = document.getElementById('productModalTitle');

    if (productId) {
        // Edit existing product
        const product = products.find(p => p.id === productId);
        if (!product) return;

        title.textContent = 'Edit Product';
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;

        // Handle image
        const imagePreview = document.getElementById('currentImagePreview');
        const emojiDisplay = document.getElementById('currentEmoji');
        if (product.imageUrl) {
            imagePreview.src = product.imageUrl;
            imagePreview.style.display = 'block';
            emojiDisplay.style.display = 'none';
            document.getElementById('removeImageBtn').style.display = 'inline-flex';
        } else {
            imagePreview.style.display = 'none';
            emojiDisplay.textContent = product.image;
            emojiDisplay.style.display = 'block';
            document.getElementById('removeImageBtn').style.display = 'none';
        }
    } else {
        // Add new product
        title.textContent = 'Add New Product';
        form.reset();
        document.getElementById('currentImagePreview').style.display = 'none';
        document.getElementById('currentImagePreview').src = '';
        document.getElementById('currentEmoji').textContent = '🥬';
        document.getElementById('currentEmoji').style.display = 'block';
        document.getElementById('removeImageBtn').style.display = 'none';
        document.getElementById('productImageInput').value = '';
    }

    modal.classList.add('active');
}

function closeProductModalFunc() {
    document.getElementById('productEditModal').classList.remove('active');
    currentEditingProductId = null;
    document.getElementById('productEditForm').reset();
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showNotification('Image size should be less than 2MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const imageUrl = event.target.result;
        document.getElementById('currentImagePreview').src = imageUrl;
        document.getElementById('currentImagePreview').style.display = 'block';
        document.getElementById('currentEmoji').style.display = 'none';
        document.getElementById('removeImageBtn').style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
}

function handleProductSave(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const imagePreview = document.getElementById('currentImagePreview');
    const imageUrl = imagePreview.src && imagePreview.style.display !== 'none' ? imagePreview.src : null;
    const emojiDisplay = document.getElementById('currentEmoji');
    const emoji = emojiDisplay.textContent || '🥬';

    if (currentEditingProductId) {
        // Update existing product
        const product = products.find(p => p.id === currentEditingProductId);
        if (product) {
            product.name = name;
            product.description = description;
            product.price = price;
            product.category = category;
            if (imageUrl) {
                product.imageUrl = imageUrl;
            } else {
                product.imageUrl = null;
            }
        }
    } else {
        // Add new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({
            id: newId,
            name,
            description,
            price,
            category,
            image: emoji,
            imageUrl: imageUrl
        });
    }

    saveProducts();
    loadProductsManagement();
    closeProductModalFunc();
    showNotification(`Product ${currentEditingProductId ? 'updated' : 'added'} successfully!`, 'success');
}

function formatCategory(category) {
    const categoryMap = {
        'leafy': 'Leafy Greens',
        'root': 'Root Vegetables',
        'fruit-veg': 'Fruit Vegetables',
        'herbs': 'Herbs & Spices'
    };
    return categoryMap[category] || category;
}

// Make functions globally available
window.openProductModal = openProductModal;

// Load Orders
function loadOrders() {
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    
    let filteredOrders = orders;
    if (statusFilter !== 'all') {
        filteredOrders = orders.filter(order => order.status === statusFilter);
    }

    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderOrders(filteredOrders);
    updateStats(orders);
    updateNewOrdersCount(orders);
}

function renderOrders(ordersToRender) {
    const ordersList = document.getElementById('ordersList');
    
    if (ordersToRender.length === 0) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #999;">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No orders found</p>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = ordersToRender.map(order => `
        <div class="order-card ${order.status}" onclick="viewOrderDetails('${order.id}')">
            <div class="order-header">
                <div>
                    <div class="order-id">${order.id}</div>
                    <div class="order-info">
                        <div class="order-info-item">
                            <i class="fas fa-user"></i>
                            <span>${order.name}</span>
                        </div>
                        <div class="order-info-item">
                            <i class="fas fa-phone"></i>
                            <span>${order.phone}</span>
                        </div>
                        <div class="order-info-item">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(order.date)}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <span class="order-status-badge ${order.status}">${formatStatus(order.status)}</span>
                </div>
            </div>
            <div class="order-items-preview">
                <h4>Items (${order.items.length}):</h4>
                <div class="order-items-list">
                    ${order.items.map(item => `
                        <span class="order-item-tag">${item.image} ${item.name} x${item.quantity}</span>
                    `).join('')}
                </div>
            </div>
            <div class="order-footer">
                <div class="order-total">Total: ₹${order.total.toFixed(2)}</div>
                <div class="order-actions">
                    <button class="btn-action btn-view" onclick="event.stopPropagation(); viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn-action btn-update" onclick="event.stopPropagation(); updateOrderStatus('${order.id}')">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('orderDetailModal');
    const content = document.getElementById('orderDetailContent');

    content.innerHTML = `
        <div class="order-detail-section">
            <h3><i class="fas fa-info-circle"></i> Order Information</h3>
            <div class="order-detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Order ID</span>
                    <span class="detail-value">${order.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">
                        <span class="order-status-badge ${order.status}">${formatStatus(order.status)}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Order Date</span>
                    <span class="detail-value">${formatDateTime(order.date)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Payment Method</span>
                    <span class="detail-value">${formatPaymentMethod(order.paymentMethod)}</span>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h3><i class="fas fa-user"></i> Customer Information</h3>
            <div class="order-detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${order.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${order.phone}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <span class="detail-label">Delivery Address</span>
                    <span class="detail-value">${order.address}</span>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h3><i class="fas fa-shopping-cart"></i> Order Items</h3>
            <div class="order-items-detail">
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        <div class="order-item-detail-image">${item.image}</div>
                        <div class="order-item-detail-info">
                            <div class="order-item-detail-name">${item.name}</div>
                            <div class="order-item-detail-price">₹${item.price}/kg</div>
                        </div>
                        <div class="order-item-detail-quantity">
                            ${item.quantity} kg × ₹${item.price} = ₹${(item.quantity * item.price).toFixed(2)}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--border-color); text-align: right;">
                <strong style="font-size: 1.25rem; color: var(--primary-color);">
                    Total: ₹${order.total.toFixed(2)}
                </strong>
            </div>
        </div>

        <div class="order-detail-section">
            <h3><i class="fas fa-edit"></i> Update Order Status</h3>
            <div class="status-update-section">
                <select id="newStatusSelect">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="out-for-delivery" ${order.status === 'out-for-delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
                <button class="btn-primary" onclick="saveOrderStatus('${order.id}')">
                    <i class="fas fa-save"></i> Update Status
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function updateOrderStatus(orderId) {
    viewOrderDetails(orderId);
}

function saveOrderStatus(orderId) {
    const newStatus = document.getElementById('newStatusSelect').value;
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;

    const oldStatus = order.status;
    order.status = newStatus;

    // Add timeline entry
    if (!order.timeline) {
        order.timeline = [];
    }
    
    const statusMessages = {
        'pending': 'Order placed',
        'confirmed': 'Order confirmed',
        'preparing': 'Order is being prepared',
        'out-for-delivery': 'Order is out for delivery',
        'delivered': 'Order has been delivered'
    };

    order.timeline.push({
        status: newStatus,
        message: statusMessages[newStatus],
        time: new Date().toISOString()
    });

    localStorage.setItem('orders', JSON.stringify(orders));
    
    document.getElementById('orderDetailModal').classList.remove('active');
    loadOrders();
    
    showNotification(`Order ${orderId} status updated from ${formatStatus(oldStatus)} to ${formatStatus(newStatus)}`, 'success');
}

// Stats
function updateStats(allOrders) {
    const stats = {
        pending: allOrders.filter(o => o.status === 'pending').length,
        confirmed: allOrders.filter(o => o.status === 'confirmed').length,
        preparing: allOrders.filter(o => o.status === 'preparing').length,
        delivery: allOrders.filter(o => o.status === 'out-for-delivery').length,
        delivered: allOrders.filter(o => o.status === 'delivered').length,
        totalRevenue: allOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
    };

    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('confirmedCount').textContent = stats.confirmed;
    document.getElementById('preparingCount').textContent = stats.preparing;
    document.getElementById('deliveryCount').textContent = stats.delivery;
    document.getElementById('deliveredCount').textContent = stats.delivered;
    document.getElementById('totalRevenue').textContent = stats.totalRevenue.toFixed(2);
}

function updateNewOrdersCount(allOrders) {
    const newOrders = allOrders.filter(o => o.status === 'pending').length;
    const badge = document.getElementById('newOrdersCount');
    if (badge) {
        badge.textContent = newOrders;
        if (newOrders > 0) {
            badge.parentElement.style.display = 'flex';
        } else {
            badge.parentElement.style.display = 'none';
        }
    }
}

// Auto Refresh
function startAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    // Refresh every 5 seconds
    refreshInterval = setInterval(() => {
        loadOrders();
    }, 5000);
}

// Utility Functions
function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'preparing': 'Preparing',
        'out-for-delivery': 'Out for Delivery',
        'delivered': 'Delivered'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPaymentMethod(method) {
    const methodMap = {
        'cash': 'Cash on Delivery',
        'card': 'Credit/Debit Card',
        'upi': 'UPI'
    };
    return methodMap[method] || method;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--primary-color)' : type === 'error' ? 'var(--accent-color)' : '#2196f3'};
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

// Make functions globally available
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.saveOrderStatus = saveOrderStatus;
