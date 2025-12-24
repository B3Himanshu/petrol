# Petroleum Dashboard Project

A full-stack business intelligence dashboard for petroleum/fuel station operations.

## 📁 Project Structure

```
ui-enhancement-studio/
├── frontend/          # React frontend application
│   ├── src/          # React source code
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── vite.config.mjs
│
└── backend/          # Node.js/Express backend API
    ├── routes/       # API routes
    ├── config/       # Database configuration
    ├── utils/        # Utility functions
    ├── package.json  # Backend dependencies
    └── server.js     # Express server
```

## 🚀 Quick Start

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:8080`

### Backend Setup

```bash
cd backend
npm install

# Configure .env file (see backend/ENV_SETUP.md)
# Add your database connection details

npm run dev
```

Backend runs on: `http://localhost:3001`

## 📚 Documentation

- **Backend API**: See `backend/API_DOCUMENTATION.md`
- **Backend Setup**: See `backend/SETUP_GUIDE.md`
- **Database Setup**: See `backend/ENV_SETUP.md`

## 🔧 Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Shadcn/ui
- Recharts
- React Router

### Backend
- Node.js
- Express
- PostgreSQL
- pg (PostgreSQL client)

## 📝 Development

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Access frontend at `http://localhost:8080`
4. API available at `http://localhost:3001`

## 🗄️ Database

The project uses PostgreSQL (Google Cloud SQL). See `backend/ENV_SETUP.md` for connection details.

