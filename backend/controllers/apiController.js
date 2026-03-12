const fs = require('fs');
const Syllabus = require('../models/Syllabus');
const Blueprint = require('../models/Blueprint');
const Question = require('../models/Question');
const GeneratedPaper = require('../models/GeneratedPaper');
const pdfService = require('../services/pdfService');
const aiService = require('../services/aiService');
const generatorService = require('../services/generatorService');
const { parsePrompt } = require('../services/promptParserService');
const { generatePaperData } = require('../services/generatorService');
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


exports.uploadPreviousPapers = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        let savedBlueprintId = null;
        let totalQuestionsExtracted = 0;

    
        for (let i = 0; i < req.files.length; i++) {
            const text = await pdfService.extractTextFromPDF(req.files[i].path);
            const { blueprint, questions } = pdfService.parseBlueprintAndQuestions(text);

            if (i === 0 && blueprint.questions.length > 0) {
                const savedBlueprint = new Blueprint({ subject: "Auto-detected Multi-Paper", questions: blueprint.questions });
                await savedBlueprint.save();
                savedBlueprintId = savedBlueprint._id;
            }

            for (const qData of questions) {
                const existing = await Question.findOne({ questionText: qData.questionText });
                
                if (existing) {
                    existing.frequency += 1;
                    existing.important = existing.frequency >= 2;
                    await existing.save();
                } else {
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

        const { blueprintId, prompt } = req.body;

        let rules = null;

        if(prompt && prompt.trim().length > 0){
            rules = await parsePrompt(prompt);
        }

        // generate questions
        const content = await generatePaperData(blueprintId, rules);

        // save in DB
        const paper = new GeneratedPaper({
            subject:"Generated Paper",
            content
        });

        await paper.save();

        console.log("Saved paper id:", paper._id);

        // generate pdf
        const pdfPath = await pdfService.generatePDF(paper._id, content);

        paper.pdfPath = pdfPath;

        await paper.save();

        res.json({
            success:true,
            paperId: paper._id
        });

    }
    catch(err){

        res.status(500).json({
            error:err.message
        });

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