# Mini ERP — API Documentation

Base URL: `http://localhost:5000/api/v1` (replace with your deployed backend URL)

## Table of Contents
- [Conventions](#conventions)
- [Authentication](#authentication)
- [Roles & Permissions](#roles--permissions)
- [Auth](#auth-endpoints)
- [Products](#product-endpoints)
- [Customers](#customer-endpoints)
- [Sales](#sale-endpoints)
- [Dashboard](#dashboard-endpoints)
- [Error Responses](#error-responses)

---

## Conventions

Every response follows one shape.

**Success:**
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { },
  "meta": { }
}
```
`meta` is only present on paginated list endpoints (contains `pagination`).

**Error:**
```json
{
  "success": false,
  "message": "Human readable error message",
  "errors": ["optional array of field-level details"]
}
```

**Pagination query params** (available on all list endpoints): `page` (default 1), `limit` (default 10), `sortBy`, `sortOrder` (`asc` | `desc`).

---

## Authentication

Protected routes require a `Bearer` token obtained from `POST /auth/login`.

```
Authorization: Bearer <token>
```

Missing/invalid/expired tokens return `401 Unauthorized`. Insufficient role returns `403 Forbidden`.

## Roles & Permissions

| Role     | Products              | Customers             | Sales           | Dashboard |
|----------|------------------------|-------------------------|------------------|-----------|
| admin    | full access            | full access             | full access      | yes       |
| manager  | view, create, edit, delete | view, create, edit, delete | view + create   | yes       |
| employee | view only              | view only                | create only      | no        |

---

## Auth Endpoints

### POST /auth/login
Public.

**Request body**
```json
{ "email": "admin@minierp.com", "password": "Admin@123" }
```

**Response `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": "66f...", "name": "Admin", "email": "admin@minierp.com", "role": "admin" }
  }
}
```

Errors: `401` invalid credentials, `403` account deactivated.

### GET /auth/me
Protected (any role). Returns the logged-in user's profile.

**Response `200`**
```json
{ "success": true, "message": "Profile fetched successfully", "data": { "id": "66f...", "name": "Admin", "email": "admin@minierp.com", "role": "admin" } }
```

---

## Product Endpoints

Base path: `/products`

### GET /products
Roles: admin, manager, employee.

**Query params**: `search` (matches name/sku/category), `category`, `page`, `limit`, `sortBy`, `sortOrder`.

`GET /products?search=mouse&category=electronics&page=1&limit=10&sortBy=sellingPrice&sortOrder=asc`

**Response `200`**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [
    {
      "_id": "66f...",
      "name": "Wireless Mouse",
      "sku": "WM-001",
      "category": "Electronics",
      "purchasePrice": 500,
      "sellingPrice": 750,
      "stockQuantity": 20,
      "image": "https://res.cloudinary.com/your-cloud-name/image/upload/v1720000000/mini-erp/products/abc123.png",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { "pagination": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 } }
}
```

### GET /products/:id
Roles: admin, manager, employee. Returns `404` if not found.

### POST /products
Roles: admin, manager. **Content-Type: multipart/form-data** (image is required).

| Field | Type | Required |
|---|---|---|
| name | string | yes |
| sku | string | yes (must be unique) |
| category | string | yes |
| purchasePrice | number | yes |
| sellingPrice | number | yes |
| stockQuantity | number | yes |
| image | file (jpg/jpeg/png/webp, max 4MB) | yes |

Errors: `400` missing image or validation failure, `409` duplicate SKU. On success, the image is uploaded to Cloudinary server-side and its `secure_url` is stored on the product as `image` (the Cloudinary `public_id` is also stored internally to support replace/delete).

### PUT /products/:id
Roles: admin, manager. Same fields as create, all optional; `image` optional (uploads a new Cloudinary asset and deletes the old one if provided).

### DELETE /products/:id
Roles: admin, manager. Also deletes the associated Cloudinary asset. `404` if not found.

---

## Customer Endpoints

Base path: `/customers`

### GET /customers
Roles: admin, manager, employee. Query: `search` (name/phone/email), `page`, `limit`, `sortBy`, `sortOrder`.

### GET /customers/:id
Roles: admin, manager, employee.

### POST /customers
Roles: admin, manager.
```json
{ "name": "John Doe", "phone": "01700000000", "email": "john@example.com", "address": "Dhaka" }
```
`email` and `address` are optional. `409` if phone already exists.

### PUT /customers/:id
Roles: admin, manager. All fields optional.

### DELETE /customers/:id
Roles: admin, manager.

---

## Sale Endpoints

Base path: `/sales`

### POST /sales
Roles: admin, manager, employee.

**Request body**
```json
{
  "customerId": "66f0a1...",
  "items": [
    { "productId": "66f0b2...", "quantity": 2 },
    { "productId": "66f0c3...", "quantity": 1 }
  ]
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "_id": "66f0d4...",
    "customer": "66f0a1...",
    "items": [
      { "product": "66f0b2...", "productName": "Wireless Mouse", "quantity": 2, "unitPrice": 750, "subtotal": 1500 },
      { "product": "66f0c3...", "productName": "USB Cable", "quantity": 1, "unitPrice": 200, "subtotal": 200 }
    ],
    "grandTotal": 1700,
    "soldBy": "66f0e5...",
    "createdAt": "..."
  }
}
```

**Business rules enforced:**
- Rejects the sale with `400` if any product has insufficient stock (message names the product and the available quantity).
- Stock is deducted atomically inside a DB transaction — either the entire sale succeeds and stock is deducted for every item, or nothing is committed.
- Duplicate `productId` entries in one request are merged (quantities summed) automatically.
- `unitPrice` is a snapshot of the product's `sellingPrice` at the moment of sale — later price changes don't affect historical sales.

Errors: `404` customer or product not found, `400` insufficient stock / invalid quantity.

### GET /sales
Roles: admin, manager. Paginated sale history, `customer` and `soldBy` populated with basic display fields.

### GET /sales/:id
Roles: admin, manager. Fully populated single sale record.

---

## Dashboard Endpoints

Base path: `/dashboard`

### GET /dashboard/stats
Roles: admin, manager.

**Response `200`**
```json
{
  "success": true,
  "message": "Dashboard statistics fetched successfully",
  "data": {
    "totalProducts": 42,
    "totalCustomers": 15,
    "totalSales": 87,
    "lowStockCount": 3,
    "lowStockProducts": [
      { "_id": "66f...", "name": "USB Cable", "stockQuantity": 2, "sku": "UC-002", "...": "..." }
    ]
  }
}
```
"Low stock" = `stockQuantity < 5`.

---

## Error Responses

| Status | Meaning | Example cause |
|---|---|---|
| 400 | Bad Request | Validation failure, missing product image, insufficient stock |
| 401 | Unauthorized | No/invalid/expired token, wrong login credentials |
| 403 | Forbidden | Valid token but role lacks permission; deactivated account |
| 404 | Not Found | Product/customer/sale/user id doesn't exist; unknown route |
| 409 | Conflict | Duplicate SKU or phone number |
| 500 | Internal Server Error | Unexpected server error |

All validation errors (`400` from Zod) include an `errors` array of `"field: message"` strings, e.g.:
```json
{ "success": false, "message": "Validation failed", "errors": ["body.email: Invalid email address"] }
```
