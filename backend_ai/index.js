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

// Dynamic CORS configuration to support both local and deployed frontend urls
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    credentials: true,
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
            return callback(null, true);
        }
        return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
}));

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

