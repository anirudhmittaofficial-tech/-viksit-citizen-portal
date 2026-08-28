# Smart Civic Resolution Platform - Backend API

Production-ready Node.js + Express + MongoDB Atlas backend powering the Smart Civic Resolution Engine 2026.

---

## 📁 Directory Structure

```text
/server
├── config/
│   └── db.js                 # MongoDB Atlas connection via Mongoose
├── controllers/
│   ├── adminController.js     # Dashboard stats, SLA metrics & officer dispatch queries
│   ├── authController.js      # JWT Auth for Citizen & Government Admin
│   ├── complaintController.js # Issue registration, search tracking & status updates
│   └── notificationController.js # Citizen notifications & read tracking
├── middleware/
│   ├── auth.js               # JWT verification & role-based authorization
│   └── errorMiddleware.js    # Centralized error handler & 404 handler
├── models/
│   ├── Complaint.js          # Complaint schema with timeline audit trail
│   ├── Notification.js       # Notification schema
│   └── User.js               # User schema with bcrypt password hashing & roles
├── routes/
│   ├── adminRoutes.js        # Admin stats & officer list endpoints
│   ├── authRoutes.js         # Authentication endpoints
│   ├── complaintRoutes.js    # Complaint management endpoints
│   └── notificationRoutes.js # Notification management endpoints
├── .env                      # Environment configuration
├── .env.example              # Sample environment template
├── package.json              # Server dependencies & scripts
├── seed.js                   # Database seeder script
└── server.js                 # Main Express server entry point
```

---

## ⚡ Setup & Quickstart

### 1. Install Dependencies
Navigate to the `server` directory and install NPM packages:
```bash
cd server
npm install
```

### 2. Environment Configuration (`.env`)
Update `server/.env` with your MongoDB Atlas Connection String and JWT secret:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET_KEY
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed Database (Optional)
Populate MongoDB Atlas with seed users, default complaints, and sample notifications:
```bash
npm run seed
```

### 4. Start Development Server
Run the Express server in watch mode:
```bash
npm run dev
# Or for production:
npm start
```
The backend API will run on `http://localhost:5000`.

---

## 🔑 Default Credentials (After Seeding)

| Role | Email | Password | Auth Code / Dept |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@civic.org` | `password123` | N/A |
| **Government Admin** | `admin@pwd.gov.in` | `adminpassword` | `PWD-2026` |

---

## 🔗 Key API Endpoints

### 🔐 Auth (`/api/auth`)
- `POST /api/auth/citizen/register` - Register a new citizen
- `POST /api/auth/citizen/login` - Login citizen & obtain JWT
- `POST /api/auth/admin/register` - Register a new government admin officer
- `POST /api/auth/admin/login` - Login admin officer with department credentials
- `GET /api/auth/me` - Fetch profile of logged-in user *(Bearer Token Required)*

### 📋 Complaints (`/api/complaints`)
- `POST /api/complaints` - Register new issue (auto-generates `CMP-2026-XXXX`)
- `GET /api/complaints` - Search/List complaints (Supports `?search=`, `?category=`, `?status=`, `?department=`)
- `GET /api/complaints/my` - Fetch logged-in citizen's complaints *(Bearer Token Required)*
- `GET /api/complaints/:id` - Fetch complaint by ID or `CMP-2026-XXXX` tracking code
- `PUT /api/complaints/:id/assign` - Assign field officer & update timeline *(Admin Token Required)*
- `PUT /api/complaints/:id/status` - Update status (e.g. `Resolved`, `In Progress`) & add audit note *(Admin Token Required)*

### 🔔 Notifications (`/api/notifications`)
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark specific notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### 📊 Admin Dashboard (`/api/admin`)
- `GET /api/admin/stats` - Fetch real-time dashboard metrics & SLA resolution statistics *(Admin Token Required)*
- `GET /api/admin/officers` - Fetch list of department field officers *(Admin Token Required)*

---

## 🔌 Connecting to React Frontend

In your React frontend, update your API base URL:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```
Attach the JWT token received on login in request headers:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```
