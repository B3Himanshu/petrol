# Environment Setup Guide

## 🔐 Password URL Encoding for Google Cloud SQL

If your password contains special characters, they **must be URL-encoded** in the `DATABASE_URL`:

### Special Character Encoding:
- `]` → `%5D`
- `@` → `%40`
- `>` → `%3E`
- `|` → `%7C`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

**Note:** Use an online URL encoder or encode your password before adding it to `DATABASE_URL`.

## ✅ Correct .env File Format

### Option 1: Using DATABASE_URL (Recommended)

```env
# Replace placeholders with your actual credentials
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_URL_ENCODED_PASSWORD@YOUR_DB_HOST:5432/YOUR_DB_NAME?sslmode=require

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### Option 2: Using Individual Settings

```env
DB_HOST=YOUR_DB_HOST
DB_PORT=5432
DB_NAME=YOUR_DB_NAME
DB_USER=YOUR_USERNAME
DB_PASSWORD=YOUR_PASSWORD

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

## ⚠️ Important Notes

1. **Username Required**: Replace `your_username` with your actual Google Cloud SQL username
2. **SSL Required**: Google Cloud SQL requires SSL connections (already configured in code)
3. **Password Encoding**: Only needed in `DATABASE_URL`, not in `DB_PASSWORD`

## 🔍 Finding Your Credentials

Your database credentials can be found:
- In your Google Cloud Console → SQL → Users (for username)
- In your Google Cloud Console → SQL → Connections (for host/IP)
- In your database setup documentation
- Contact your database administrator

## 🧪 Test Connection

After updating your `.env` file:

```bash
npm run test-db
```

If you still get errors:
1. Verify your username is correct
2. Check that your IP is whitelisted in Google Cloud SQL (if required)
3. Ensure the database name is correct
4. Verify your password is correctly URL-encoded in `DATABASE_URL` (if using Option 1)

