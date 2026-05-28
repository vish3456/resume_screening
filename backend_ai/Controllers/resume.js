const { Resume, User } = require('../Models/index');
const multer = require("multer");
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");
const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

exports.addResume = async (req, res) => {
    let pdfPath;

    try {
        const { job_desc, user } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Resume PDF is required' });
        }

        if (!job_desc || !user) {
            return res.status(400).json({ error: 'Job description and user are required' });
        }

        if (!process.env.COHERE_API_KEY) {
            return res.status(500).json({ error: 'COHERE_API_KEY is not configured' });
        }

        pdfPath = req.file.path;
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdfParse(pdfBuffer);

        const prompt = `
            You are a resume screening assistant.
            Compare the following resume text with the provided Job Description (JD) and give a match score (0-100) and feedback.

            Resume:
            ${pdfData.text}

            Job Description:
            ${job_desc}

            Return the score and a brief explanation in this format:
            Score: XX
            Reason: ...

            `;

        const response = await cohere.chat({
            model: "command-r7b-12-2024",
            message: prompt,
            maxTokens: 100,
            temperature: 0.7,
        });

        let result = response.text;

        const scoreMatch = result.match(/Score:\s*(\d{1,3})/i) || result.match(/\b(\d{1,3})\s*%?/);
        const score = scoreMatch ? Math.min(Number(scoreMatch[1]), 100) : 0;
        const reasonMatch = result.match(/Reason:\s*([\s\S]*)/i);
        const feedback = reasonMatch ? reasonMatch[1].trim() : result.trim();

        const newResume = await Resume.create({
            userId: user,
            resume_name: req.file.originalname,
            job_desc,
            score: String(score),
            feedback,
        });

        if (pdfPath && fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }

        res.status(200).json({ message: "Your analysis are ready", data: newResume });

    } catch (err) {
        console.log(err);
        if (pdfPath && fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getAllResumesForUser = async (req, res) => {
    try {
        const { user } = req.params;

        if (!user) {
            return res.status(400).json({ error: 'User id is required' });
        }

        const resumes = await Resume.findAll({
            where: { userId: user },
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json({
            message: 'Resume history fetched successfully',
            data: resumes,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getResumeForAdmin = async (req, res) => {
    try {
        const resumes = await Resume.findAll({
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                attributes: ['id', 'name', 'email', 'photoUrl'],
            }],
        });

        return res.status(200).json({
            message: 'All resume history fetched successfully',
            data: resumes,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
}
