const { ScreeningSession, ScreeningCandidate } = require('../Models/index');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { CohereClient } = require('cohere-ai');
const { Parser } = require('json2csv');
const XLSX = require('xlsx');

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

/**
 * Extract text from a file based on its extension.
 * Supports PDF (.pdf) and Word documents (.doc, .docx).
 */
async function extractText(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } else if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } else {
        throw new Error(`Unsupported file type: ${ext}`);
    }
}

/**
 * Send a single resume + JD to Cohere for analysis and parse the JSON response.
 * Includes one retry on parse failure.
 */
async function analyzeResume(resumeText, jobDescription, retryCount = 0) {
    const prompt = `You are an expert HR analyst and resume screening assistant.
Analyze the following resume against the provided job description and return a JSON object with EXACTLY this structure (no extra text, only valid JSON):

{
  "extractedName": "Candidate full name from resume",
  "matchScore": 75,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "experienceRelevance": "Brief assessment of experience relevance",
  "educationAlignment": "Brief assessment of education alignment",
  "summary": "2-3 sentence overall assessment"
}

IMPORTANT: matchScore must be an integer from 0 to 100. Return ONLY the JSON object, no other text.

Resume:
${resumeText.substring(0, 3000)}

Job Description:
${jobDescription.substring(0, 2000)}`;

    const response = await cohere.chat({
        model: 'command-r7b-12-2024',
        message: prompt,
        maxTokens: 300,
        temperature: 0.5,
    });

    const rawText = response.text.trim();

    try {
        // Try to extract JSON from the response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON object found in response');
        }
        const parsed = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (typeof parsed.matchScore !== 'number') {
            parsed.matchScore = parseInt(parsed.matchScore) || 0;
        }
        parsed.matchScore = Math.max(0, Math.min(100, parsed.matchScore));
        parsed.matchingSkills = Array.isArray(parsed.matchingSkills) ? parsed.matchingSkills : [];
        parsed.missingSkills = Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [];
        parsed.extractedName = parsed.extractedName || 'Unknown';
        parsed.experienceRelevance = parsed.experienceRelevance || 'N/A';
        parsed.educationAlignment = parsed.educationAlignment || 'N/A';
        parsed.summary = parsed.summary || 'No summary available';

        return parsed;
    } catch (parseErr) {
        if (retryCount < 1) {
            console.log('Retrying Cohere analysis due to parse error...');
            return analyzeResume(resumeText, jobDescription, retryCount + 1);
        }
        // Return a fallback result on final failure
        return {
            extractedName: 'Unknown',
            matchScore: 0,
            matchingSkills: [],
            missingSkills: [],
            experienceRelevance: 'Analysis failed',
            educationAlignment: 'Analysis failed',
            summary: `Failed to parse AI response: ${parseErr.message}`,
        };
    }
}

/**
 * Clean up uploaded temp files
 */
function cleanupFiles(files) {
    if (!files) return;
    const allFiles = [];
    if (files.resumes) allFiles.push(...files.resumes);
    if (files.jdFile) allFiles.push(...files.jdFile);

    for (const file of allFiles) {
        try {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        } catch (err) {
            console.error(`Failed to cleanup file ${file.path}:`, err.message);
        }
    }
}

/**
 * POST /api/screening/screen
 * Screen multiple resumes against a job description.
 */
