# Image Upload Storage Configuration

## Current Setup Issue
Images uploaded through the admin dashboard are stored in the `/uploads` folder on the server. However, **on serverless or ephemeral hosting platforms (Render, Heroku, etc.), the `/uploads` folder is deleted on server restart or redeploy**.

## Solution 1: Render Persistent Disk (Current Setup)
The `render.yaml` file has been updated to include persistent disk mounting:
- **Disk Name**: `uploads-disk`
- **Size**: 10 GB
- **Mount Path**: `/opt/render/project/src/uploads`

### Steps to Enable:
1. Commit and push changes to GitHub
2. Go to Render Dashboard → Select your service
3. Go to Disks tab
4. Create a new disk: `uploads-disk` (10 GB)
5. Set mount path: `/opt/render/project/src/uploads`
6. Redeploy the service

This ensures uploaded images persist even after server restarts.

## Solution 2: Cloud Storage (Recommended for Production)
For larger scale applications, use cloud object storage:

### Option A: Cloudinary (Free tier available)
```javascript
// Install: npm install cloudinary multer-storage-cloudinary
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'faraja-holdings',
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
});
```

### Option B: AWS S3
```javascript
// Install: npm install aws-sdk multer-s3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET,
  acl: 'public-read',
  key: (req, file, cb) => {
    cb(null, `uploads/${Date.now()}-${file.originalname}`);
  }
});
```

## File Structure
```
/uploads/          ← Uploaded images stored here (persistent on Render)
/server/
  /middlewares/
    upload.js      ← Multer configuration
  /controllers/
    productsController.js  ← Handles image path storage
```

## Database Storage
Product images are stored in the database:
```sql
products.image_path VARCHAR(255)  -- stores: /uploads/filename-1234567890.jpg
```

## Testing Upload Persistence
1. Upload an image through admin dashboard
2. Note the image file name (check browser network tab)
3. Restart the server: `npm start`
4. Verify the image still appears on products page
5. (Production) After redeploy on Render, verify image persists

## Troubleshooting

### Images disappear after server restart
- ✅ Local dev: Normal behavior (use persistent disk or cloud storage)
- ✅ Render: Configure persistent disk as above
- ✅ Production: Implement cloud storage solution

### Images don't display at all
- Check that `/uploads` static route is configured in `server/index.js`
- Verify file paths in database: `SELECT image_path FROM products;`
- Check file permissions: `ls -la uploads/`

### Upload fails
- Check `/middlewares/upload.js` configuration
- Verify file size < 5MB (configured limit)
- Ensure image format is: PNG, JPG, JPEG, GIF, or WEBP

## Next Steps
1. For development: Use local `/uploads` folder
2. For Render production: Set up persistent disk (above)
3. For scaling: Migrate to Cloudinary or AWS S3

