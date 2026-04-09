# 🔍 FindIt — Smart Lost & Found Portal for College

A modern, production-grade Lost & Found portal built for college campuses. Features smart matching, ownership verification, and an admin review system.

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4) ![Vite](https://img.shields.io/badge/Vite-5-646CFF)

---

## 📁 Project Structure

```
findit/
├── public/                     # Static assets
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── common/             # Shared reusable components
│   │   │   ├── ConfidenceIndicator.tsx   # Match confidence score UI
│   │   │   ├── EmptyState.tsx           # Empty state illustrations
│   │   │   ├── SkeletonCard.tsx         # Loading skeleton placeholders
│   │   │   ├── StatusBadge.tsx          # Status chips (Lost/Found/Claimed/Verified)
│   │   │   └── ThemeToggle.tsx          # Dark/Light mode toggle
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx               # Top navigation bar
│   │   │   └── Layout.tsx               # Main page layout wrapper
│   │   │
│   │   └── ui/                 # shadcn/ui primitives (button, card, dialog, etc.)
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.tsx               # Mobile breakpoint detection
│   │   └── use-toast.ts                 # Toast notification hook
│   │
│   ├── lib/                    # Utility functions
│   │   └── utils.ts                     # cn() helper, misc utilities
│   │
│   ├── pages/                  # Route-level page components
│   │   ├── Index.tsx                    # Dashboard — hero, stats, smart matches
│   │   ├── Feed.tsx                     # Lost & Found feed with filters
│   │   ├── ReportItem.tsx               # Multi-step report form (6 steps)
│   │   ├── ClaimItem.tsx                # Ownership verification stepper (4 steps)
│   │   ├── Admin.tsx                    # Admin panel — review & approve claims
│   │   ├── Login.tsx                    # Auth page (college email restriction)
│   │   └── NotFound.tsx                 # 404 page
│   │
│   ├── test/                   # Test setup & test files
│   │
│   ├── App.tsx                 # Root component with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles, CSS variables, design tokens
│
├── tailwind.config.ts          # Tailwind theme (colors, animations, glassmorphism)
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## 🚀 Getting Started (Frontend Only)

### Prerequisites

- **Node.js** ≥ 18
- **npm**, **yarn**, **pnpm**, or **bun**

### Install & Run

```bash
# Clone the repository
git clone <your-repo-url>
cd findit

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:8080**

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔧 Completing the MERN Backend

To make this a full-stack app, you'll need a **Node.js + Express + MongoDB** backend.

### Recommended Backend Structure

```
server/
├── config/
│   └── db.js                # MongoDB connection
│
├── controllers/
│   ├── authController.js    # Login, signup, token management
│   ├── itemController.js    # CRUD for lost/found items
│   ├── claimController.js   # Claim submission & verification
│   └── adminController.js   # Admin approve/reject actions
│
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── upload.js            # Multer config for image uploads
│   └── errorHandler.js      # Centralized error handling
│
├── models/
│   ├── User.js              # User schema (name, email, role, verified)
│   ├── Item.js              # Item schema (title, category, location, status, images)
│   └── Claim.js             # Claim schema (answers, proof images, status, confidence)
│
├── routes/
│   ├── auth.js              # POST /api/auth/login, /api/auth/signup
│   ├── items.js             # GET/POST/PUT/DELETE /api/items
│   ├── claims.js            # POST /api/claims, GET /api/claims/:id
│   └── admin.js             # GET /api/admin/claims, PUT /api/admin/claims/:id
│
├── utils/
│   └── matchingEngine.js    # Smart matching algorithm (similarity scoring)
│
├── .env                     # Environment variables
├── server.js                # Express app entry point
└── package.json
```

### Backend Setup Steps

```bash
# Navigate to server directory
cd server

# Initialize and install dependencies
npm init -y
npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer

# Create .env file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/findit
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:8080
EOF

# Start the server
node server.js
```

### Connecting Frontend to Backend

1. **Create an API utility** in the frontend:

```ts
// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  get: (path: string) => fetch(`${API_BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(res => res.json()),

  post: (path: string, body: any) => fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(body)
  }).then(res => res.json()),
};
```

2. **Add the API URL** to your `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

3. **Update Vite proxy** (optional, to avoid CORS in dev):

```ts
// vite.config.ts — add to server config
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

### Key API Endpoints to Implement

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register with @college.edu email |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/items` | List items (with filters) |
| `POST` | `/api/items` | Report a lost/found item |
| `GET` | `/api/items/:id` | Get item details |
| `POST` | `/api/claims` | Submit ownership claim |
| `GET` | `/api/claims/:id` | Get claim status |
| `GET` | `/api/admin/claims` | List pending claims (admin) |
| `PUT` | `/api/admin/claims/:id` | Approve/reject claim (admin) |
| `GET` | `/api/matches/:itemId` | Get smart matches for an item |

---

## 🎨 Design System

| Token | Light | Dark |
|-------|-------|------|
| Primary | Teal `173 80% 40%` | Teal `173 80% 40%` |
| Background | `180 20% 99%` | `200 20% 6%` |
| Glass | `backdrop-blur-xl` | `backdrop-blur-xl` |

The app uses **glassmorphism**, **soft shadows**, and **gradient accents** throughout. All colors are defined as CSS custom properties in `src/index.css` and mapped in `tailwind.config.ts`.

---

## 🧪 Running Tests

```bash
npm run test
```

---

## 📄 License

MIT
