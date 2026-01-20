# Email Setup Guide

This guide will help you configure email authentication for MovieMeter.

## Quick Setup

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Google account
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate an App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the 16-character password (no spaces)

3. **Add to your `.env.local` file:**

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-character-app-password"
EMAIL_FROM="noreply@moviemeter.com"
```

### Option 2: Other Email Providers

#### SendGrid

```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@moviemeter.com"
```

#### Mailgun

```env
EMAIL_SERVER_HOST="smtp.mailgun.org"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="postmaster@your-domain.mailgun.org"
EMAIL_SERVER_PASSWORD="your-mailgun-smtp-password"
EMAIL_FROM="noreply@moviemeter.com"
```

#### Outlook/Office 365

```env
EMAIL_SERVER_HOST="smtp.office365.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@outlook.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@moviemeter.com"
```

## Verify Configuration

After setting up your `.env.local` file, verify it's working:

```bash
npm run check-env
```

This will check if all required environment variables are set correctly.

## Troubleshooting

### "Failed to send email" Error

1. **Check your environment variables:**
   ```bash
   npm run check-env
   ```

2. **Verify credentials are correct:**
   - For Gmail: Make sure you're using an App Password, not your regular password
   - Check that EMAIL_SERVER_USER matches the email that generated the app password

3. **Check your SMTP settings:**
   - Port 587 (TLS) is usually correct for most providers
   - Port 465 (SSL) may be required for some providers

4. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Gmail-Specific Issues

- **"Less secure app access"**: Gmail no longer supports this. You MUST use App Passwords.
- **"Login denied"**: Check that 2FA is enabled and you're using the correct App Password.
- **Rate limits**: Gmail has sending limits. For production, consider using a transactional email service.

### Common Port Numbers

- **587**: Standard SMTP with TLS (most common)
- **465**: SMTP with SSL
- **25**: Unencrypted SMTP (often blocked)

## Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `/login` and enter your email

3. Check your inbox (and spam folder) for the magic link

## Production Notes

For production, consider using a dedicated email service:

- **SendGrid** - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5,000 emails/month
- **AWS SES** - Very cost-effective, requires verification
- **Postmark** - Excellent deliverability, paid but affordable

These services provide better deliverability and don't have the same rate limits as personal Gmail accounts.
