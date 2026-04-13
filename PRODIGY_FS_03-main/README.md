# Fardin Vegetables - E-commerce Platform

A complete e-commerce website for Fardin Vegetables, a local vegetable store. This platform enables customers to browse and purchase fresh vegetables online.

## Features

### Core Features ✅
- **Product Listings**: Browse vegetables with images, descriptions, and prices
- **Shopping Cart**: Add items to cart, update quantities, and remove items
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Optional Features ✅
- **Product Sorting**: Sort by price (low to high, high to low) and name (A-Z, Z-A)
- **Product Filtering**: Filter by category (Leafy Greens, Root Vegetables, Fruit Vegetables, Herbs & Spices)
- **Search Functionality**: Search products by name or description
- **Order Tracking**: Track your orders using Order ID with real-time status updates
- **User Reviews**: View and submit customer reviews with star ratings
- **Customer Support**: Contact information and support form
- **Local Storage**: Cart and order data persist across sessions

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- JavaScript (Vanilla JS)
- Font Awesome Icons
- Local Storage API

## Getting Started

1. **Open the website**: Simply open `index.html` in your web browser
2. **No installation required**: This is a client-side only application
3. **No server needed**: All data is stored in browser's local storage

## How to Use

### For Customers

#### Shopping
1. Browse products on the Products section
2. Use filters and search to find specific vegetables
3. Click "Add to Cart" to add items
4. Click the cart icon to view your cart
5. Adjust quantities or remove items
6. Click "Checkout" to place an order

#### Order Tracking
1. Go to "Track Order" section
2. Enter your Order ID (provided after checkout)
3. View real-time order status (updates when seller changes status)

#### Reviews
1. Scroll to "Reviews" section
2. Read existing customer reviews
3. Submit your own review with rating

#### Customer Support
1. Visit "Support" section
2. Find contact information (phone, email, address)
3. Send a message using the contact form

### For Sellers/Admins

#### Access Admin Dashboard
1. Click the admin icon (shield icon) in the top navigation bar
2. Or directly open `dashboard.html` in your browser
3. Login with credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

#### Manage Orders
1. View all customer orders in the dashboard
2. See order statistics (pending, confirmed, preparing, delivery, delivered)
3. Filter orders by status
4. Click "View Details" to see full order information
5. Click "Update Status" to change order status
6. Orders auto-refresh every 5 seconds to show new orders
7. Track total revenue from delivered orders

#### Order Status Management
- **Pending**: New orders placed by customers
- **Confirmed**: Orders confirmed by seller
- **Preparing**: Orders being prepared
- **Out for Delivery**: Orders dispatched for delivery
- **Delivered**: Completed orders

When seller updates order status, customers can see the changes in real-time when they track their order!

## Project Structure

```
E-commerce/
├── index.html      # Customer-facing website
├── styles.css      # Customer website styling
├── script.js       # Customer website functionality
├── dashboard.html  # Seller/Admin dashboard
├── manage.css      # Seller dashboard styling
├── control.js      # Seller dashboard functionality
└── README.md       # This file
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes

- All data (cart, orders, reviews) is stored in browser's local storage
- **Order status updates are managed by seller/admin in real-time**
- This is a front-end only application (no backend server)
- **Seller and customer share the same localStorage, so order updates are visible immediately**

## Admin Dashboard Features

✅ **Complete Order Management System**
- View all customer orders in real-time
- Filter orders by status
- Update order status (Pending → Confirmed → Preparing → Out for Delivery → Delivered)
- View detailed order information
- Track revenue from delivered orders
- Auto-refresh every 5 seconds for new orders
- Statistics dashboard with order counts

## Future Enhancements

- Backend integration for real order processing
- Payment gateway integration
- User authentication
- Product images (currently using emojis)
- Email notifications
- Multiple admin users

---

**Developed for Fardin Vegetables** 🥬
