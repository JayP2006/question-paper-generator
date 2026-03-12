const Question = require('../models/Question');
const Syllabus = require('../models/Syllabus');

exports.generatePaperData = async (blueprintId) => {
    const Blueprint = require('../models/Blueprint');
    const blueprint = await Blueprint.findById(blueprintId);
    if (!blueprint) throw new Error("Blueprint not found");

    const syllabus = await Syllabus.findOne(); // Assumes one global syllabus for demo
    const validTopics = syllabus ? syllabus.topics : [];

    const generatedContent = { questions: [] };
    const usedIds = [];

    for (const bq of blueprint.questions) {
        const generatedQ = { number: bq.number, parts: [] };
        
        for (const part of bq.parts) {
            // Find a matching question
            const query = { marks: part.marks, _id: { $nin: usedIds } };
            // Optional: Filter by syllabus if topics exist
            // if (validTopics.length > 0) query.topic = { $in: validTopics };

            const selectedQ = await Question.findOne(query).sort({ important: -1, frequency: -1 });

            if (selectedQ) {
                generatedQ.parts.push({
                    label: part.label,
                    marks: part.marks,
                    questionText: selectedQ.questionText
                });
                usedIds.push(selectedQ._id);
            } else {
                generatedQ.parts.push({
                    label: part.label,
                    marks: part.marks,
                    questionText: "[AI FALLBACK] Generated placeholder question for " + part.marks + " marks."
                });
            }
        }
        generatedContent.questions.push(generatedQ);
    }
    return generatedContent;
};