const mongoose = require('mongoose');

const SyllabusSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    topics: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Syllabus', SyllabusSchema);