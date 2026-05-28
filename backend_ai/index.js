require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

const path = require('path');

require('./conn');
require('./Models/index');

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

const UserRoutes = require('./Routes/user');
const ResumeRoutes = require('./Routes/resume');
const ScreeningRoutes = require('./Routes/screening');

app.use('/api/user', UserRoutes);
app.use('/api/resume', ResumeRoutes);
app.use('/api/screening', ScreeningRoutes);

const frontendBuildPath = path.join(__dirname, '..', 'mern_ai', 'dist');
const fallbackBuildPath = path.join(__dirname, 'build');
const staticBuildPath = require('fs').existsSync(frontendBuildPath)
    ? frontendBuildPath
    : fallbackBuildPath;

app.use(express.static(staticBuildPath));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(staticBuildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log("backend is running on port", PORT);
});
