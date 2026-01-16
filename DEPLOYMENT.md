# Deployment Documentation

## Backend Deployment (Railway/Render/Heroku)

### Environment Variables Required:
```
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://karnikkhanwilkar:karnik2712@habittracker.r9lpf1p.mongodb.net/?appName=habitTracker
JWT_SECRET=your-super-secure-jwt-secret-here
GMAIL_USER=karnikbgmi.gaming@gmail.com
GMAIL_APP_PASSWORD=vhdwxkbocjgabqov
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=karnikbgmi.gaming@gmail.com
FRONTEND_URL=https://habit-tracker-taupe-eta.vercel.app
```

### Railway Deployment Steps:
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Render Deployment Steps:
1. Connect GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

## Frontend Deployment (Vercel/Netlify)

### Environment Variables Required:
```
VITE_API_URL=https://your-backend-domain.com/api
```

### Vercel Deployment Steps:
1. Connect GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable

### Build Output:
- Frontend builds to `dist/` folder
- Static files ready for CDN deployment

## Database:
- MongoDB Atlas already configured
- Connection string in environment variables
- No additional setup required

## Security:
- CORS configured for production domains
- Rate limiting enabled
- Helmet security headers
- JWT token authentication