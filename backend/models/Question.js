const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    marks: { type: Number, required: true },
    topic: { type: String },
    year: { type: Number },
    frequency: { type: Number, default: 1 },
    important: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);