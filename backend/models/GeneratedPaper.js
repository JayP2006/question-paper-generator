const mongoose = require('mongoose');

const GeneratedPaperSchema = new mongoose.Schema({
    subject: String,
    content: Object, // The populated blueprint
    pdfPath: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GeneratedPaper', GeneratedPaperSchema);