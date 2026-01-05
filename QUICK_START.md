# 🚀 Quick Start Guide

## ✅ Prerequisites Check

- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed  
- ✅ Backend `.env` file exists

## 🏃 How to Run the Project

### Step 1: Start Backend Server

Open **Terminal 1** (PowerShell):

```powershell
cd "C:\Users\Gaurav Kumar\OneDrive\Desktop\company\newPetroleum\ui-enhancement-studio\backend"
npm run dev
```

Backend will run on: `http://localhost:3001`

### Step 2: Start Frontend Server

Open **Terminal 2** (PowerShell):

```powershell
cd "C:\Users\Gaurav Kumar\OneDrive\Desktop\company\newPetroleum\ui-enhancement-studio\frontend"
npm run dev
```

Frontend will run on: `http://localhost:8080`

### Step 3: Access the Application

Open your browser and go to:
```
http://localhost:8080
```

## ⚠️ Troubleshooting

### Backend won't start
- Check that your database connection in `backend/.env` is correct
- Verify PostgreSQL is accessible
- Run `npm run test-db` to test database connection

### Frontend won't start
- Make sure backend is running first
- Check that port 8080 is not in use
- Try `npm install` again if there are dependency errors

### Can't connect to backend
- Verify backend is running on port 3001
- Check `frontend/.env.local` has correct `VITE_API_URL`
- Check CORS settings in backend

## 📝 Notes

- Keep both terminals open while developing
- Backend must be running before frontend can make API calls
- Database connection is required for backend to work properly
