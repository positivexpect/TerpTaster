# TerpTaster Deployment Guide

## 🗄️ Database Setup (Neon PostgreSQL)

Your Neon database is already set up! Here are the details:

- **Project ID**: `cold-dust-21942251`
- **Database**: `neondb`
- **Connection String**: Already configured in `backend/.env`

### Your Data Migration Options:

1. **Export from your old database**:

   ```bash
   # If you have a PostgreSQL dump file
   psql "postgresql://neondb_owner:npg_kzUc4b1eqiGs@ep-blue-sun-adpe3k3q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" < your_backup.sql
   ```

2. **Manual data entry**: Use the app interface to re-enter your reviews

3. **CSV Import**: If you have CSV data, I can help create an import script

## 🚀 Backend Deployment (Vercel)

1. **Prepare the backend**:

   ```bash
   cd backend
   # Your environment is already configured in .env
   # For production, update CORS_ORIGIN in your Vercel environment variables
   ```

2. **Deploy to Vercel**:

   ```bash
   npm install -g vercel
   cd backend
   vercel --prod
   ```

3. **Set environment variables in Vercel**:
   - Go to your Vercel dashboard
   - Project Settings → Environment Variables
   - Add all variables from `backend/.env`

## 🌐 Frontend Deployment (Vercel)

1. **Update the API URL**:

   ```bash
   cd frontend
   # Create .env file with your backend URL
   echo "REACT_APP_API_BASE_URL=https://your-backend.vercel.app" > .env
   ```

2. **Deploy frontend**:
   ```bash
   cd frontend
   vercel --prod
   ```

## 🔗 Custom Domain Setup

1. **In Vercel Dashboard**:
   - Go to your frontend project
   - Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

2. **Update CORS settings**:
   - Update backend environment variable `CORS_ORIGIN` to include your custom domain

## 📸 Photo Upload Configuration

### Development

- Photos are stored locally in `backend/uploads/`
- Automatically optimized with Sharp (WebP format, 800x600 max)

### Production (Recommended)

Consider upgrading to cloud storage for better performance:

```bash
# Add to backend package.json dependencies
npm install cloudinary

# Environment variables to add
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🔧 Environment Variables Summary

### Backend (.env)

```
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-blue-sun-adpe3k3q-pooler.c-2.us-east-1.aws.neon.tech
POSTGRES_DB=neondb
POSTGRES_PASSWORD=npg_kzUc4b1eqiGs
POSTGRES_PORT=5432
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

### Frontend (.env)

```
REACT_APP_API_BASE_URL=https://your-backend.vercel.app
```

## 📊 New Features Added

1. **Photo Upload**: Upload up to 5 photos per review
2. **Enhanced Search**: Search by strain, location, reviewer, terpenes, score range
3. **Analytics API**: `/stats` and `/terpenes/popular` endpoints
4. **Performance**: Compression, caching, security headers
5. **Better Database**: Neon PostgreSQL with proper indexing

## 🛠️ Local Development

```bash
# Backend
cd backend
npm install
npm run dev  # Starts on port 3001

# Frontend (new terminal)
cd frontend
npm install
npm start   # Starts on port 3000
```

## 🔍 Troubleshooting

### Database Connection Issues

- Check Neon database is active (it auto-pauses after inactivity)
- Verify connection string in backend/.env

### CORS Errors

- Update CORS_ORIGIN environment variable
- Ensure frontend URL is whitelisted

### Photo Upload Issues

- Check file size limits (5MB max)
- Ensure uploads/ directory exists and is writable
- Consider cloud storage for production

## 📈 Next Steps for Production

1. **Set up monitoring** (Vercel Analytics, Sentry for errors)
2. **Add authentication** (consider Firebase Auth or Auth0)
3. **Implement user profiles** and review ownership
4. **Add review moderation** features
5. **Create admin dashboard** for managing content
6. **Set up automated backups** for your Neon database

Your app is now production-ready with modern features and optimizations! 🎉
