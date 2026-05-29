require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

require('./conn');
require('./Models/index');

app.use(express.json());

// Robust CORS configuration supporting localhost, dynamic FRONTEND_URL, same-origin, and Render subdomains
const corsOptionsDelegate = function (req, callback) {
    const origin = req.header('Origin');
    const host = req.header('host');
    
    let isAllowed = false;
    
    if (!origin) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        isAllowed = true;
    } else {
        const allowedOrigins = [
            "http://localhost:5173",
            process.env.FRONTEND_URL
        ].filter(Boolean);
        
        // 1. Check if in explicit allowed list
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
            isAllowed = true;
        } 
        // 2. Check same-origin (compare origin host with request host)
        else {
            try {
                const originUrl = new URL(origin);
                if (originUrl.host === host) {
                    isAllowed = true;
                }
            } catch (e) {
                // Invalid origin URL, default to false
            }
        }
        
        // 3. Fallback: Automatically allow Render subdomains to prevent easy setup failures
        if (!isAllowed && origin.endsWith('.onrender.com')) {
            isAllowed = true;
        }
    }
    
    if (isAllowed) {
        callback(null, { origin: true, credentials: true });
    } else {
        callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }
};

app.use(cors(corsOptionsDelegate));

// Dedicated Health Check Route for Render monitoring
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

const UserRoutes = require('./Routes/user');
const ResumeRoutes = require('./Routes/resume');
const ScreeningRoutes = require('./Routes/screening');

app.use('/api/user', UserRoutes);
app.use('/api/resume', ResumeRoutes);
app.use('/api/screening', ScreeningRoutes);

// Smart static asset serving with robust checks
const frontendBuildPath = path.join(__dirname, '..', 'mern_ai', 'dist');
const fallbackBuildPath = path.join(__dirname, 'build');
const staticBuildPath = fs.existsSync(frontendBuildPath)
    ? frontendBuildPath
    : fallbackBuildPath;

if (fs.existsSync(staticBuildPath) && fs.readdirSync(staticBuildPath).length > 0) {
    console.log("Serving static files from:", staticBuildPath);
    app.use(express.static(staticBuildPath));
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(staticBuildPath, 'index.html'));
    });
} else {
    console.warn("WARNING: Frontend build directory not found or empty at:", staticBuildPath);
    app.get("/", (req, res) => {
        res.status(200).send("Backend is running successfully! (Frontend build files not found, check build configuration)");
    });
}

app.listen(PORT, () => {
    console.log("backend is running on port", PORT);
});

