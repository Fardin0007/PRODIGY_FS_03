# Admin/Seller Dashboard Guide - Fardin Vegetables

## 🎯 Overview

The Admin Dashboard allows sellers to view and manage all customer orders in real-time. When customers place orders, sellers can see them immediately and update their status.

## 🔐 Login Credentials

**Default Login:**
- **Username**: `admin`
- **Password**: `admin123`

*Note: In a production environment, this should be secured with proper authentication.*

## 📋 How It Works

### For Sellers:

1. **Access Dashboard**
   - Click the shield icon (🛡️) in the top navigation of the customer site
   - Or directly open `dashboard.html` in your browser

2. **View Orders**
   - All customer orders appear automatically
   - Dashboard auto-refreshes every 5 seconds to show new orders
   - Orders are sorted by date (newest first)

3. **Order Statistics**
   - See counts for each order status:
     - Pending Orders
     - Confirmed Orders
     - Preparing Orders
     - Out for Delivery
     - Delivered Orders
   - Total Revenue (from delivered orders)

4. **Filter Orders**
   - Use the status filter dropdown to view orders by specific status
   - Click "Refresh" button to manually update

5. **View Order Details**
   - Click "View Details" on any order card
   - See complete information:
     - Order ID and date
     - Customer name, phone, and address
     - All items with quantities and prices
     - Payment method
     - Current status

6. **Update Order Status**
   - Click "Update Status" on any order
   - Select new status from dropdown:
     - **Pending**: New order just placed
     - **Confirmed**: Order confirmed by seller
     - **Preparing**: Order being prepared
     - **Out for Delivery**: Order dispatched
     - **Delivered**: Order completed
   - Click "Update Status" to save
   - Status updates are saved immediately

### For Customers:

1. **Place Order**
   - Add items to cart
   - Click checkout
   - Fill in details (name, phone, address, payment method)
   - Receive Order ID

2. **Track Order**
   - Go to "Track Order" section
   - Enter Order ID
   - See real-time status updates
   - Status updates when seller changes it in admin dashboard

## 🔄 Real-Time Updates

- **How it works**: Both customer and admin pages use the same `localStorage` to store orders
- When seller updates order status, it's saved to `localStorage`
- When customer tracks order, it reads the latest status from `localStorage`
- **Result**: Customers see status updates immediately!

## 📊 Order Status Flow

```
Pending → Confirmed → Preparing → Out for Delivery → Delivered
```

1. **Pending**: Customer just placed order
2. **Confirmed**: Seller confirms the order
3. **Preparing**: Seller is preparing the order
4. **Out for Delivery**: Order is on the way to customer
5. **Delivered**: Order completed successfully

## 💡 Tips for Sellers

1. **Check New Orders Regularly**
   - The dashboard shows a badge with count of pending orders
   - Auto-refreshes every 5 seconds

2. **Update Status Promptly**
   - Confirm orders quickly to keep customers informed
   - Update status as order progresses

3. **View Order Details**
   - Always check customer address before confirming
   - Verify payment method
   - Check all items in the order

4. **Track Revenue**
   - Total revenue shows only delivered orders
   - Helps track business performance

## 🎨 Dashboard Features

- **Color-coded Status Cards**: Easy to identify order status
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Statistics**: See order counts and revenue at a glance
- **Detailed Order View**: Complete information in one place
- **Easy Status Updates**: One-click status changes

## 🔒 Security Note

This is a **front-end only** application for demonstration purposes. In a real production environment:

- Use proper backend authentication
- Secure admin credentials
- Use HTTPS
- Implement session management
- Add role-based access control

## 📱 Mobile Friendly

The admin dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

All features are accessible on all devices!

---

**Happy Selling!** 🥬💰
