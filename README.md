# Mini ERP — Backend

📄 Full endpoint reference: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Architecture

Controller → Service → Repository → MongoDB (Mongoose)

- **Controller**: request/response only, no business logic
- **Service**: business logic, orchestrates repositories
- **Repository**: raw DB queries only (extends a generic `BaseRepository<T>`)

## Setup

```bash
cp .env.example .env
npm install
npm run seed   # creates admin@minierp.com / Admin@123
npm run dev
```

Server runs at `http://localhost:5000`, health check at `/health`.

## Implemented so far

- [x] Project scaffold (TS + Express + Mongoose)
- [x] Global error handler + consistent `ApiResponse` / `ApiError` shape
- [x] User model (roles: admin / manager / employee)
- [x] JWT login (`POST /api/v1/auth/login`)
- [x] Protected route example (`GET /api/v1/auth/me`)
- [x] `protect` (JWT) + `authorize(...roles)` middleware
- [x] Zod request validation middleware
- [x] Admin seed script
- [x] Generic `QueryBuilder` (search + filter + sort + pagination), reusable across modules
- [x] Product module: CRUD, image upload (multer), search, pagination, low-stock query
- [x] Customer module: CRUD, search, pagination
- [x] Sales module: transactional stock deduction, grand total calc, sale history
- [x] Dashboard stats API

### Product API

| Method | Route                | Access                   | Notes                                                |
| ------ | -------------------- | ------------------------ | ---------------------------------------------------- |
| GET    | /api/v1/products     | admin, manager, employee | `?search=&category=&page=&limit=&sortBy=&sortOrder=` |
| GET    | /api/v1/products/:id | admin, manager, employee |                                                      |
| POST   | /api/v1/products     | admin, manager           | multipart/form-data, `image` field required          |
| PUT    | /api/v1/products/:id | admin, manager           | multipart/form-data, `image` optional                |
| DELETE | /api/v1/products/:id | admin, manager           | also deletes the image file                          |

### Customer API

| Method | Route                 | Access                   | Notes                                                                                       |
| ------ | --------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| GET    | /api/v1/customers     | admin, manager, employee | employee needs read access to pick a customer during sale creation; `?search=&page=&limit=` |
| GET    | /api/v1/customers/:id | admin, manager, employee |                                                                                             |
| POST   | /api/v1/customers     | admin, manager           | unique phone enforced                                                                       |
| PUT    | /api/v1/customers/:id | admin, manager           |                                                                                             |
| DELETE | /api/v1/customers/:id | admin, manager           |                                                                                             |

### Sales API

| Method | Route             | Access                   | Notes                                                    |
| ------ | ----------------- | ------------------------ | -------------------------------------------------------- |
| POST   | /api/v1/sales     | admin, manager, employee | body: `{ customerId, items: [{ productId, quantity }] }` |
| GET    | /api/v1/sales     | admin, manager           | sale history, paginated                                  |
| GET    | /api/v1/sales/:id | admin, manager           | populated with customer + soldBy                         |

**How stock safety works:** each sale runs inside a MongoDB transaction (`session.withTransaction`).
For every line item, stock is decremented with an atomic conditional update
(`findOneAndUpdate({ _id, stockQuantity: { $gte: quantity } }, { $inc: ... })`) so two simultaneous
sales can never oversell the same product — one fails with "insufficient stock" and the whole sale
(including any other items already processed in that request) is rolled back.

> ⚠️ **Transactions require a MongoDB replica set** (Atlas provides this by default). A plain
> standalone local `mongod` will throw `Transaction numbers are only allowed on a replica set member`.
> For local dev, either point `MONGO_URI` at an Atlas cluster, or run Mongo as a single-node replica set:
>
> ```bash
> mongod --replSet rs0 --dbpath ./data
> # then, in a mongosh shell, one-time:
> rs.initiate()
> ```

## Next up

- [ ] Backend feature-complete. Remaining work: frontend (React + Redux + TanStack Query), README polish for submission, API docs export.

### Dashboard API

| Method | Route                   | Access         | Notes                                                                                                                   |
| ------ | ----------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| GET    | /api/v1/dashboard/stats | admin, manager | `{ totalProducts, totalCustomers, totalSales, lowStockCount, lowStockProducts: [...] }` (low stock = stockQuantity < 5) |

## Backend module checklist vs spec

- [x] JWT auth (login, protected routes)
- [x] Role-based authorization (admin / manager / employee) via reusable `authorize()` middleware
- [x] Product CRUD + required image upload + search + pagination
- [x] Sale creation with automatic stock reduction, insufficient-stock prevention, grand total, sale history — all atomic via MongoDB transactions
- [x] Dashboard stats (Total Products, Total Customers, Total Sales, Low Stock < 5)
- [x] Consistent API response structure, proper HTTP status codes, centralized error handling, input validation (Zod)
- [x] Bonus: Modular feature-based architecture (Controller → Service → Repository), generic reusable `QueryBuilder`, generic `BaseRepository`, global error handler, reusable `ApiResponse`/`ApiError`/`asyncHandler`
