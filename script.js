// Products Data - will be loaded from storage or use defaults
let products = [];

// State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let currentRating = 0;

// Load products from localStorage (updated by admin) or use default
function loadProductsFromStorage() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        try {
            const parsed = JSON.parse(savedProducts);
            if (parsed && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.error('Error parsing products:', e);
        }
    }
    // Return default products if nothing in storage
    return [
        { id: 1, name: "Fresh Tomatoes", description: "Ripe, red tomatoes perfect for salads and cooking", price: 40, category: "fruit-veg", image: "🍅", imageUrl: null },
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
}

// Update products when admin makes changes
window.updateCustomerProducts = function(newProducts) {
    products = newProducts;
    loadProducts();
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Load products from storage (may be updated by admin) or use default
    products = loadProductsFromStorage();
    
    // Ensure products array is populated
    if (!products || products.length === 0) {
        products = loadProductsFromStorage(); // Get defaults
    }
    
    // Save to localStorage if not already there (for first time)
    if (!localStorage.getItem('products') || products.length === 0) {
        products = loadProductsFromStorage(); // Ensure we have defaults
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    console.log('Initialized with', products.length, 'products');
    
    initializeNavigation();
    loadProducts();
    updateCartCount();
    loadReviews();
    initializeEventListeners();
});

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }

            // Close mobile menu
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Update active nav on scroll
    window.addEventListener('scroll', updateActiveNav);
}

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            if (navLink) navLink.classList.add('active');
        }
    });
}

// Products
function loadProducts(filteredProducts = null) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.error('Products grid not found');
        return;
    }
    
    // Use filtered products if provided, otherwise use all products
    const productsToShow = filteredProducts || products;
    
    productsGrid.innerHTML = '';

    if (!productsToShow || productsToShow.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #999;">No products found. Please check back later.</p>';
        return;
    }

    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    // Use uploaded image if available, otherwise use emoji
    const imageDisplay = product.imageUrl ? 
        `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` : 
        `<span style="font-size: 4rem;">${product.image || '🥬'}</span>`;
    
    card.innerHTML = `
        <div class="product-image">${imageDisplay}</div>
        <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-footer">
                <div class="product-price">₹${product.price}/kg</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    return card;
}

// Shopping Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartCount();
        renderCart();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '0';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">${item.image}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}/kg</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="cart-item-quantity">${item.quantity} kg</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = total.toFixed(2);
}

// Cart Sidebar
function initializeEventListeners() {
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCart = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeModal = document.getElementById('closeModal');
    const checkoutForm = document.getElementById('checkoutForm');

    cartIcon.addEventListener('click', () => {
        renderCart();
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    });

    closeCart.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        closeCartSidebar();
        checkoutModal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
    });

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === checkoutModal) {
            checkoutModal.classList.remove('active');
        }
        const syncModal = document.getElementById('syncCodeModal');
        if (event.target === syncModal) {
            syncModal.classList.remove('active');
        }
    });

    checkoutForm.addEventListener('submit', handleCheckout);

    // Filters and Sort
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    categoryFilter.addEventListener('change', filterAndSortProducts);
    searchInput.addEventListener('input', filterAndSortProducts);
    sortSelect.addEventListener('change', filterAndSortProducts);

    // Reviews
    const reviewForm = document.getElementById('reviewForm');
    const ratingStars = document.querySelectorAll('#ratingStars i');

    ratingStars.forEach((star, index) => {
        star.addEventListener('click', () => {
            currentRating = index + 1;
            updateStarRating(currentRating);
        });
        star.addEventListener('mouseenter', () => {
            updateStarRating(index + 1);
        });
    });

    document.getElementById('ratingStars').addEventListener('mouseleave', () => {
        updateStarRating(currentRating);
    });

    reviewForm.addEventListener('submit', handleReviewSubmit);

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', handleContactSubmit);

    // Track Order
    const trackOrderBtn = document.getElementById('trackOrderBtn');
    trackOrderBtn.addEventListener('click', trackOrder);
}

function closeCartSidebar() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
}

// Filter and Sort
function filterAndSortProducts() {
    const category = document.getElementById('categoryFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortSelect').value;

    let filtered = products.filter(product => {
        const matchesCategory = category === 'all' || product.category === category;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    // Sort
    switch (sortBy) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }

    loadProducts(filtered);
}

// Checkout Summary
function updateCheckoutSummary() {
    const summary = document.getElementById('checkoutSummary');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkoutTotalAmount').textContent = total.toFixed(2);
    
    if (summary) {
        summary.innerHTML = `
            <div class="checkout-items-list">
                <h4>Order Summary (${cart.length} item${cart.length > 1 ? 's' : ''})</h4>
                ${cart.map(item => `
                    <div class="checkout-item">
                        <span>${item.image || '🥬'} ${item.name}</span>
                        <span>${item.quantity} kg × ₹${item.price} = ₹${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="checkout-item-total">
                    <strong>Total: ₹${total.toFixed(2)}</strong>
                </div>
            </div>
        `;
    }
}

