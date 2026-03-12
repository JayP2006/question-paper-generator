const mongoose = require('mongoose');

const BlueprintSchema = new mongoose.Schema({
    subject: { type: String },
    questions: [{
        number: Number,
        parts: [{
            label: String,
            marks: Number
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Blueprint', BlueprintSchema);