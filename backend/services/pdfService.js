const fs = require("fs");
const pdfParse = require("pdf-parse");
const puppeteer = require("puppeteer");

exports.extractTextFromPDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
};

exports.parseBlueprintAndQuestions = (text) => {
    const blueprint = { questions: [] };
    const questions = [];

    const qBlocks = text.split(/Q\.\d+/).slice(1);

    qBlocks.forEach((block, index) => {
        const parts = [];
        const matches = block.match(/\([a-z]\).*?\d{2}/gs) || [];

        matches.forEach((m) => {
            const label = m.match(/\(([a-z])\)/)[1];

            // FIX 1: take only the last digit (3,4,7) instead of 2 digits
            const marks = parseInt(m.match(/\d$/)[0]);

            const questionText = m
                .replace(/\([a-z]\)/, "")
                .replace(/\d{2}$/, "")
                .trim();

            // FIX 2: prevent duplicate labels
            if (!parts.some(p => p.label === label)) {
                parts.push({ label, marks });

                questions.push({
                    questionText,
                    marks,
                    topic: "Unknown",
                    year: new Date().getFullYear(),
                    frequency: 1,
                    important: false
                });
            }
        });

        blueprint.questions.push({
            number: index + 1,
            parts
        });
    });

    return { blueprint, questions };
};

exports.generatePDF = async (paperId, content) => {

    let html = `
    <html>
    <head>
        <style>
            body { font-family: Arial; margin:40px; }
            h2 { text-align:center; }
            .question { margin-top:20px; }
            .part { margin-left:20px; }
            .marks { float:right; }
        </style>
    </head>
    <body>

    <h2>Generated Question Paper</h2>
    <hr>
    `;

    content.questions.forEach(q => {

        html += `<div class="question"><b>Q${q.number}</b></div>`;

        q.parts.forEach(p => {

            html += `
            <div class="part">
                (${p.label}) ${p.questionText}
                <span class="marks">${p.marks}</span>
            </div>
            `;

        });

    });

    html += `
    </body>
    </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html);

    const filePath = `generated/${paperId}.pdf`;

    await page.pdf({
        path: filePath,
        format: "A4",
        printBackground: true
    });

    await browser.close();

    return filePath;
};