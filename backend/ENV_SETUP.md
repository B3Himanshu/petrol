# Environment Setup Guide

## 🔐 Password URL Encoding for Google Cloud SQL

Your password contains special characters that **must be URL-encoded** in the `DATABASE_URL`:

**Original password:** `6H]8KUf@NL>L~t|`

**URL-encoded password:** `6H%5D8KUf%40NL%3EL~t%7C`

### Special Character Encoding:
- `]` → `%5D`
- `@` → `%40`
- `>` → `%3E`
- `|` → `%7C`

## ✅ Correct .env File Format

### Option 1: Using DATABASE_URL (Recommended)

```env
# Replace 'your_username' with your actual database username
DATABASE_URL=postgresql://your_username:6H%5D8KUf%40NL%3EL~t%7C@104.198.46.255:5432/pridashboard?sslmode=require

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### Option 2: Using Individual Settings

```env
DB_HOST=104.198.46.255
DB_PORT=5432
DB_NAME=pridashboard
DB_USER=your_username
DB_PASSWORD=6H]8KUf@NL>L~t|

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

## ⚠️ Important Notes

1. **Username Required**: Replace `your_username` with your actual Google Cloud SQL username
2. **SSL Required**: Google Cloud SQL requires SSL connections (already configured in code)
3. **Password Encoding**: Only needed in `DATABASE_URL`, not in `DB_PASSWORD`

## 🔍 Finding Your Username

Your Google Cloud SQL username is typically:
- The username you created when setting up the instance
- Check Google Cloud Console → SQL → Users
- Or check your connection settings in Google Cloud Console

## 🧪 Test Connection

After updating your `.env` file:

```bash
npm run test-db
```

If you still get errors:
1. Verify your username is correct
2. Check that your IP is whitelisted in Google Cloud SQL (if required)
3. Ensure the database name is correct (`pridashboard`)

