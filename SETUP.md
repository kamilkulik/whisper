# Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database URL for Prisma
# For local development, you can use:
# - PostgreSQL: postgresql://username:password@localhost:5432/database_name
# - SQLite: file:./dev.db
# - Vercel Postgres: (will be provided by Vercel)
DATABASE_URL="postgresql://username:password@localhost:5432/wieczorny_szept"

# Cron job secret for authentication
CRON_SECRET=your-secret-key-here

# Add other environment variables as needed
# EMAIL_SERVICE_API_KEY=your-email-service-key
```

## Database Setup

### 1. Install Prisma
```bash
pnpm add prisma @prisma/client
```

### 2. Initialize Prisma
```bash
pnpm prisma init
```

### 3. Set up your database
Choose one of the following options:

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database: `createdb wieczorny_szept`
3. Update DATABASE_URL in `.env`

#### Option B: Vercel Postgres (Recommended for production)
1. Create a Vercel Postgres database in your Vercel dashboard
2. Copy the DATABASE_URL from Vercel
3. Add it to your environment variables

#### Option C: SQLite (for development)
Update your `.env`:
```env
DATABASE_URL="file:./dev.db"
```

### 4. Run database migrations
```bash
pnpm prisma migrate dev --name init
```

### 5. Generate Prisma client
```bash
pnpm prisma generate
```

## Database Schema

The application includes two main tables:

### Users Table
- `id` (SERIAL) - Primary key
- `phone_number` (TEXT) - User's phone number
- `email` (TEXT, UNIQUE) - User's email address
- `name` (TEXT) - User's name
- `trial_ends` (DATE) - Trial expiration date
- `premium` (BOOLEAN) - Premium status
- `last_used_message` (FOREIGN KEY) - Reference to last used message
- `created_at` (DATE) - Creation timestamp
- `updated_at` (DATE) - Last update timestamp

### Messages Table
- `id` (SERIAL) - Primary key
- `message` (TEXT) - Message content
- `length` (INT) - Message length
- `created_at` (DATE) - Creation timestamp
- `updated_at` (DATE) - Last update timestamp

## Features Implemented

### 1. Contact Form
- **Location**: `src/app/components/ContactForm.tsx`
- **Fields**: numer telefonu, email, imię
- **Submit button**: "Wyślij"
- **Features**: 
  - Form validation
  - Loading states
  - Success/error messages
  - Responsive design with dark mode support

### 2. API Handler with Database Integration
- **Route**: `POST /api/messages`
- **Location**: `src/app/api/messages/route.ts`
- **Features**:
  - Input validation (required fields, email format, phone number format)
  - Database integration with Prisma
  - User creation/update logic
  - Error handling and logging

## Deployment

1. **Set up Database**:
   - Create a Vercel Postgres database
   - Add DATABASE_URL to your Vercel environment variables

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Set Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add `CRON_SECRET` with a secure random string
   - Add `DATABASE_URL` from your Vercel Postgres database

4. **Run Database Migrations**:
   ```bash
   vercel env pull .env
   pnpm prisma migrate deploy
   ```

5. **Verify Cron Job**:
   - The cron job will automatically start running daily at 8:00 PM CET
   - You can check the logs in your Vercel dashboard

## Testing

1. **Local Development**:
   ```bash
   pnpm dev
   ```

2. **Test the Form**:
   - Navigate to `http://localhost:3000`
   - Fill out the form and submit
   - Check the database for saved user data

3. **Test the API**:
   ```bash
   curl -X POST http://localhost:3000/api/messages \
     -H "Content-Type: application/json" \
     -d '{"numerTelefonu":"123456789","email":"test@example.com","imie":"Jan"}'
   ```

4. **Test the Cron Job** (requires CRON_SECRET):
   ```bash
   curl -X GET http://localhost:3000/api/cron \
     -H "Authorization: Bearer your-secret-key-here"
   ```

5. **Database Queries**:
   ```bash
   # View all users
   pnpm prisma studio
   ``` 