// Checkout
function handleCheckout(e) {
    e.preventDefault();
    
    const name = document.getElementById('checkoutName').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;

    // Validation
    if (!name || !phone || !address || !paymentMethod) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (phone.length < 10) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }

    const orderId = 'ORD' + Date.now();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = {
        id: orderId,
        name,
        phone,
        address,
        paymentMethod,
        items: [...cart],
        total,
        status: 'pending',
        date: new Date().toISOString(),
        timeline: [
            { status: 'pending', message: 'Order placed', time: new Date().toISOString() }
        ]
    };

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    cart = [];
    saveCart();
    updateCartCount();

    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('checkoutForm').reset();

    showNotification(`Order placed successfully! Order ID: ${orderId}`, 'success');
    
    // Show order confirmation with details
    setTimeout(() => {
        alert(`✅ Order Placed Successfully!\n\nOrder ID: ${orderId}\nTotal: ₹${total.toFixed(2)}\n\nYou can track your order using the Order ID in the "Track Order" section.`);
    }, 500);
}

// Reviews
function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No reviews yet. Be the first to review!</p>';
        return;
    }

    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="reviewer-name">${review.name}</div>
                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            </div>
            <div class="review-text">${review.text}</div>
        `;
        reviewsList.appendChild(reviewCard);
    });
}

function updateStarRating(rating) {
    const stars = document.querySelectorAll('#ratingStars i');
    const ratingValue = document.getElementById('ratingValue');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
    
    ratingValue.textContent = rating;
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('reviewerName').value;
    const text = document.getElementById('reviewText').value;

    if (currentRating === 0) {
        alert('Please select a rating');
        return;
    }

    const review = {
        id: Date.now(),
        name,
        rating: currentRating,
        text,
        date: new Date().toISOString()
    };

    reviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));

    document.getElementById('reviewForm').reset();
    currentRating = 0;
    updateStarRating(0);

    loadReviews();
    showNotification('Thank you for your review!');
}

// Contact Form
function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    const message = document.getElementById('contactMessage').value;

    // In a real application, this would send to a server
    console.log('Contact form submission:', { name, email, phone, message });
    
    document.getElementById('contactForm').reset();
    showNotification('Thank you for contacting us! We will get back to you soon.');
}

// Order Tracking
function trackOrder() {
    const orderId = document.getElementById('orderIdInput').value.trim();
    const orderStatus = document.getElementById('orderStatus');

    if (!orderId) {
        orderStatus.innerHTML = '<p class="track-placeholder">Please enter an order ID</p>';
        return;
    }

    // Reload orders from localStorage to get latest updates from admin
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        orderStatus.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 2rem;">Order not found. Please check your Order ID.</p>';
        return;
    }

    // Use actual order status from admin updates
    const statusOrder = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(order.status);

    const timeline = [
        { status: 'pending', icon: '📦', title: 'Order Placed', message: 'Your order has been placed successfully', active: currentStatusIndex >= 0 },
        { status: 'confirmed', icon: '✓', title: 'Order Confirmed', message: 'Your order has been confirmed', active: currentStatusIndex >= 1 },
        { status: 'preparing', icon: '👨‍🍳', title: 'Preparing', message: 'Your order is being prepared', active: currentStatusIndex >= 2 },
        { status: 'out-for-delivery', icon: '🚚', title: 'Out for Delivery', message: 'Your order is on the way', active: currentStatusIndex >= 3 },
        { status: 'delivered', icon: '✅', title: 'Delivered', message: 'Your order has been delivered', active: currentStatusIndex >= 4 }
    ];

    let html = `
        <div style="margin-bottom: 1.5rem;">
            <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">Order ${order.id}</h3>
            <p style="color: #666;">Total: ₹${order.total.toFixed(2)}</p>
            <p style="color: #666;">Date: ${new Date(order.date).toLocaleDateString()}</p>
        </div>
        <div class="order-timeline">
    `;

    timeline.forEach((item, index) => {
        html += `
            <div class="timeline-item ${item.active ? 'active' : ''}">
                <div class="timeline-icon">${item.icon}</div>
                <div class="timeline-content">
                    <h4>${item.title}</h4>
                    <p>${item.message}</p>
                </div>
            </div>
        `;
    });

    html += '</div>';
    orderStatus.innerHTML = html;
}

// Order status is now managed by admin, so this function is no longer needed for auto-updates
// Keeping it for backward compatibility but admin updates take precedence
function updateOrderStatus(order) {
    // Status updates are now handled by admin dashboard
    // This function is kept for compatibility but doesn't auto-update anymore
    // Admin can update status manually from admin dashboard
}

// Utility Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
// Product Sync Functions for Cross-Device Updates
function openSyncCodeModal() {
    document.getElementById('syncCodeModal').classList.add('active');
    document.getElementById('syncCodeInput').value = '';
    document.getElementById('syncCodeInput').focus();
}

function checkForProductUpdates() {
    // Try to get latest products from localStorage
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        try {
            const latestProducts = JSON.parse(savedProducts);
            if (latestProducts && latestProducts.length > 0) {
                products = latestProducts;
                loadProducts();
                showNotification('✅ Products updated to latest! Prices may have changed.', 'success');
            }
        } catch (e) {
            showNotification('Error checking for updates', 'error');
        }
    } else {
        showNotification('No updates available yet. Ask seller for sync code.', 'info');
    }
}

function applySyncCode() {
    const syncCode = document.getElementById('syncCodeInput').value.trim();
    
    if (!syncCode) {
        showNotification('Please paste a sync code', 'error');
        return;
    }
    
    try {
        const data = JSON.parse(syncCode);
        
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            // Update products from sync code
            products = data.products;
            localStorage.setItem('products', JSON.stringify(products));
            
            // Refresh the display
            loadProducts();
            
            // Close modal
            document.getElementById('syncCodeModal').classList.remove('active');
            
            showNotification(`✅ Synced! Updated ${products.length} products with latest prices and photos.`, 'success');
        } else {
            showNotification('Invalid sync code format', 'error');
        }
    } catch (error) {
        console.error('Error applying sync code:', error);
        showNotification('Invalid sync code. Please check and try again.', 'error');
    }
}

function copySyncCodeFromCustomer() {
    const data = {
        products: products,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data);
    navigator.clipboard.writeText(dataStr).then(() => {
        showNotification('✅ Current prices copied! Share with others to sync.', 'success');
    }).catch(err => {
        showNotification('Error copying to clipboard', 'error');
        console.error(err);
    });
}

// Show sync notice on page load
document.addEventListener('DOMContentLoaded', () => {
    // Show sync notice if user is not on admin page
    if (!window.location.pathname.includes('dashboard')) {
        setTimeout(() => {
            document.getElementById('syncNotice').style.display = 'flex';
        }, 2000);
    }
}, { once: true });