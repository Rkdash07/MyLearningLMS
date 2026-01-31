# MERN Stack Deployment Guide (Render.com)

This guide covers deploying your MERN (MongoDB, Express, React, Node.js) stack application to **Render.com** for free.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure Setup](#project-structure-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Root Folder Configuration](#root-folder-configuration)
6. [GitHub Repository Setup](#github-repository-setup)
7. [Render.com Deployment](#rendercom-deployment)
8. [Post-Deployment Configuration](#post-deployment-configuration)

---

## Prerequisites

Before starting, ensure you have:

- **Git** installed on your system
- **Node.js** and **npm** installed
- **GitHub Account** (create at https://github.com/)
- **Render.com Account** (create at https://render.com/)
- **MongoDB Atlas Account** (create at https://mongodb.com/)
- Code editor (VS Code recommended)

### Required Accounts to Create:

1. **MongoDB Atlas** - For cloud MongoDB database
   - Go to https://mongodb.com/
   - Create a free account
   - Create a cluster and get connection URI
   - Add your deployment server IP to IP Whitelist (or use 0.0.0.0/0 for testing)

2. **GitHub** - For version control
   - Go to https://github.com/
   - Create a new account if needed

3. **Render.com** - For deployment
   - Go to https://render.com/
   - Sign up and link your GitHub account

---

## Project Structure Setup

### Create Root Directory

```bash
mkdir mern-deploy
cd mern-deploy
```

Your final project structure will be:

```
mern-deploy/
├── backend/
│   ├── node_modules/
│   ├── .env
│   ├── app.js
│   └── package.json
├── client/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

---

## Backend Setup

### Step 1: Create Backend Folder

```bash
cd mern-deploy
mkdir backend
cd backend
```

### Step 2: Initialize Node.js Project

```bash
npm init -y
```

### Step 3: Install Backend Dependencies

```bash
npm install express mongoose dotenv cors
```

**Backend Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.x | Web framework for Node.js |
| mongoose | ^7.x | MongoDB object modeling |
| dotenv | ^16.x | Environment variable management |
| cors | ^2.x | Cross-Origin Resource Sharing |

**Optional Dependencies (for your project):**

```bash
npm install bcryptjs jsonwebtoken multer cloudinary dotenv
```

| Package | Version | Purpose |
|---------|---------|---------|
| bcryptjs | ^2.4.x | Password hashing |
| jsonwebtoken | ^9.x | JWT authentication |
| multer | ^1.x | File upload handling |
| cloudinary | ^1.x | Cloud media storage |

### Step 4: Create .env File

Create a `.env` file in the backend folder:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=4000
NODE_ENV=production
```

**Important:** Replace `your_mongodb_connection_string` with your actual MongoDB URI from MongoDB Atlas.

### Step 5: Create app.js

Create `app.js` file with the following code:

```javascript
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Middleware
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
};

app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`App is Listening on PORT ${PORT}`);
        });
    })
    .catch(err => {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    });

// Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Connected to Backend!" });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
```

### Step 6: Update backend package.json

Update your `package.json` to include:

```json
{
  "name": "securelms-backend",
  "version": "1.0.0",
  "description": "SecureLMS Backend",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.33.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

---

## Frontend Setup

### Step 1: Create Frontend (from root directory)

```bash
cd ..
npx create-react-app client
cd client
```

### Step 2: Update App.js

Update your `client/src/App.js`:

```javascript
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    
    fetch(`${backendURL}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching from backend:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {message && <h1>{message}</h1>}
    </div>
  );
}

export default App;
```

### Step 3: Create .env for Frontend

Create `client/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:4000
```

**Note:** This will be updated after backend deployment to the actual Render URL.

### Step 4: Frontend Dependencies

The default Create React App includes all necessary dependencies:

| Package | Purpose |
|---------|---------|
| react | UI library |
| react-dom | React rendering engine |
| react-scripts | Build tools for React |

**Frontend package.json** (automatically created by CRA):

```json
{
  "name": "securelms-frontend",
  "version": "0.1.0",
  "private": true,
  "proxy": "http://localhost:4000",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### Step 5: Clean Up Frontend Folder

Remove unnecessary files from `client/` folder:

```bash
cd client
rm -rf .git
rm .gitignore
cd ..
```

---

## Root Folder Configuration

### Step 1: Initialize Root package.json

From the root directory (`mern-deploy`):

```bash
npm init -y
```

### Step 2: Create Root .gitignore

Create `.gitignore` in the root folder:

```
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
build
dist
client/build

# Misc
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

.DS_Store
*.pem

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# IDE
.vscode
.idea
*.swp
*.swo

# OS
Thumbs.db
```

### Step 3: Update Root package.json

Update the root `package.json`:

```json
{
  "name": "securelms",
  "version": "1.0.0",
  "description": "SecureLMS - MERN Stack Application",
  "main": "backend/app.js",
  "scripts": {
    "install-server": "cd backend && npm install",
    "install-client": "cd client && npm install",
    "install-all": "npm install && npm run install-server && npm run install-client",
    "start-server": "cd backend && node app.js",
    "start-client": "cd client && npm start",
    "dev-server": "cd backend && nodemon app.js",
    "dev-client": "cd client && npm start",
    "build-client": "cd client && npm run build",
    "build": "npm run install-server && npm run build-client",
    "start": "npm run start-server"
  },
  "keywords": ["mern", "react", "node", "mongodb"],
  "author": "",
  "license": "ISC",
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

---

## GitHub Repository Setup

### Step 1: Initialize Git Repository

From root directory:

```bash
git init
git add .
git commit -m "Initial commit: MERN stack setup"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository with your desired name (e.g., `securelms`)
3. Do NOT initialize with README or .gitignore (we already have them)

### Step 3: Connect Local Repository to GitHub

Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME`:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git branch -M main
git push -u origin main
```

**Example:**

```bash
git remote add origin https://github.com/john-doe/securelms.git
git branch -M main
git push -u origin main
```

---

## Render.com Deployment

### Phase 1: Deploy Backend

#### Step 1: Create Web Service for Backend

1. Go to https://render.com/dashboard
2. Click "New" → Select "Web Service"
3. Connect your GitHub account and select your repository

#### Step 2: Configure Backend Deployment

Fill in the following fields:

| Field | Value |
|-------|-------|
| **Name** | `securelms-backend` (or your desired name) |
| **Environment** | Node |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && node app.js` |
| **Runtime** | Node |

#### Step 3: Add Environment Variables

Click on "Advanced" and add:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | From MongoDB Atlas dashboard |
| `PORT` | `4000` | Default port |
| `NODE_ENV` | `production` | Production environment |
| `FRONTEND_URL` | Leave empty for now | Will update after frontend deployment |

**How to get MongoDB URI:**

1. Go to MongoDB Atlas (https://mongodb.com/)
2. Connect to your cluster
3. Copy the connection string
4. Replace `<password>` with your database password
5. Format: `mongodb+srv://username:password@cluster.mongodb.net/databasename`

#### Step 4: Deploy Backend

Click "Create Web Service" and wait for deployment to complete (usually 2-5 minutes).

Once deployed, note your backend URL: `https://your-backend-name.onrender.com`

**Update environment variable:**
- Go back to your backend service settings
- Update `FRONTEND_URL` with your frontend URL (after deploying frontend)

---

### Phase 2: Deploy Frontend

#### Step 1: Create Static Site for Frontend

1. Go to https://render.com/dashboard
2. Click "New" → Select "Static Site"
3. Select your GitHub repository

#### Step 2: Configure Frontend Deployment

Fill in the following fields:

| Field | Value |
|-------|-------|
| **Name** | `securelms-frontend` (or your desired name) |
| **Build Command** | `cd client && npm install && npm run build` |
| **Publish Directory** | `client/build` |
| **Runtime** | Node |

#### Step 3: Deploy Frontend

Click "Create Static Site" and wait for deployment to complete.

Once deployed, note your frontend URL: `https://your-frontend-name.onrender.com`

---

## Post-Deployment Configuration

### Step 1: Update Backend CORS

Update your `backend/.env` on Render.com dashboard:

```env
MONGODB_URI=your_mongodb_uri
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-name.onrender.com
```

### Step 2: Update Frontend API URL

In your local repository, update `client/.env`:

```env
REACT_APP_BACKEND_URL=https://your-backend-name.onrender.com
```

### Step 3: Redeploy with Updated Configuration

Push changes to GitHub:

```bash
git add .
git commit -m "Update API URLs for production"
git push origin main
```

Both Render services will automatically redeploy with the new configuration.

---

## Testing Your Deployment

### Backend Testing

Visit your backend URL in the browser:
```
https://your-backend-name.onrender.com
```

Expected response:
```json
{
  "message": "Connected to Backend!"
}
```

### Frontend Testing

Visit your frontend URL:
```
https://your-frontend-name.onrender.com
```

You should see the message from the backend displayed on the page.

---

## Troubleshooting

### Backend Won't Start

1. Check the "Logs" tab in Render dashboard
2. Verify MongoDB URI is correct
3. Ensure all environment variables are set
4. Check `backend/app.js` for syntax errors

### Frontend Not Connecting to Backend

1. Verify `REACT_APP_BACKEND_URL` is set correctly
2. Check backend CORS configuration allows frontend URL
3. Rebuild and redeploy frontend: `git push origin main`

### MongoDB Connection Error

1. Verify connection string in `.env`
2. Check IP Whitelist in MongoDB Atlas (allow 0.0.0.0/0 or Render's IPs)
3. Ensure credentials are correct in URI

### 502 Bad Gateway Error

1. Service might be spinning up (wait 30 seconds)
2. Check application logs
3. Verify build command executed successfully
4. Ensure start command is correct

---

## Production Best Practices

### Security

1. Use strong MongoDB passwords
2. Never commit `.env` files (use `.gitignore`)
3. Use HTTPS for all connections
4. Set NODE_ENV to `production`
5. Implement authentication and authorization

### Performance

1. Enable compression: `app.use(compression())`
2. Use a production database (MongoDB Atlas)
3. Implement caching strategies
4. Optimize images and assets
5. Monitor application logs regularly

### Monitoring

1. Check Render logs regularly
2. Set up error tracking (Sentry, etc.)
3. Monitor MongoDB performance
4. Track API response times

---

## Complete Dependencies Summary

### Backend Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "multer": "^1.4.5-lts.1",
  "cloudinary": "^1.33.0"
}
```

### Frontend Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-scripts": "5.0.1"
}
```

### System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **MongoDB**: 4.4 or higher
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

---

## Useful Links

- **Render.com Docs**: https://render.com/docs
- **MongoDB Atlas**: https://mongodb.com/
- **Express.js Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/

---

## Support & Resources

For deployment issues:
1. Check Render.com documentation
2. Review application logs
3. Verify environment variables
4. Ensure GitHub repo structure matches expected layout

Happy Deploying! 🚀
