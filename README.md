# MovieMeter

A production-ready movie review web application built with Next.js 14, TypeScript, Prisma, and Auth.js. Discover movies, read reviews, and share your thoughts with the community.

## Features

- 🎬 **Movie Discovery**: Browse trending and top-rated movies from TMDB
- 🔍 **Search**: Find movies with real-time search
- ⭐ **Reviews**: Rate and review movies (1-10 scale)
- 💬 **Comments**: Discuss reviews with threaded comments
- 🛡️ **Moderation**: Report system and admin moderation tools
- 🔐 **Authentication**: Simple email-based authentication (no password required)
- 📱 **Responsive**: Mobile-first design with Tailwind CSS
- 🚀 **SEO Optimized**: Dynamic metadata, JSON-LD, and canonical URLs

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Auth.js) with Email provider
- **Styling**: Tailwind CSS + shadcn/ui components
- **Validation**: Zod
- **API**: TMDB (The Movie Database)

## Prerequisites

- Node.js 20.12+ (or compatible version)
- PostgreSQL database
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

## Setup

### 1. Clone and Install

```bash
cd moviemeter
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Required environment variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/moviemeter?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32

# TMDB API
TMDB_API_KEY="your-tmdb-api-key-here"
```

**Verify your configuration:**
```bash
npm run check-env
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 4. Create Admin User

After running migrations, you can create an admin user directly in the database:

```sql
-- Update a user to admin role
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or use Prisma Studio to edit the user role.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Getting a TMDB API Key

1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account
3. Go to [Settings > API](https://www.themoviedb.org/settings/api)
4. Request an API key (free tier available)
5. Copy your API key to `.env.local`

**Important**: TMDB requires attribution. Make sure to include the TMDB attribution component in your footer (see `components/seo/TMDBAttribution.tsx`).

## Project Structure

```
moviemeter/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── movie/              # Movie detail pages
│   ├── login/              # Authentication pages
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── movie/              # Movie-related components
│   ├── review/             # Review components
│   └── comment/            # Comment components
├── lib/                    # Core utilities
│   ├── auth/               # Auth configuration
│   ├── db/                 # Database client
│   ├── providers/          # External API clients (TMDB)
│   ├── cache/              # Caching utilities
│   ├── rate-limit/         # Rate limiting
│   └── sanitize/           # Content sanitization
├── prisma/                 # Prisma schema and migrations
└── types/                  # TypeScript types
```

## API Routes

### Movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/top-rated` - Get top rated movies
- `GET /api/movies/search?q=...` - Search movies
- `GET /api/movies/[tmdbId]` - Get movie details
- `GET /api/movies/[tmdbId]/similar` - Get similar movies
- `GET /api/movies/[tmdbId]/stats` - Get movie statistics

### Reviews
- `GET /api/reviews?tmdbId=...` - Get reviews for a movie
- `POST /api/reviews` - Create a review (authenticated)
- `PATCH /api/reviews/[id]` - Update a review (owner/admin)
- `DELETE /api/reviews/[id]` - Delete a review (owner/admin)

### Comments
- `GET /api/reviews/[id]/comments` - Get comments for a review
- `POST /api/reviews/[id]/comments` - Create a comment (authenticated)
- `DELETE /api/comments/[id]` - Delete a comment (owner/admin)

## Caching Strategy

- **TMDB API responses**: Cached for 1 hour (in-memory cache)
- **Movie stats**: Updated on review create/update/delete
- **Search results**: Cached for 30 minutes

For production, consider using Redis for distributed caching.

## Rate Limiting

Rate limits are enforced per user:
- **Reviews**: 5 per hour
- **Comments**: 20 per hour
- **Reports**: 10 per day
- **Auth**: 5 per 15 minutes

## Security Features

- ✅ Input sanitization (XSS prevention)
- ✅ Rate limiting on write endpoints
- ✅ Role-based access control (USER/ADMIN)
- ✅ Content moderation tools
- ✅ Audit logging for admin actions

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Database

For production, use a managed PostgreSQL service:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)
- [Neon](https://neon.tech/)

### Environment Variables

Make sure to set all environment variables in your deployment platform.

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Database migrations
npm run db:migrate

# Prisma Studio (database GUI)
npm run db:studio
```

## Testing

Basic test structure is set up. Add tests in the `__tests__` directory.

## License

MIT

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
