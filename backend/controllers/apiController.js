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
            console.log(blueprint);
            if (i === 0 && blueprint.questions.length > 0) {
                const savedBlueprint = new Blueprint({ subject: "Auto-detected Multi-Paper", questions: blueprint.questions });
                await savedBlueprint.save();
                savedBlueprintId = savedBlueprint._id;
                console.log("Saved blueprint id:", savedBlueprintId);
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
        console.log(savedBlueprintId)
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

    console.log("BODY:", req.body);

    const { blueprintId, prompt } = req.body;

    console.log("Blueprint ID:", blueprintId);

    let rules = null;

    if (prompt && prompt.trim().length > 0) {
      rules = await parsePrompt(prompt);
    }

    const content = await generatePaperData(blueprintId, rules);

    console.log("Generated Content:", content);

    const paper = new GeneratedPaper({
  subject: req.body.paperConfig?.subject || "Generated Paper",
  totalMarks: req.body.paperConfig?.totalMarks || 0,
  content
});
    await paper.save();

    const pdfPath = await pdfService.generatePDF(paper._id, content);

    paper.pdfPath = pdfPath;
    await paper.save();

    res.json({
      success: true,
      paperId: paper._id
    });

  } catch (err) {
    console.error("GENERATION ERROR:", err);

    res.status(500).json({
      error: err.message
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
  try {

    const questions = await Question.find().sort({ marks: 1 });

    res.json({
      success: true,
      questions
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};
exports.getGeneratedPapers = async (req, res) => {
  try {

    const papers = await GeneratedPaper.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      papers
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};
exports.deletePaper = async (req, res) => {

  try {

    const paper = await GeneratedPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    if (paper.pdfPath && fs.existsSync(paper.pdfPath)) {
      fs.unlinkSync(paper.pdfPath);
    }

    await GeneratedPaper.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Paper deleted"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};
exports.getAnalytics = async (req, res) => {
  try {

    const questions = await Question.find();
    const papers = await GeneratedPaper.find();

    /* -------- Topic Coverage -------- */

    const topicMap = {};

    questions.forEach(q => {
      const topic = q.unit || "Other";
      topicMap[topic] = (topicMap[topic] || 0) + 1;
    });

    const topicData = Object.keys(topicMap).map(t => ({
      topic: t,
      count: topicMap[t]
    }));


    /* -------- Difficulty Distribution -------- */

    const difficultyMap = { Easy: 0, Medium: 0, Hard: 0 };

    questions.forEach(q => {
      if (q.difficulty && difficultyMap[q.difficulty] !== undefined) {
        difficultyMap[q.difficulty]++;
      }
    });

    const difficultyData = Object.keys(difficultyMap).map(d => ({
      name: d,
      value: difficultyMap[d]
    }));


    /* -------- Paper Generation Trend -------- */

    const monthMap = {};

    papers.forEach(p => {

      const month = new Date(p.createdAt)
        .toLocaleString('default', { month: 'short' });

      monthMap[month] = (monthMap[month] || 0) + 1;

    });

    const trendData = Object.keys(monthMap).map(m => ({
      month: m,
      papers: monthMap[m]
    }));


    res.json({
      topicData,
      difficultyData,
      trendData
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};
exports.getDashboardStats = async (req, res) => {
  try {

    const totalSyllabus = await Syllabus.countDocuments();
    const totalPapers = await Blueprint.countDocuments();
    const totalGenerated = await GeneratedPaper.countDocuments();
    const questionBank = await Question.countDocuments();

    /* -------- Papers Generated This Week -------- */

    const papers = await GeneratedPaper.find();

    const weekMap = {
      Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0,Sun:0
    };

    papers.forEach(p => {
      const day = new Date(p.createdAt)
        .toLocaleString('default',{ weekday:'short' });

      if(weekMap[day] !== undefined) {
        weekMap[day]++;
      }
    });

    const barData = Object.keys(weekMap).map(d => ({
      day:d,
      papers:weekMap[d]
    }));


    /* -------- Difficulty Distribution -------- */

    const questions = await Question.find();

    const diffMap = { Easy:0, Medium:0, Hard:0 };

    questions.forEach(q=>{
      if(q.difficulty && diffMap[q.difficulty] !== undefined){
        diffMap[q.difficulty]++;
      }
    });

    const pieData = Object.keys(diffMap).map(d => ({
      name:d,
      value:diffMap[d]
    }));


    /* -------- Recent Activity -------- */

    const recentPapers = await GeneratedPaper
      .find()
      .sort({createdAt:-1})
      .limit(5);

    const activity = recentPapers.map(p => ({
      text:`Generated paper for ${p.subject}`,
      time:new Date(p.createdAt).toLocaleString()
    }));


    res.json({
      totalSyllabus,
      totalPapers,
      totalGenerated,
      questionBank,
      barData,
      pieData,
      activity
    });

  } catch(err) {

    res.status(500).json({ error: err.message });

  }
};
exports.updateProfile = async (req, res) => {

  try {

    const User = require('../models/User');

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        returnDocument: 'after'
      }
    );

    res.json({
      success: true,
      user
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};