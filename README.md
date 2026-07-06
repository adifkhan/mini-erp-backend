# Mini ERP — Backend

📄 Full endpoint reference: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Architecture
Controller → Service → Repository → MongoDB (Mongoose)

- **Controller**: request/response only, no business logic
- **Service**: business logic, orchestrates repositories
- **Repository**: raw DB queries only (extends a generic `BaseRepository<T>`)

## Setup
```bash
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, and Cloudinary credentials
npm install
npm run seed   # creates admin@minierp.com / Admin@123
npm run dev
```

Product images are uploaded to **Cloudinary**, not local disk — sign up free at
[cloudinary.com](https://cloudinary.com), grab your Cloud Name / API Key / API Secret from
the dashboard, and put them in `.env` as `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` /
`CLOUDINARY_API_SECRET`. This isn't optional — `POST /products` and `PUT /products/:id`
will fail without it, and it's required for deploying to Vercel (see below).

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
- [x] Product module: CRUD, image upload to Cloudinary (memory-buffered, no local disk), search, pagination, low-stock query
- [x] Customer module: CRUD, search, pagination
- [x] Sales module: transactional stock deduction, grand total calc, sale history
- [x] Dashboard stats API

### Product API
| Method | Route               | Access                | Notes                              |
|--------|---------------------|------------------------|-------------------------------------|
| GET    | /api/v1/products     | admin, manager, employee | `?search=&category=&page=&limit=&sortBy=&sortOrder=` |
| GET    | /api/v1/products/:id | admin, manager, employee | |
| POST   | /api/v1/products     | admin, manager         | multipart/form-data, `image` field required (uploaded to Cloudinary server-side) |
| PUT    | /api/v1/products/:id | admin, manager         | multipart/form-data, `image` optional |
| DELETE | /api/v1/products/:id | admin, manager         | also deletes the Cloudinary asset |

### Customer API
| Method | Route                | Access                    | Notes |
|--------|-----------------------|----------------------------|-------|
| GET    | /api/v1/customers      | admin, manager, employee | employee needs read access to pick a customer during sale creation; `?search=&page=&limit=` |
| GET    | /api/v1/customers/:id  | admin, manager, employee | |
| POST   | /api/v1/customers      | admin, manager           | unique phone enforced |
| PUT    | /api/v1/customers/:id  | admin, manager           | |
| DELETE | /api/v1/customers/:id  | admin, manager           | |

### Sales API
| Method | Route            | Access                    | Notes |
|--------|-------------------|----------------------------|-------|
| POST   | /api/v1/sales      | admin, manager, employee | body: `{ customerId, items: [{ productId, quantity }] }` |
| GET    | /api/v1/sales      | admin, manager           | sale history, paginated |
| GET    | /api/v1/sales/:id  | admin, manager           | populated with customer + soldBy |

**How stock safety works:** each sale runs inside a MongoDB transaction (`session.withTransaction`).
For every line item, stock is decremented with an atomic conditional update
(`findOneAndUpdate({ _id, stockQuantity: { $gte: quantity } }, { $inc: ... })`) so two simultaneous
sales can never oversell the same product — one fails with "insufficient stock" and the whole sale
(including any other items already processed in that request) is rolled back.

> ⚠️ **Transactions require a MongoDB replica set** (Atlas provides this by default). A plain
> standalone local `mongod` will throw `Transaction numbers are only allowed on a replica set member`.
> For local dev, either point `MONGO_URI` at an Atlas cluster, or run Mongo as a single-node replica set:
> ```bash
> mongod --replSet rs0 --dbpath ./data
> # then, in a mongosh shell, one-time:
> rs.initiate()
> ```

## Deploying to Vercel

This backend runs on Vercel as a single serverless function (`api/index.ts`) that wraps
the same Express app used for local dev (`src/app.ts`) — `vercel.json` rewrites every
incoming path to that function while Express still sees and routes on the original URL.

**Why this needed changes from a "normal" Express app:**
- Vercel functions don't run `app.listen()` — `api/index.ts` exports a handler instead;
  `server.ts` (with `app.listen`) is only used for local `npm run dev`.
- Vercel's filesystem is read-only (except an ephemeral `/tmp`), so product images can't
  be written to disk — that's why image uploads use `multer.memoryStorage()` and stream
  straight to Cloudinary instead (see `utils/cloudinaryUpload.ts`).
- `connectDB()` is idempotent (checks `mongoose.connection.readyState` first) so it's
  safe to call on every invocation — on a warm container it's a no-op instead of
  reconnecting to MongoDB on every request.

**Steps:**
1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo → Framework Preset: **Other**.
3. Add environment variables (Project Settings → Environment Variables): `MONGO_URI`,
   `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your deployed frontend's URL, for CORS),
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. Deploy. Your API will be live at `https://<project>.vercel.app/api/v1/...`.
5. Run `npm run seed` once against that same `MONGO_URI` (from your local machine, pointed
   at the same Atlas cluster) to create the admin user — there's no seed endpoint exposed
   over HTTP.

**Known Vercel-specific limits to keep in mind:**
- Request body size is capped (4.5MB on Hobby) — the image upload limit was set to 4MB
  in `middlewares/upload.middleware.ts` to stay under that with room for the rest of the
  multipart payload.
- Cold starts add latency to the first request after idle — expected for a free-tier demo,
  not a bug.

### Dashboard API
| Method | Route                  | Access          | Notes |
|--------|-------------------------|------------------|-------|
| GET    | /api/v1/dashboard/stats | admin, manager | `{ totalProducts, totalCustomers, totalSales, lowStockCount, lowStockProducts: [...] }` (low stock = stockQuantity < 5) |

## Backend module checklist vs spec
- [x] JWT auth (login, protected routes)
- [x] Role-based authorization (admin / manager / employee) via reusable `authorize()` middleware
- [x] Product CRUD + required image upload (Cloudinary) + search + pagination
- [x] Sale creation with automatic stock reduction, insufficient-stock prevention, grand total, sale history — all atomic via MongoDB transactions
- [x] Dashboard stats (Total Products, Total Customers, Total Sales, Low Stock < 5)
- [x] Consistent API response structure, proper HTTP status codes, centralized error handling, input validation (Zod)
- [x] Bonus: Modular feature-based architecture (Controller → Service → Repository), generic reusable `QueryBuilder`, generic `BaseRepository`, global error handler, reusable `ApiResponse`/`ApiError`/`asyncHandler`
- [x] Deployed as a Vercel serverless function with idempotent DB connection reuse
