# Authentication System

## Overview

MovieMeter uses a simplified email-based authentication system. Users can sign in or create an account using just their email address—no password or email verification required.

## How It Works

1. **User enters email** on the login page (`/login`)
2. **Email validation** checks if the format is valid
3. **Auto-create or login**:
   - If email doesn't exist → Creates new user account
   - If email exists → Logs in existing user
4. **Session created** using JWT tokens
5. **User redirected** to homepage

## Benefits

- ✅ **No password management** - Users don't need to remember passwords
- ✅ **No email verification** - Instant access
- ✅ **No SMTP configuration** - No email server needed
- ✅ **Simple UX** - Just enter email and go
- ✅ **Auto-registration** - New users created automatically

## Security Considerations

This is a **simplified authentication system** suitable for:
- Development environments
- Internal tools
- Non-sensitive applications
- Prototypes and MVPs

### Limitations

- **No email verification** - Anyone can claim any email address
- **No password protection** - Anyone who knows an email can access that account
- **Session-based only** - Security depends on JWT token protection

### For Production

If you need stronger security for production, consider:

1. **Add email verification** - Implement magic link or OTP
2. **Add passwords** - Use bcrypt for password hashing
3. **Add 2FA** - Two-factor authentication
4. **Rate limiting** - Prevent brute force attempts (already implemented)
5. **IP blocking** - Block suspicious IPs
6. **Social OAuth** - Google, GitHub, etc.

## User Flow

```
┌─────────────────┐
│  User visits    │
│   /login page   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enters email    │
│ (validated)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│ Check if user   │────▶│ User exists? │
│ exists in DB    │     └──────┬───────┘
└─────────────────┘            │
                               ├─── Yes ──▶ Update lastLoginAt
                               │
                               └─── No ───▶ Create new user
                                            (email, auto-generate name)
         │
         ▼
┌─────────────────┐
│ Create JWT      │
│ session token   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│ homepage        │
└─────────────────┘
```

## Code Structure

### Auth Configuration
**File:** `lib/auth/config.ts`

- Uses NextAuth with Credentials provider
- Validates email format
- Creates/finds user in database
- Issues JWT tokens

### Login Page
**File:** `app/login/page.tsx`

- Client-side form
- Email input with validation
- Calls `signIn("email-login", { email })`
- Shows success/error messages
- Auto-redirects on success

### Database
**Model:** `User` (in Prisma schema)

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  role        Role     @default(USER)
  isBanned    Boolean  @default(false)
  lastLoginAt DateTime?
  // ... other fields
}
```

## Environment Variables

Only these are required for authentication:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
DATABASE_URL="postgresql://..."
```

**No email server configuration needed!**

## API Endpoints

### Login
**Endpoint:** `POST /api/auth/callback/email-login`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** Sets session cookie, returns redirect URL

### Session
**Endpoint:** `GET /api/auth/session`

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "user",
    "role": "USER",
    "isBanned": false
  },
  "expires": "2024-02-20T00:00:00.000Z"
}
```

## Customization

### Change Default Username
Edit `lib/auth/config.ts`:

```typescript
name: email.split('@')[0],  // Current: uses part before @
// Options:
// name: "Anonymous User",  // Fixed name
// name: `User_${Date.now()}`,  // Timestamped
// name: null,  // No name
```

### Add Custom Validation
Edit `lib/auth/config.ts`:

```typescript
async authorize(credentials) {
  // Add custom checks
  if (email.endsWith('@blocked-domain.com')) {
    throw new Error('Domain not allowed');
  }
  
  // Add whitelist
  const allowedEmails = ['user@example.com', ...];
  if (!allowedEmails.includes(email)) {
    return null;
  }
  
  // ... rest of code
}
```

### Change Redirect
Edit `app/login/page.tsx`:

```typescript
window.location.href = "/";  // Change to any route
```

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login`

3. Enter any valid email format:
   - `test@example.com`
   - `user123@test.io`
   - etc.

4. You'll be logged in immediately and redirected to the homepage

5. Check the database:
   ```bash
   npm run db:studio
   ```
   You'll see the user created with the email you entered.

## Troubleshooting

### "Invalid email format"
- Check email follows standard format: `user@domain.com`
- No spaces or special characters except @ and .

### "An unexpected error occurred"
- Check database is running
- Check `DATABASE_URL` in `.env.local`
- Check Prisma is generated: `npm run db:generate`

### Session not persisting
- Check `NEXTAUTH_SECRET` is set in `.env.local`
- Clear browser cookies and try again
- Check browser console for errors

### User not created in database
- Check database connection
- Run migrations: `npm run db:migrate`
- Check Prisma Studio: `npm run db:studio`
