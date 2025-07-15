# 📸 TerpTaster Storage Setup Guide

## Current Setup (Development)

Your app currently stores photos **locally** in `backend/uploads/` directory. This works great for development but needs upgrading for production.

## 🚀 Production Storage Options

### Option 1: Vercel Blob Storage (Recommended) ✅

**Why it's best:**

- ✅ **Seamless Vercel integration**
- ✅ **Automatic CDN distribution**
- ✅ **Pay-as-you-go pricing**
- ✅ **No configuration complexity**

**Setup:**

```bash
# 1. Install Vercel Blob
cd backend
npm install @vercel/blob

# 2. Add to your Vercel project dashboard:
# Environment Variables → Add:
# BLOB_READ_WRITE_TOKEN=your_token_from_vercel
```

**Code Integration:**

```javascript
// backend/server.js - Replace current upload endpoint
import { put } from "@vercel/blob";

app.post("/upload", upload.array("photos", 5), async (req, res) => {
  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      // Process with Sharp
      const processedBuffer = await sharp(file.buffer)
        .resize(800, 600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to Vercel Blob
      const { url } = await put(`photos/${uuidv4()}.webp`, processedBuffer, {
        access: "public",
      });

      uploadedFiles.push({ url, originalName: file.originalname });
    }

    res.json({ files: uploadedFiles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Option 2: Cloudinary (Feature-Rich) 🎨

**Why it's great:**

- ✅ **Advanced image transformations**
- ✅ **Automatic optimization**
- ✅ **Built-in CDN**
- ✅ **Free tier: 25GB storage, 25GB bandwidth**

**Setup:**

```bash
# 1. Sign up at cloudinary.com
# 2. Install package
cd backend
npm install cloudinary

# 3. Add environment variables:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Code Integration:**

```javascript
// backend/cloudinary-config.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload endpoint
app.post("/upload", upload.array("photos", 5), async (req, res) => {
  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "terptaster",
          transformation: [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto:good", format: "webp" },
          ],
        },
        (error, result) => {
          if (error) throw error;
          return result;
        },
      );

      file.stream.pipe(result);
      uploadedFiles.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    res.json({ files: uploadedFiles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Option 3: AWS S3 (Enterprise Scale) 🏢

**When to use:**

- Large scale deployment
- Need advanced permissions
- Already using AWS infrastructure

**Setup:**

```bash
npm install aws-sdk

# Environment variables:
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=terptaster-photos
```

## 🔧 Implementation Steps

### Step 1: Choose Your Storage Solution

- **Small/Medium App**: Vercel Blob
- **Need Image Processing**: Cloudinary
- **Enterprise**: AWS S3

### Step 2: Update Backend Code

Replace the current upload logic with your chosen solution (examples above).

### Step 3: Update Database Schema

```sql
-- Already done! Your photos column stores URLs
ALTER TABLE weed_reviews
ADD COLUMN IF NOT EXISTS photos TEXT[];
```

### Step 4: Update Frontend (if needed)

Your frontend is already compatible! It just stores URLs.

### Step 5: Migration Strategy

```javascript
// If you have existing local photos, migrate them:
const migrateLocalPhotos = async () => {
  const fs = require("fs");
  const path = require("path");

  const uploadsDir = path.join(__dirname, "uploads");
  const files = fs.readdirSync(uploadsDir);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const buffer = fs.readFileSync(filePath);

    // Upload to your chosen service
    const { url } = await uploadToService(buffer, file);

    // Update database records
    await pool.query(
      "UPDATE weed_reviews SET photos = array_append(photos, $1) WHERE photos @> ARRAY[$2]",
      [url, `/uploads/${file}`],
    );
  }
};
```

## 💰 Cost Comparison

| Service         | Free Tier                     | Paid Plans           |
| --------------- | ----------------------------- | -------------------- |
| **Vercel Blob** | 5GB                           | $20/month for 100GB  |
| **Cloudinary**  | 25GB storage + 25GB bandwidth | $89/month for 150GB  |
| **AWS S3**      | 5GB (first year)              | ~$23/month for 100GB |

## 🚀 Quick Setup (Recommended)

**For immediate deployment, use Vercel Blob:**

```bash
# 1. In your Vercel dashboard:
#    - Go to your backend project
#    - Settings → Environment Variables
#    - Add: BLOB_READ_WRITE_TOKEN (get from Vercel Blob dashboard)

# 2. Update backend/package.json:
npm install @vercel/blob

# 3. Replace upload endpoint with Vercel Blob code (see above)

# 4. Deploy:
vercel --prod
```

## 🔍 Testing Your Setup

```bash
# Test photo upload
curl -X POST http://localhost:3001/upload \
  -F "photos=@test-image.jpg" \
  -H "Content-Type: multipart/form-data"

# Should return:
{
  "files": [
    {
      "url": "https://your-storage-url/photo.webp",
      "originalName": "test-image.jpg"
    }
  ]
}
```

## 📱 PWA Icon Setup Complete! ✅

Your PWA is now configured with:

- ✅ **Custom manifest** with TerpTaster branding
- ✅ **Service worker** for offline functionality
- ✅ **Apple touch icons** for iOS
- ✅ **Meta tags** for social sharing
- ✅ **Theme colors** matching your brand

Users can now **"Add to Home Screen"** on mobile devices!

## 🎯 Next Steps

1. **Choose storage solution** (Vercel Blob recommended)
2. **Update upload endpoint** with chosen service
3. **Test photo uploads** work correctly
4. **Deploy to production**
5. **Test PWA installation** on mobile

Your TerpTaster app is now production-ready with professional storage and PWA capabilities! 🌿✨
