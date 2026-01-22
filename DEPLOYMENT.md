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
   - **Plan**: Free

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

5. Click **Create Web Service**

> **Note**: Free tier does NOT support persistent disks. Uploads will be stored in ephemeral storage and will be lost on restarts. For production, use cloud storage (see below) or upgrade to paid plan.

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
- **Free tier**: Uploads are stored in ephemeral storage and lost on service restarts
- **Recommended**: Use cloud storage (AWS S3, Cloudinary, Backblaze B2) for production
- To implement cloud storage, update the multer configuration in `server/middlewares/upload.js`
- Or upgrade to paid Render plan for persistent disk support

### Email Not Sending
- Verify SMTP credentials
- Check COMPANY_EMAIL is set correctly
- Monitor Render logs for email errors
- Emails are sent on cart checkout only

### Performance Issues (Free Tier)
- **Service sleeps after 15 minutes of inactivity** - First request after sleep takes ~30-60 seconds
- **Build minutes limited** - 750 build hours/month on free tier
- **No persistent disk** - Uploads lost on restart
- To fix: Upgrade to Starter plan ($7/month) for:
  - Always-on service (no sleep)
  - Persistent disk support
  - More build minutes
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
- **Free tier**: No persistent disk - uploads are ephemeral
- **Recommended**: Use cloud storage (S3, Cloudinary, Backblaze B2) to avoid data loss
- Or upgrade to paid plan with persistent disk and backup regularly

## Cost Estimate

### Free Tier (Current Setup)
- Web Service: **$0/month** ✅
- MySQL Database: **$0/month** (using Aiven/PlanetScale free tier) ✅
- **Total**: **FREE**
- **Limitations**:
  - Service sleeps after 15 minutes
  - 750 build hours/month
  - No persistent disk (uploads lost on restart)
  - Shared resources

### Upgrade to Paid (Optional)
- Web Service (Starter): $7/month (always on)
- Persistent Disk (1GB): $0.25/month
- MySQL (External): $0-15/month depending on provider
- **Total**: ~$7-22/month

## Support
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
