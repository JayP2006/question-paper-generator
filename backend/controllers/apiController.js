const fs = require('fs');
const Syllabus = require('../models/Syllabus');
const Blueprint = require('../models/Blueprint');
const Question = require('../models/Question');
const GeneratedPaper = require('../models/GeneratedPaper');
const pdfService = require('../services/pdfService');
const aiService = require('../services/aiService');
const generatorService = require('../services/generatorService');

exports.uploadSyllabus = async (req, res) => {
    try {
        const text = await pdfService.extractTextFromPDF(req.file.path);
        const topics = await aiService.extractTopicsFromSyllabus(text);
        
        const syllabus = new Syllabus({ subject: req.body.subject || "Unknown", topics });
        await syllabus.save();
        
        res.status(200).json({ message: "Syllabus processed", syllabus });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

// Replace your old export.uploadPreviousPaper with this:

exports.uploadPreviousPapers = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        let savedBlueprintId = null;
        let totalQuestionsExtracted = 0;

        // Loop through all uploaded PDFs
        for (let i = 0; i < req.files.length; i++) {
            const text = await pdfService.extractTextFromPDF(req.files[i].path);
            const { blueprint, questions } = pdfService.parseBlueprintAndQuestions(text);

            // Extract Blueprint ONLY from the first paper to set the pattern
            if (i === 0 && blueprint.questions.length > 0) {
                const savedBlueprint = new Blueprint({ subject: "Auto-detected Multi-Paper", questions: blueprint.questions });
                await savedBlueprint.save();
                savedBlueprintId = savedBlueprint._id;
            }

            // Extract and save Questions from ALL papers
            for (const qData of questions) {
                // Check if this question already exists in our database
                const existing = await Question.findOne({ questionText: qData.questionText });
                
                if (existing) {
                    // If it exists, increase frequency and mark as important
                    existing.frequency += 1;
                    existing.important = existing.frequency >= 2;
                    await existing.save();
                } else {
                    // Otherwise, add it as a new question
                    await Question.create(qData);
                }
                totalQuestionsExtracted++;
            }
        }

        res.status(200).json({ 
            message: `Successfully analyzed ${req.files.length} papers.`, 
            totalQuestionsAdded: totalQuestionsExtracted,
            blueprintId: savedBlueprintId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.generatePaper = async (req, res) => {
    try {
        const { blueprintId } = req.body;
        const content = await generatorService.generatePaperData(blueprintId);
        
        const paper = new GeneratedPaper({ subject: "Generated Paper", content });
        await paper.save();

        const pdfPath = await pdfService.generatePDF(paper._id, content);
        paper.pdfPath = pdfPath;
        await paper.save();

        res.status(200).json({ message: "Paper generated", paperId: paper._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.downloadPaper = async (req, res) => {
    try {
        const paper = await GeneratedPaper.findById(req.params.id);
        if (!paper || !paper.pdfPath) return res.status(404).json({ error: "Paper not found" });
        res.download(paper.pdfPath);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getQuestions = async (req, res) => {
    const questions = await Question.find();
    res.json(questions);
};