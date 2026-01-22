# Faraja Holdings - Render Deployment Guide

## Prerequisites
- GitHub account with the repository pushed
- Render account (free tier available at render.com)
- SMTP credentials (Gmail recommended for order emails)

## Step 1: Create MySQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **PostgreSQL** or use an external MySQL provider like:
   - [Aiven](https://aiven.io) - Free tier available
   - [PlanetScale](https://planetscale.com) - Free tier available
   - [Railway](https://railway.app) - MySQL plugin available

3. Save connection details:
   - Host
   - Port (usually 3306)
   - Username
   - Password
   - Database name

4. Connect to your database and run the schema:
   ```bash
   mysql -h YOUR_HOST -u YOUR_USER -p YOUR_DATABASE < server/schema.sql
   ```

## Step 2: Deploy Web Service on Render

### Option A: Using render.yaml (Recommended)

1. In Render Dashboard, click **New** → **Blueprint**
2. Connect your GitHub repository (Techaria/Faraja)
3. Render will auto-detect `render.yaml` and create the service
4. Fill in the environment variables when prompted

### Option B: Manual Setup

1. In Render Dashboard, click **New** → **Web Service**
2. Connect your GitHub repository (Techaria/Faraja)
3. Configure the service:
   - **Name**: faraja-server
   - **Region**: Choose closest to your users
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter (or Free)

4. Add Environment Variables (click **Advanced** → **Add Environment Variable**):
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=your-mysql-host.com
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=faraja_db
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   COMPANY_EMAIL=orders@farajaholdings.com
   FROM_EMAIL=noreply@farajaholdings.com
   ```

5. Add Persistent Disk (for uploads):
   - Click **Advanced** → **Add Disk**
   - **Name**: uploads-disk
   - **Mount Path**: `/opt/render/project/src/uploads`
   - **Size**: 1 GB (increase as needed)

6. Click **Create Web Service**

## Step 3: Configure SMTP (Gmail Example)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail" application
3. Use this App Password as `SMTP_PASS` in environment variables

## Step 4: Verify Deployment

1. Once deployed, visit your Render URL: `https://your-app.onrender.com`
2. Test the health endpoint: `https://your-app.onrender.com/api/health`
3. Should return: `{"status":"ok","time":"..."}`
4. Navigate to the main site and admin panel

## Step 5: Custom Domain (Optional)

1. In Render Dashboard → Your Service → Settings
2. Scroll to **Custom Domains**
3. Add your domain (e.g., farajaholdings.com)
4. Update DNS records at your domain registrar:
   - Add CNAME record pointing to your Render URL
5. Render will automatically provision SSL certificate

## Troubleshooting

### Database Connection Issues
- Verify all DB_* environment variables are correct
- Check if database allows connections from Render IPs
- Ensure schema is applied (`server/schema.sql`)

### Upload Issues
- Verify persistent disk is mounted correctly
- Check disk path matches Express static configuration
- Consider using cloud storage (AWS S3, Backblaze B2) for production

### Email Not Sending
- Verify SMTP credentials
- Check COMPANY_EMAIL is set correctly
- Monitor Render logs for email errors
- Emails are sent on cart checkout only

### Performance Issues
- Render free tier sleeps after 15 minutes of inactivity
- Upgrade to Starter plan for always-on service
- Consider adding caching layer (Redis) for better performance

## Monitoring

1. View logs: Render Dashboard → Your Service → Logs
2. Set up health checks in Render settings
3. Monitor disk usage if storing uploads

## Maintenance

### Updating the Application
- Push changes to GitHub `main` branch
- Render will auto-deploy (if auto-deploy enabled)
- Or manually deploy from Render Dashboard

### Backing Up Database
- Export regularly: `mysqldump -h HOST -u USER -p DB_NAME > backup.sql`
- Store backups securely

### Backing Up Uploads
- Download from persistent disk periodically
- Consider S3/B2 for automatic backups

## Cost Estimate (Render Starter Plan)
- Web Service: $7/month (always on)
- Persistent Disk (1GB): $0.25/month
- **Total**: ~$7.25/month (use external MySQL provider)

## Support
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
