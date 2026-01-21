# Supabase Email Template Customization

## Steps to Customize Email Templates

### 1. Go to Supabase Dashboard

Navigate to: [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **Email Templates**

### 2. Customize Email Templates

You'll see several email templates. The main ones to customize are:

#### A. **Confirm Signup** (Email Confirmation)

Click on "Confirm signup" template and replace the content with:

**Subject:**
```
Confirm Your Resumyx Account
```

**Message Body (HTML):**
```html
<h2>Welcome to Resumyx!</h2>

<p>Thank you for signing up for Resumyx - your AI-powered resume builder.</p>

<p>To complete your registration and start building your perfect resume, please confirm your email address by clicking the button below:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Confirm Your Email</a></p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't create an account with Resumyx, you can safely ignore this email.</p>

<hr>

<p style="color: #666; font-size: 12px;">
This is an automated message from Resumyx<br>
<a href="https://resumyx.vercel.app">https://resumyx.vercel.app</a>
</p>
```

#### B. **Invite User** (User Invitation)

**Subject:**
```
You've been invited to Resumyx
```

**Message Body:**
```html
<h2>You've Been Invited to Resumyx!</h2>

<p>You've been invited to join Resumyx - the AI-powered resume builder.</p>

<p>Click the button below to accept the invitation and create your account:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Accept Invitation</a></p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<hr>

<p style="color: #666; font-size: 12px;">
This is an automated message from Resumyx<br>
<a href="https://resumyx.vercel.app">https://resumyx.vercel.app</a>
</p>
```

#### C. **Magic Link** (Passwordless Login)

**Subject:**
```
Your Resumyx Login Link
```

**Message Body:**
```html
<h2>Sign in to Resumyx</h2>

<p>Click the button below to sign in to your Resumyx account:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Sign In</a></p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request this link, you can safely ignore this email.</p>

<hr>

<p style="color: #666; font-size: 12px;">
This is an automated message from Resumyx<br>
<a href="https://resumyx.vercel.app">https://resumyx.vercel.app</a>
</p>
```

#### D. **Change Email Address**

**Subject:**
```
Confirm Your New Email Address - Resumyx
```

**Message Body:**
```html
<h2>Confirm Your New Email Address</h2>

<p>You recently requested to change your email address for your Resumyx account.</p>

<p>Click the button below to confirm your new email address:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Confirm New Email</a></p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't request this change, please contact us immediately.</p>

<hr>

<p style="color: #666; font-size: 12px;">
This is an automated message from Resumyx<br>
<a href="https://resumyx.vercel.app">https://resumyx.vercel.app</a>
</p>
```

#### E. **Reset Password**

**Subject:**
```
Reset Your Resumyx Password
```

**Message Body:**
```html
<h2>Reset Your Password</h2>

<p>You recently requested to reset your password for your Resumyx account.</p>

<p>Click the button below to reset your password:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a></p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request a password reset, you can safely ignore this email.</p>

<hr>

<p style="color: #666; font-size: 12px;">
This is an automated message from Resumyx<br>
<a href="https://resumyx.vercel.app">https://resumyx.vercel.app</a>
</p>
```

### 3. Configure Redirect URLs

**IMPORTANT:** Configure the Site URL and Redirect URLs to point to your production site:

1. Go to: **Authentication** → **URL Configuration**

2. Set the following:

   - **Site URL:** `https://resumyx.vercel.app`
   - **Redirect URLs:** Add these URLs (one per line):
     ```
     https://resumyx.vercel.app
     https://resumyx.vercel.app/**
     http://localhost:5173
     http://localhost:5173/**
     http://localhost:3000
     http://localhost:3000/**
     ```

### 4. Customize Email Settings

Go to: **Project Settings** → **Authentication** → **Email Auth**

Configure:
- ✅ **Enable Email Confirmations** - Turn ON to require email verification
- ⏱️ **Confirmation Email Expiry** - 24 hours (default)
- 🔄 **Enable Email Change Confirmations** - Turn ON for security

### 5. Test the Email

After saving the templates:

1. Register a new account at https://resumyx.vercel.app
2. Check your email inbox
3. Verify that:
   - ✅ Email mentions "Resumyx" instead of "Supabase"
   - ✅ Link goes to `https://resumyx.vercel.app` (not localhost)
   - ✅ Branding matches your site

## Optional: Custom SMTP (Advanced)

If you want to use your own email server instead of Supabase's:

1. Go to: **Project Settings** → **Authentication** → **SMTP Settings**
2. Configure your SMTP provider (e.g., SendGrid, AWS SES, Mailgun)
3. This gives you full control over email delivery and branding

## Template Variables Available

You can use these variables in your email templates:

- `{{ .ConfirmationURL }}` - The confirmation/action link
- `{{ .Token }}` - The raw token (for custom flows)
- `{{ .TokenHash }}` - Hashed version of the token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

## Notes

- Changes to email templates take effect immediately
- Test thoroughly before sending to real users
- Keep a backup of your original templates
- The `{{ .ConfirmationURL }}` variable is automatically generated by Supabase and will use your configured Site URL

## Troubleshooting

**Issue: Links still go to localhost**
- Check that Site URL is set to `https://resumyx.vercel.app` (no trailing slash)
- Make sure you saved the URL Configuration changes

**Issue: Emails look plain**
- HTML is supported in Supabase email templates
- Use inline CSS for styling (external stylesheets aren't supported)

**Issue: Emails not arriving**
- Check your spam/junk folder
- Verify email provider isn't blocking Supabase's email server
- Consider setting up custom SMTP for better deliverability
