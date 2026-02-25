

# Smart Lost & Found Portal — Implementation Plan

## Overview
Build a complete React frontend in Lovable that connects to an Express/MongoDB backend. The backend code will be provided separately for local setup.

---

## Frontend (Built in Lovable)

### Pages

1. **Home Page** (`/`)
   - Hero section with title and search bar
   - Filter tabs: All | Lost | Found
   - Grid of item cards showing image, name, category, location, date, and status badge
   - Search filters items by keyword in real-time

2. **Report Item Page** (`/report`)
   - Form with fields: Item Name, Category (dropdown), Description, Location, Date, Image URL, Contact Info, Type (Lost/Found)
   - Form validation using react-hook-form + zod
   - Success toast on submission

3. **Item Details Page** (`/items/:id`)
   - Full item details display
   - "Submit a Claim" form at the bottom (name, contact, message)
   - Status badge (Active / Resolved)

4. **Admin Page** (`/admin`)
   - Table listing all items with status
   - Actions: Mark as Resolved, Delete
   - View claims for each item

### Layout & Navigation
- Top navbar with links: Home, Report Item, Admin
- Clean, minimal academic-style design using shadcn/ui components
- Responsive layout

### API Service Layer
- `src/services/api.ts` — Axios instance with base URL from env variable
- Functions for all CRUD operations (items + claims)
- Fallback mock data when backend is unavailable so the app works standalone in preview

---

## Backend (Provided as code files)

### Structure
```
backend/
  server.js
  config/db.js
  models/Item.js
  models/Claim.js
  controllers/itemController.js
  controllers/claimController.js
  routes/itemRoutes.js
  routes/claimRoutes.js
  middleware/errorHandler.js
  .env.example
  package.json
```

### API Endpoints
- Full CRUD for items including search and resolve
- Claims creation and listing
- CORS enabled, error handling middleware

### Setup
- README with instructions to install dependencies, set MongoDB URI, and run both frontend and backend