exports.screenResumes = async (req, res) => {
    try {
        const { jobDescription, sessionName } = req.body;
        const files = req.files;

        if (!files || !files.resumes || files.resumes.length === 0) {
            return res.status(400).json({ error: 'No resume files uploaded' });
        }

        // Get job description text (from text field or uploaded JD file)
        let jdText = jobDescription || '';
        let jdFileName = null;

        if (files.jdFile && files.jdFile.length > 0) {
            jdFileName = files.jdFile[0].originalname;
            try {
                jdText = await extractText(files.jdFile[0].path);
            } catch (err) {
                cleanupFiles(files);
                return res.status(400).json({ error: `Failed to parse JD file: ${err.message}` });
            }
        }

        if (!jdText || jdText.trim().length === 0) {
            cleanupFiles(files);
            return res.status(400).json({ error: 'Job description is required (text or file)' });
        }

        // Create screening session
        const session = await ScreeningSession.create({
            jobDescription: jdText,
            jdFileName: jdFileName,
            sessionName: sessionName || `Screening ${new Date().toLocaleString()}`,
        });

        // Process each resume
        const candidates = [];
        for (const resumeFile of files.resumes) {
            try {
                const resumeText = await extractText(resumeFile.path);
                const analysis = await analyzeResume(resumeText, jdText);

                const candidate = await ScreeningCandidate.create({
                    sessionId: session.id,
                    originalName: resumeFile.originalname,
                    extractedName: analysis.extractedName,
                    resumeText: resumeText,
                    matchScore: analysis.matchScore,
                    matchingSkills: analysis.matchingSkills,
                    missingSkills: analysis.missingSkills,
                    experienceRelevance: analysis.experienceRelevance,
                    educationAlignment: analysis.educationAlignment,
                    summary: analysis.summary,
                });

                candidates.push(candidate);
            } catch (fileErr) {
                console.error(`Error processing ${resumeFile.originalname}:`, fileErr.message);
                // Create a failed candidate entry
                const candidate = await ScreeningCandidate.create({
                    sessionId: session.id,
                    originalName: resumeFile.originalname,
                    extractedName: 'Error',
                    matchScore: 0,
                    matchingSkills: [],
                    missingSkills: [],
                    experienceRelevance: 'Processing failed',
                    educationAlignment: 'Processing failed',
                    summary: `Error: ${fileErr.message}`,
                });
                candidates.push(candidate);
            }
        }

        // Rank candidates by score (descending)
        candidates.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        for (let i = 0; i < candidates.length; i++) {
            candidates[i].rank = i + 1;
            await candidates[i].save();
        }

        // Cleanup temp files
        cleanupFiles(files);

        // Re-fetch with proper ordering
        const result = await ScreeningSession.findByPk(session.id, {
            include: [{
                model: ScreeningCandidate,
                as: 'candidates',
                order: [['rank', 'ASC']],
            }],
        });

        res.status(200).json({
            message: 'Screening complete',
            data: result,
        });

    } catch (err) {
        console.error(err);
        cleanupFiles(req.files);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

/**
 * GET /api/screening/history
 * Return all screening sessions with candidate count and top score.
 */
exports.getHistory = async (req, res) => {
    try {
        const sessions = await ScreeningSession.findAll({
            order: [['createdAt', 'DESC']],
            include: [{
                model: ScreeningCandidate,
                as: 'candidates',
                attributes: ['id', 'matchScore', 'extractedName', 'originalName', 'rank'],
            }],
        });

        const result = sessions.map(session => {
            const sessionData = session.toJSON();
            const candidateCount = sessionData.candidates ? sessionData.candidates.length : 0;
            const topScore = candidateCount > 0
                ? Math.max(...sessionData.candidates.map(c => c.matchScore || 0))
                : 0;

            return {
                id: sessionData.id,
                sessionName: sessionData.sessionName,
                jobDescription: sessionData.jobDescription,
                jdFileName: sessionData.jdFileName,
                createdAt: sessionData.createdAt,
                candidateCount,
                topScore,
            };
        });

        res.status(200).json({ data: result });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

/**
 * GET /api/screening/session/:id
 * Return a single session with all its candidates (eager loaded).
 */
exports.getSession = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await ScreeningSession.findByPk(id, {
            include: [{
                model: ScreeningCandidate,
                as: 'candidates',
                order: [['rank', 'ASC']],
            }],
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.status(200).json({ data: session });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

/**
 * GET /api/screening/export/csv/:sessionId
 * Export session candidates as a CSV file.
 */
exports.exportCSV = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await ScreeningSession.findByPk(sessionId, {
            include: [{
                model: ScreeningCandidate,
                as: 'candidates',
                order: [['rank', 'ASC']],
            }],
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const candidates = session.candidates || [];

        const csvData = candidates.map(c => ({
            Rank: c.rank,
            'Candidate Name': c.extractedName,
            'File Name': c.originalName,
            'Match Score': c.matchScore,
            'Matching Skills': Array.isArray(c.matchingSkills) ? c.matchingSkills.join(', ') : c.matchingSkills,
            'Missing Skills': Array.isArray(c.missingSkills) ? c.missingSkills.join(', ') : c.missingSkills,
            'Experience Relevance': c.experienceRelevance,
            'Education Alignment': c.educationAlignment,
            Summary: c.summary,
        }));

        const fields = [
            'Rank', 'Candidate Name', 'File Name', 'Match Score',
            'Matching Skills', 'Missing Skills', 'Experience Relevance',
            'Education Alignment', 'Summary',
        ];

        const parser = new Parser({ fields });
        const csv = parser.parse(csvData);

        const fileName = `screening_${sessionId}_${Date.now()}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.status(200).send(csv);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

/**
 * GET /api/screening/export/excel/:sessionId
 * Export session candidates as an XLSX file.
 */
exports.exportExcel = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await ScreeningSession.findByPk(sessionId, {
            include: [{
                model: ScreeningCandidate,
                as: 'candidates',
                order: [['rank', 'ASC']],
            }],
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const candidates = session.candidates || [];

        const worksheetData = candidates.map(c => ({
            'Rank': c.rank,
            'Candidate Name': c.extractedName,
            'File Name': c.originalName,
            'Match Score': c.matchScore,
            'Matching Skills': Array.isArray(c.matchingSkills) ? c.matchingSkills.join(', ') : c.matchingSkills,
            'Missing Skills': Array.isArray(c.missingSkills) ? c.missingSkills.join(', ') : c.missingSkills,
            'Experience Relevance': c.experienceRelevance,
            'Education Alignment': c.educationAlignment,
            'Summary': c.summary,
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);

        // Set column widths
        worksheet['!cols'] = [
            { wch: 6 },   // Rank
            { wch: 25 },  // Candidate Name
            { wch: 30 },  // File Name
            { wch: 12 },  // Match Score
            { wch: 35 },  // Matching Skills
            { wch: 35 },  // Missing Skills
            { wch: 40 },  // Experience Relevance
            { wch: 40 },  // Education Alignment
            { wch: 50 },  // Summary
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Screening Results');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        const fileName = `screening_${sessionId}_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.status(200).send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};
