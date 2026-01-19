# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

- **DATABASE_URL**: Your PostgreSQL connection string
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **TMDB_API_KEY**: Get from https://www.themoviedb.org/settings/api
- **EMAIL_***: Your email server credentials (for magic link auth)

## 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Create database (if not exists)
# Then run migrations
npm run db:migrate
```

## 4. Create Admin User

After running migrations, create an admin user:

**Option 1: Using Prisma Studio**
```bash
npm run db:studio
```
Then edit a user's role to `ADMIN`

**Option 2: Using SQL**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Next Steps

- Sign up with email magic link
- Browse movies on the home page
- Search for movies
- Write reviews and comments
- Access admin panel at `/admin` (if you're an admin)

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running
- Verify DATABASE_URL is correct
- Check database exists

### TMDB API Issues
- Verify TMDB_API_KEY is set
- Check API key is valid
- Free tier has rate limits

### Email Not Sending
- Check email server credentials
- For Gmail, use an App Password (not your regular password)
- Verify EMAIL_FROM matches your email

### Build Errors
- Run `npm run db:generate` if Prisma client is missing
- Check Node.js version (20.12+ recommended)
- Clear `.next` folder and rebuild
