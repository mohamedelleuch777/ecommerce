# Shopping Cart API Documentation

## Overview
The Cart API provides comprehensive shopping cart functionality for both authenticated users and guest sessions. It supports adding items, updating quantities, applying coupons, and merging guest carts with user accounts upon login.

## Base URL
```
http://localhost:7953/api/cart
```

## Authentication
- **Authenticated Routes**: Require `Authorization: Bearer <token>` header
- **Guest Support**: Use `X-Session-ID` header for guest cart identification
- **Optional Auth**: Some endpoints work for both authenticated and guest users

## Endpoints

### 1. Get Cart
**GET** `/api/cart`

Retrieves the current user's cart or creates a new one if it doesn't exist.

**Headers:**
```
Authorization: Bearer <token> (optional)
X-Session-ID: <session-id> (required for guests)
```

**Response:**
```json
{
  "success": true,
  "cart": {
    "_id": "cart_id",
    "items": [
      {
        "_id": "item_id",
        "product": {
          "_id": "product_id",
          "name": "Product Name",
          "price": 29.99,
          "image": "product.jpg"
        },
        "quantity": 2,
        "price": 29.99,
        "originalPrice": 39.99,
        "variants": {
          "size": "M",
          "color": "Blue"
        },
        "addedAt": "2025-08-17T10:00:00Z",
        "subtotal": 59.98
      }
    ],
    "subtotal": 59.98,
    "tax": 4.80,
    "shipping": 0,
    "total": 64.78,
    "discount": 0,
    "couponCode": null,
    "itemCount": 2,
    "updatedAt": "2025-08-17T10:00:00Z"
  }
}
```

### 2. Add Item to Cart
**POST** `/api/cart/add`

Adds a product to the cart or updates quantity if item already exists.

**Headers:**
```
Authorization: Bearer <token> (optional)
X-Session-ID: <session-id> (required for guests)
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 2,
  "variants": {
    "size": "M",
    "color": "Blue"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": { /* Full cart object */ }
}
```

**Error Responses:**
- `400`: Product ID required, invalid quantity, or product out of stock
- `404`: Product not found
- `500`: Server error

### 3. Update Item Quantity
**PUT** `/api/cart/update/:itemId`

Updates the quantity of a specific cart item. Setting quantity to 0 removes the item.

**Headers:**
```
Authorization: Bearer <token> (optional)
X-Session-ID: <session-id> (required for guests)
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item quantity updated",
  "cart": { /* Updated cart object */ }
}
```

### 4. Remove Item from Cart
**DELETE** `/api/cart/remove/:itemId`

Removes a specific item from the cart.

**Headers:**
```
Authorization: Bearer <token> (optional)
X-Session-ID: <session-id> (required for guests)
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "cart": { /* Updated cart object */ }
}
```

### 5. Clear Cart
**DELETE** `/api/cart/clear`

Removes all items from the cart.

**Headers:**
```
Authorization: Bearer <token> (optional)
X-Session-ID: <session-id> (required for guests)
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "cart": {
    "_id": "cart_id",
    "items": [],
    "subtotal": 0,
    "tax": 0,
    "shipping": 0,
    "total": 0,
    "discount": 0,
    "couponCode": null,
    "itemCount": 0,
    "updatedAt": "2025-08-17T10:00:00Z"
  }
}
```

### 6. Merge Guest Cart (Login)
**POST** `/api/cart/merge`

Merges a guest cart with a user's cart when they log in. Requires authentication.

**Headers:**
```
Authorization: Bearer <token> (required)
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "guest_session_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart merged successfully",
  "cart": { /* Merged cart object */ }
}
```

### 7. Apply Coupon
**POST** `/api/cart/apply-coupon`

Applies a coupon code to the cart for discount.

**Headers:**
```
Authorization: Bearer <token> (optional)
X-Session-ID: <session-id> (required for guests)
Content-Type: application/json
```

**Request Body:**
```json
{
  "couponCode": "SAVE10"
}
```

**Available Coupon Codes:**
- `SAVE10`: 10% off (no minimum)
- `SAVE20`: 20% off orders over $50 (max $100 discount)
- `WELCOME15`: 15% off orders over $25 (max $50 discount)
- `NEWUSER25`: 25% off orders over $75 (max $200 discount)

**Response:**
```json
{
  "success": true,
  "message": "Coupon applied! You saved 10%",
  "cart": { /* Updated cart with discount */ }
}
```

### 8. Get Cart Item Count
**GET** `/api/cart/count`

Lightweight endpoint to get just the cart item count.

**Headers:**
```
Authorization: Bearer <token> (optional)
X-Session-ID: <session-id> (required for guests)
```

**Response:**
```json
{
  "success": true,
  "itemCount": 5
}
```

## Cart Calculations

### Subtotal
Sum of all item prices × quantities

### Tax
8% of subtotal (varies by shipping address in production)

### Shipping
- Free shipping for orders over $50
- $10 standard shipping for orders under $50
- International shipping rates vary by country

### Total
Subtotal + Tax + Shipping - Discount Amount

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found (cart or item not found)
- `500`: Internal Server Error

## Usage Examples

### Frontend Integration Example

```javascript
// Cart Service
class CartService {
  constructor() {
    this.baseURL = 'http://localhost:7953/api/cart';
    this.sessionId = this.getOrCreateSessionId();
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-Session-ID': this.sessionId
    };
    
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  async getCart() {
    const response = await fetch(this.baseURL, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async addToCart(productId, quantity = 1, variants = {}) {
    const response = await fetch(`${this.baseURL}/add`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ productId, quantity, variants })
    });
    return response.json();
  }

  async updateQuantity(itemId, quantity) {
    const response = await fetch(`${this.baseURL}/update/${itemId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ quantity })
    });
    return response.json();
  }

  async removeItem(itemId) {
    const response = await fetch(`${this.baseURL}/remove/${itemId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async applyCoupon(couponCode) {
    const response = await fetch(`${this.baseURL}/apply-coupon`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ couponCode })
    });
    return response.json();
  }

  // Merge guest cart on login
  async mergeGuestCart() {
    const response = await fetch(`${this.baseURL}/merge`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ sessionId: this.sessionId })
    });
    return response.json();
  }

  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
  }
}
```

## Database Schema

### Cart Model
```javascript
{
  user: ObjectId (ref: User, optional for guests),
  sessionId: String (for guest carts),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number,
    originalPrice: Number,
    variants: {
      size: String,
      color: String,
      material: String
    },
    addedAt: Date
  }],
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  discount: Number,
  couponCode: String,
  status: String (active, abandoned, converted),
  expiresAt: Date (auto-expires after 30 days),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on cart modification endpoints
2. **Input Validation**: All inputs are validated and sanitized
3. **Session Management**: Guest sessions are properly isolated
4. **Price Consistency**: Prices are validated against current product data
5. **Inventory Checks**: Stock availability is verified before adding items

## Performance Features

1. **Automatic Expiration**: Old carts are automatically cleaned up
2. **Efficient Queries**: Optimized database queries with proper indexing
3. **Minimal Data Transfer**: Lightweight endpoints for frequent operations
4. **Caching Ready**: Structured for Redis caching implementation

## Future Enhancements

1. **Inventory Management**: Real-time stock quantity tracking
2. **Wishlist Integration**: Move items between cart and wishlist
3. **Saved Carts**: Allow users to save carts for later
4. **Cart Sharing**: Share cart contents via URL
5. **Advanced Promotions**: Complex discount rules and promotions