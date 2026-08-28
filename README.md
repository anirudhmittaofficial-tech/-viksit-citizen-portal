# 🏙️ Smart Civic Resolution Platform

A production-ready full-stack civic issue reporting and resolution tracking platform built with **React (Vite)**, **Node.js (Express)**, **MongoDB Atlas**, **Google Maps Geocoding API**, and **Leaflet**.

---

## 📁 Repository Structure

```text
viksit project/
├── 📂 frontend/                  # React + Vite Frontend Application
│   ├── 📂 src/                   # Components, Pages, Contexts, Utilities
│   ├── .env.example              # Sample frontend environment variables
│   ├── index.html                # HTML entry point
│   └── package.json              # Frontend dependencies
│
├── 📂 backend/                   # Node.js + Express REST API Server
│   ├── 📂 config/                # MongoDB Atlas connection
│   ├── 📂 controllers/           # Auth, Complaints, Admin, Notification logic
│   ├── 📂 middleware/            # JWT auth & error handling
│   ├── 📂 models/                # Mongoose models (User, Complaint, Notification)
│   ├── 📂 routes/                # API route definitions
│   ├── .env.example              # Sample backend environment template
│   ├── seed.js                   # Database seed script
│   └── server.js                 # Express server entry point
│
├── .gitignore                    # Security exclusions for Git
├── .env.example                  # Combined root environment template
└── README.md                     # Project documentation
```

---

## 🚀 Quick Setup & Installation Guide

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-civic-resolution-platform.git
cd smart-civic-resolution-platform
```

---

### 2. Install Dependencies

You can install dependencies for both **frontend** and **backend** at once from the root directory:

```bash
# Install both Frontend & Backend dependencies
npm run install:all
```

Or install separately:

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

---

### 3. Environment Variables Configuration

#### 🔹 Backend Configuration (`backend/.env`)

Copy `backend/.env.example` to create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your actual connection details:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET_KEY
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
```

#### 🔹 Frontend Configuration (`frontend/.env`)

Copy `frontend/.env.example` to create `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

---

### 4. Seed Database (Optional)

Populate MongoDB Atlas with sample civic complaints, default users, and initial audit logs:

```bash
npm run seed:backend
```

---

### 5. Run Development Servers

Launch the application locally from the root folder:

```bash
# Start Frontend Dev Server (http://localhost:5173)
npm run dev:frontend

# Start Backend Express API (http://localhost:5000)
npm run dev:backend
```

---

## 🔐 Security & Environment Protection

This repository strictly enforces GitHub Security Best Practices:
- ❌ **No Hardcoded API Keys or Secrets**: All API keys, database URIs, and JWT secrets are loaded via environment variables (`process.env` in Node.js, `import.meta.env` in Vite).
- 🛡️ **`.gitignore` Rules**: `.env`, `node_modules/`, `dist/`, `build/`, `uploads/`, and system log files are completely ignored.
- 📋 **`.env.example` Templates**: Safe environment templates provided for seamless local setup.

---

## 🔑 Default Credentials (After Seeding)

| Role | Email | Password | Department / Auth Code |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@civic.org` | `password123` | N/A |
| **Government Admin** | `admin@pwd.gov.in` | `adminpassword` | `PWD-2026` |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React-Leaflet, Lucide Icons, Axios, Speech Recognition
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), JWT Auth, Multer, Helmet
